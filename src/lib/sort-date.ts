export type DatedItem = {
  continuous: boolean;
  date?: string;
  index: number;
  priority?: boolean;
};

export type SortMode = "priority" | "asc" | "desc";

function tier(item: DatedItem) {
  if (item.continuous) return 2;
  if (item.date) return 1;
  return 0;
}

/** Items with no date that are marked continuous tie with each other as the newest. */
export function compareByDate(a: DatedItem, b: DatedItem, direction: "asc" | "desc") {
  const tierDiff = tier(a) - tier(b);
  if (tierDiff !== 0) return direction === "desc" ? -tierDiff : tierDiff;
  if (a.date && b.date && a.date !== b.date) {
    const diff = Date.parse(`${a.date}T00:00:00Z`) - Date.parse(`${b.date}T00:00:00Z`);
    return direction === "desc" ? -diff : diff;
  }
  return a.index - b.index;
}

export function compareCatalog(a: DatedItem, b: DatedItem, mode: SortMode) {
  if (mode === "priority" && Boolean(a.priority) !== Boolean(b.priority)) {
    return a.priority ? -1 : 1;
  }
  return compareByDate(a, b, mode === "asc" ? "asc" : "desc");
}

export function sortByDate<T extends DatedItem>(items: T[], direction: "asc" | "desc" = "desc") {
  return items.toSorted((a, b) => compareByDate(a, b, direction));
}
