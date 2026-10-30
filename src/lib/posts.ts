import { z } from "astro/zod";

const urlsSchema = z.array(z.string().url());

export type BlogPost = {
  url: string;
  title: string;
  preview: string;
  date: Date;
};

type FeedPost = {
  title: string;
  preview: string;
  date: Date;
};

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, body: string) => {
    if (body[0] !== "#") {
      const named: Record<string, string> = {
        amp: "&",
        lt: "<",
        gt: ">",
        quot: '"',
        apos: "'",
        nbsp: " ",
      };
      return named[body.toLowerCase()] ?? entity;
    }
    const code =
      body[1]?.toLowerCase() === "x" ? Number.parseInt(body.slice(2), 16) : Number.parseInt(body.slice(1), 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : entity;
  });
}

function plainText(value: string) {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonical(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

function readTag(block: string, tag: string) {
  const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`));
  if (cdata?.[1]) return cdata[1].trim();
  const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return plain?.[1]?.trim() ?? "";
}

function parseFeed(xml: string) {
  const posts = new Map<string, FeedPost>();
  for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = match[1] ?? "";
    const link = plainText(readTag(block, "link"));
    const title = plainText(readTag(block, "title"));
    const preview = plainText(readTag(block, "description"));
    const published = new Date(readTag(block, "pubDate"));
    if (!link || !title || Number.isNaN(published.valueOf())) continue;
    posts.set(canonical(link), { title, preview, date: published });
  }
  return posts;
}

function browserHeaders(accept: string) {
  return {
    accept,
    "accept-language": "en-US,en;q=0.9",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: browserHeaders("text/html, application/xhtml+xml, application/xml, text/xml, */*"),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.text();
}

async function loadFeed(origin: string) {
  try {
    return parseFeed(await fetchText(`${origin}/feed`));
  } catch {
    return new Map<string, FeedPost>();
  }
}

function metaContent(html: string, property: string) {
  const tag = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*>`, "i"));
  const content = tag?.[0].match(/content=["']([^"']*)["']/i);
  return content?.[1] ? plainText(content[1]) : "";
}

function fallbackFromUrl(url: string): FeedPost {
  const slug = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "post";
  const title = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  return { title, preview: "", date: new Date(0) };
}

async function fetchPostPage(url: string): Promise<FeedPost | undefined> {
  try {
    const html = await fetchText(url);
    const title = metaContent(html, "og:title");
    const preview = metaContent(html, "og:description");
    const published = html.match(/"datePublished":"([^"]+)"/);
    const date = published?.[1] ? new Date(published[1]) : new Date(Number.NaN);
    if (!title || Number.isNaN(date.valueOf())) return undefined;
    return { title, preview, date };
  } catch {
    return undefined;
  }
}

export async function loadBlogPosts(input: unknown): Promise<BlogPost[]> {
  const urls = urlsSchema.parse(input);
  const origins = [...new Set(urls.map((url) => new URL(url).origin))];
  const feeds = new Map<string, Map<string, FeedPost>>();
  await Promise.all(
    origins.map(async (origin) => {
      feeds.set(origin, await loadFeed(origin));
    }),
  );

  const posts = await Promise.all(
    urls.map(async (url, index) => {
      const feed = feeds.get(new URL(url).origin);
      const post = feed?.get(canonical(url)) ?? (await fetchPostPage(url)) ?? fallbackFromUrl(url);
      return { ...post, url, index };
    }),
  );

  return posts.sort((a, b) => b.date.getTime() - a.date.getTime() || a.index - b.index);
}
