import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

function idFromFilename({ entry }: { entry: string }) {
  return entry.replace(/\\/g, "/").replace(/\.md$/, "");
}

const pages = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/pages",
    generateId: idFromFilename,
  }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { pages };
