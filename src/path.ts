/** Site path with Astro base (for GitHub Pages project sites). */
export function sitePath(pathname: string) {
  const segment = pathname.replace(/^\//, "");
  return `${import.meta.env.BASE_URL}${segment}`;
}
