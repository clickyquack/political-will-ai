import { defineConfig } from "astro/config";
import react from "@astrojs/react";

const site = process.env.ASTRO_SITE ?? "http://localhost:4321";

export default defineConfig({
  site,
  base: "/",
  integrations: [react()],
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
