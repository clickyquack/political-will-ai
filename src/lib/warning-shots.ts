import { z } from "astro/zod";
import events from "../data/warning-shots-timeline.json";

/** Add or remove events in src/data/warning-shots-timeline.json. `references` lists other event ids. Editorial source: notes/warning-shots-timeline.md. */
export const warningShotKinds = [
  "incident",
  "press",
  "policy",
  "advocacy",
  "lab",
] as const;

export type WarningShotKind = (typeof warningShotKinds)[number];

export const WARNING_SHOT_KIND_LABELS: Record<WarningShotKind, string> = {
  incident: "Incident",
  press: "Press",
  policy: "Political response",
  advocacy: "Advocacy",
  lab: "Lab move",
};

export const politicalActors = ["white-house", "congress", "other"] as const;
export type PoliticalActor = (typeof politicalActors)[number];

export const POLITICAL_ACTOR_LABELS: Record<PoliticalActor, string> = {
  "white-house": "White House",
  congress: "Congress",
  other: "Other",
};

export const responseTypes = ["letter", "bill", "statement", "hearing", "other"] as const;
export type ResponseType = (typeof responseTypes)[number];

export const RESPONSE_TYPE_LABELS: Record<ResponseType, string> = {
  letter: "Letter",
  bill: "Bill",
  statement: "Statement",
  hearing: "Hearing",
  other: "Other",
};

const sourceSchema = z.strictObject({
  label: z.string().min(1),
  url: z.string().url(),
});

const eventSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/, "Use a lowercase id with hyphens"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  dateLabel: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  kind: z.enum(warningShotKinds),
  group: z.string().min(1).optional(),
  sources: z.array(sourceSchema).default([]),
  references: z.array(z.string().min(1)).default([]),
  inferredReferences: z.array(z.string().min(1)).default([]),
  actor: z.enum(politicalActors).optional(),
  responseType: z.enum(responseTypes).optional(),
});

export type WarningShotEvent = z.infer<typeof eventSchema>;

export type EventLink = {
  id: string;
  title: string;
  dateLabel: string;
  inferred: boolean;
};

export type LinkedWarningShot = WarningShotEvent & {
  referenceLinks: EventLink[];
  referencedBy: EventLink[];
};

export type WarningShotGroup = {
  label: string;
  events: LinkedWarningShot[];
};

function monthLabel(date: string) {
  const [year, month] = date.split("-");
  const name = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });
  return `${name} ${year}`;
}

export function loadWarningShots(input: unknown = events): WarningShotGroup[] {
  const parsed = z.array(eventSchema).parse(input);
  const ids = new Set<string>();
  for (const event of parsed) {
    if (ids.has(event.id)) throw new Error(`Duplicate timeline id: ${event.id}`);
    ids.add(event.id);
  }
  for (const event of parsed) {
    for (const ref of event.references) {
      if (ref === event.id) throw new Error(`${event.id} references itself`);
      if (!ids.has(ref)) throw new Error(`${event.id} references unknown event "${ref}"`);
    }
    if (event.kind === "policy" && (!event.actor || !event.responseType)) {
      throw new Error(`${event.id} is a political response and needs an actor and a response type`);
    }
    if (event.kind !== "policy" && (event.actor || event.responseType)) {
      throw new Error(`${event.id} has an actor or response type but is not a political response`);
    }
    for (const ref of event.inferredReferences) {
      if (!event.references.includes(ref)) throw new Error(`${event.id} marks "${ref}" as inferred but does not reference it`);
    }
  }

  const sourceOrder = new Map(parsed.map((event, index) => [event.id, index]));
  const sorted = parsed.toSorted(
    (a, b) => a.date.localeCompare(b.date) || sourceOrder.get(a.id)! - sourceOrder.get(b.id)!,
  );
  const timelineOrder = new Map(sorted.map((event, index) => [event.id, index]));
  const byId = new Map(sorted.map((event) => [event.id, event]));
  const toLink = (id: string, inferred: boolean): EventLink => {
    const event = byId.get(id)!;
    return { id, title: event.title, dateLabel: event.dateLabel, inferred };
  };
  const byTimeline = (a: EventLink, b: EventLink) => timelineOrder.get(a.id)! - timelineOrder.get(b.id)!;

  const linked: LinkedWarningShot[] = sorted.map((event) => ({
    ...event,
    referenceLinks: event.references
      .map((id) => toLink(id, event.inferredReferences.includes(id)))
      .toSorted(byTimeline),
    referencedBy: sorted
      .filter((other) => other.references.includes(event.id))
      .map((other) => toLink(other.id, other.inferredReferences.includes(event.id)))
      .toSorted(byTimeline),
  }));

  const groups: WarningShotGroup[] = [];
  for (const event of linked) {
    const label = event.group ?? monthLabel(event.date);
    const last = groups.at(-1);
    if (!last || last.label !== label) groups.push({ label, events: [event] });
    else last.events.push(event);
  }
  return groups;
}
