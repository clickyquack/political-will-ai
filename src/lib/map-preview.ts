import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import actionsData from "../data/congress/actions.json";
import billsData from "../data/congress/bills.json";
import evidenceData from "../data/congress/evidence.json";
import membersData from "../data/congress/members.json";
import { classifyAll } from "../congress/lib/classify";
import { joinSenateFeatures, type ColoredFeatureProps } from "../congress/lib/geo";
import { STANCE_COLORS, type Bill, type Evidence, type LegislativeAction, type Member } from "../congress/lib/types";

const members = membersData as Member[];
const evidence = evidenceData as Evidence[];
const bills = billsData as Bill[];
const actions = actionsData as LegislativeAction[];

/** Static senate map for the homepage. Same colors and split seats as the full map. */
export function senateMapPreview(): string {
  const topo = JSON.parse(
    readFileSync(join(process.cwd(), "public/geo/states-10m.json"), "utf8"),
  ) as Topology<{ states: GeometryCollection }>;
  const states = feature(topo, topo.objects.states) as unknown as FeatureCollection;
  const stanceById = classifyAll(
    members.map((member) => member.bioguideId),
    evidence,
    actions,
    bills,
  );
  const joined = joinSenateFeatures(states, members, stanceById, "both");
  const width = 960;
  const height = 520;
  const projection = d3.geoAlbersUsa().fitSize([width, height], joined);
  const path = d3.geoPath(projection);
  const clips: string[] = [];
  const fills: string[] = [];

  for (const shape of joined.features) {
    const props = shape.properties as ColoredFeatureProps;
    const outline = path(shape);
    if (!outline || !props.split) continue;
    const bounds = path.bounds(shape);
    const centroid = path.centroid(shape);
    if (!bounds || Number.isNaN(centroid[0])) continue;
    const pad = 4;
    const [[x0, y0], [x1, y1]] = bounds;
    const [cx] = centroid;
    const clipId = `preview-${props.id}`;
    const rect =
      props.split === "west"
        ? { x: x0 - pad, width: Math.max(0, cx - (x0 - pad)) }
        : { x: cx, width: Math.max(0, x1 + pad - cx) };
    clips.push(
      `<clipPath id="${clipId}"><rect x="${rect.x}" y="${y0 - pad}" width="${rect.width}" height="${y1 - y0 + pad * 2}"/></clipPath>`,
    );
    fills.push(
      `<path d="${outline}" clip-path="url(#${clipId})" fill="${STANCE_COLORS[props.stance]}"/>`,
    );
  }

  const outlined = new Map<string, Feature>();
  for (const shape of joined.features) {
    const props = shape.properties as ColoredFeatureProps;
    if (!outlined.has(props.state)) outlined.set(props.state, shape);
  }
  const borders = [...outlined.values()]
    .map((shape) => {
      const outline = path(shape);
      return outline ? `<path d="${outline}" fill="none" stroke="#f6f4ef" stroke-width="1"/>` : "";
    })
    .join("");

  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${clips.join("")}</defs>${fills.join("")}${borders}</svg>`;
}
