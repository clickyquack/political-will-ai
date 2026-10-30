import { defineConfig } from "astro/config";

const site = process.env.ASTRO_SITE ?? "http://localhost:4321";

export default defineConfig({
  site,
  base: "/",
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
