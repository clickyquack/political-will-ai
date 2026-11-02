# Political Will AI

Research and resources on building political will for AI governance.

The site is [Astro](https://astro.build). Listings are JSON files. The about page is Markdown.

## Run it

```bash
npm install
npm run dev
```

The blog reads titles, previews, and dates from Substack while the site builds, so that command needs a network connection.

Production build:

```bash
npm run build
npm run preview
```

### Congress AI map (`/congress-map/`)

The interactive map is built from the sibling [Congress AI Map](https://github.com/clickyquack/Congress-AI-Map) repo into `public/congress-map/` (gitignored). With both repos checked out side by side:

```bash
npm run build:congress-map
```

Or `CONGRESS_MAP_DIR=/path/to/Congress-AI-Map npm run build:congress-map`. Full site deploy runs this automatically before `astro build`. Live URL: https://www.politicalwillai.org/congress-map/

## GitHub Pages

The site deploys with [GitHub Actions](.github/workflows/deploy.yml) on pushes to `main`. Production builds use the custom domain:

https://www.politicalwillai.org

In the repo on GitHub → **Settings** → **Pages**, set **Custom domain** to `www.politicalwillai.org` and enable **Enforce HTTPS** once DNS is valid.

After the first push, set **Build and deployment** → **Source** to **GitHub Actions**.

To preview a production-like build locally:

```bash
ASTRO_SITE=https://www.politicalwillai.org npm run build
npm run preview
```

## Site outline

| Page | Edit |
| --- | --- |
| Home | `src/pages/index.astro` |
| About | `src/content/pages/about.md` |
| Blog | `src/data/blog.json` |
| Reading list | `src/data/reading-list.json` |
| Politician positions | `src/data/politician-positions.json` |
| Industry lobbying | `src/data/industry-lobbying.json` |
| Proxy measures | `src/data/proxy-measures.json` |

Navigation labels and order live in `src/site.ts`.

Files in `notes/` are working material. They are not published.

## Add a blog post

Add the Substack URL to `src/data/blog.json`:

```json
[
  "https://quintic.substack.com/p/your-post-slug"
]
```

The blog page loads the title, preview, and date from that publication's feed and lists posts newest first.

## Add a catalog entry

Reading list, industry lobbying, politician positions, and proxy measures are JSON arrays. Add an object:

```json
{
  "title": "Name of the tool",
  "url": "https://example.com",
  "description": "What it shows.",
  "authors": [{ "name": "Org or person", "url": "https://example.org" }],
  "date": "2026-09-16",
  "image": "/previews/name.png"
}
```

`title` and `url` are required. Leave `date` out for a tool that is continuously updated. For a source that is not a live tool and has no date, set `"continuous": false` so the date column stays blank. Set `"priority": true` to highlight a reading-list entry and pin it first until the reader sorts by date. Leave `image` out until there is a screenshot. Put screenshot files in `public/previews/` and set `image` to the site path. The preview column appears once any entry on that page has an image.

Tool pages list newest first. Continuously updated entries tie as the newest. The reading list starts with priority entries pinned, then newest first. Search matches titles. The sort control switches to date order.

## About

Edit the prose in `src/content/pages/about.md`.

## Push to GitHub

If the repo is not a git repository yet, from the project folder:

```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/political-will-ai.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Create the empty `political-will-ai` repo on GitHub first (no README), unless you already have one—in that case use its clone URL for `origin`.

If `origin` already exists and points somewhere else:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/political-will-ai.git
```

Later updates:

```bash
git add .
git commit -m "Describe your change"
git push
```
