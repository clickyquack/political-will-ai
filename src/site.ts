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
  { id: "about", href: sitePath("/about"), label: "About" },
  {
    id: "resources",
    label: "Resources",
    children: [
      { id: "reading-list", href: sitePath("/reading-list"), label: "Reading list" },
      { id: "politician-positions", href: sitePath("/politician-positions"), label: "Politician positions" },
      { id: "industry-lobbying", href: sitePath("/industry-lobbying"), label: "Industry lobbying" },
      { id: "proxy-measures", href: sitePath("/proxy-measures"), label: "Proxy measures" },
    ],
  },
  { id: "blog", href: sitePath("/blog"), label: "Blog" },
];

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
