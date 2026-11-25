import { sitePath } from "./path";

export const site = {
  name: "Political Will AI",
  description:
    "Research and resources on building political will for AI governance.",
};

export type NavLink = {
  id: string;
  href: string;
  label: string;
};

export type NavGroup = {
  id: string;
  label: string;
  children: NavLink[];
};

export type NavEntry = NavLink | NavGroup;

export function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

export const nav: NavEntry[] = [
  { id: "our-work", href: sitePath("/our-work"), label: "Our Work" },
  { id: "resources", href: sitePath("/resources"), label: "Resources" },
  { id: "blog", href: sitePath("/blog"), label: "Blog" },
  { id: "about", href: sitePath("/about"), label: "About" },
];

/** Sections on the Resources page, in display order. */
export const resourceSections = [
  { id: "reading-list", label: "Reading list" },
  { id: "politician-positions", label: "Politician positions" },
  { id: "proxy-measures", label: "Proxy measures" },
  { id: "newsletters", label: "Newsletters" },
  { id: "misc", label: "Misc" },
];

export const warningShotsTitle =
  "Measuring the Political Impact of the Hugging Face Incident, Coxon Media Frenzy, and Related Events";

export function flattenNav(entries: NavEntry[] = nav): NavLink[] {
  return entries.flatMap((entry) => (isGroup(entry) ? entry.children : [entry]));
}

export function getNavItem(id: string) {
  const item = flattenNav().find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown nav item: ${id}`);
  return item;
}

export function isCurrent(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  return path === target || path.startsWith(`${target}/`);
}
