import { defineConfig } from "astro/config";

const githubPages = process.env.GITHUB_PAGES === "true";
const site = process.env.ASTRO_SITE ?? "http://localhost:4321";
const base = githubPages ? "/political-will-ai/" : "/";

export default defineConfig({
  site,
  base,
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
