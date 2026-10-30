import { z } from "astro/zod";
import { compareCatalog, sortByDate } from "./sort-date";

const authorSchema = z.strictObject({
  name: z.string().min(1),
  url: z.string().url().optional(),
});

export const catalogSchema = z.array(
  z.strictObject({
    title: z.string().min(1),
    url: z.string().url(),
    description: z.string().min(1).optional(),
    authors: z.array(authorSchema).default([]),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD, or leave date out if it is continuously updated")
      .optional(),
    image: z.string().min(1).optional(),
    priority: z.boolean().optional(),
    continuous: z.boolean().optional(),
  }),
);

export function parseCatalog(input: unknown, options?: { pinPriority?: boolean }) {
  const items = catalogSchema.parse(input).map((item, index) => ({
    ...item,
    index,
    continuous: item.continuous ?? item.date == null,
    priority: item.priority ?? false,
  }));
  if (options?.pinPriority) {
    return items.toSorted((a, b) => compareCatalog(a, b, "priority"));
  }
  return sortByDate(items);
}
