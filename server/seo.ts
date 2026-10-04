import type { Express } from "express";
import { episodes, products, people } from "../client/src/lib/data";
import { getUniqueCategories } from "../client/src/lib/data-utils";
import { SITE_URL } from "../client/src/lib/seo";

export { SITE_URL };

const episodeIds = new Set(episodes.map((e) => String(e.id)));
const productIds = new Set(products.map((p) => p.id));
const personIds = new Set(people.map((p) => p.id));
const categoryNames = new Set(getUniqueCategories());

const listRoutes = ["/episodes", "/products", "/categories", "/people", "/sobre"];

export function isKnownRoute(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/" || listRoutes.includes(path)) return true;

  const [, section, rawId, ...rest] = path.split("/");
  if (!rawId || rest.length > 0) return false;

  let id: string;
  try {
    id = decodeURIComponent(rawId);
  } catch {
    return false;
  }

  switch (section) {
    case "episodes":
      return episodeIds.has(id);
    case "products":
      return productIds.has(id);
    case "people":
      return personIds.has(id);
    case "categories":
      return categoryNames.has(id);
    default:
      return false;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSitemap(): string {
  const latestEpisodeDate = episodes.reduce(
    (latest, e) => (e.date > latest ? e.date : latest),
    "",
  );

  const urls: { path: string; lastmod?: string }[] = [
    { path: "/", lastmod: latestEpisodeDate },
    ...listRoutes.map((path) => ({ path, lastmod: latestEpisodeDate })),
    ...episodes.map((e) => ({ path: `/episodes/${e.id}`, lastmod: e.date })),
    // produtos filhos (parentId) são variações; a página canônica é a do pai
    ...products
      .filter((p) => !p.parentId)
      .map((p) => ({ path: `/products/${encodeURIComponent(p.id)}` })),
    ...people.map((p) => ({ path: `/people/${encodeURIComponent(p.id)}` })),
    ...getUniqueCategories().map((c) => ({
      path: `/categories/${encodeURIComponent(c)}`,
    })),
  ];

  const body = urls
    .map(({ path, lastmod }) => {
      const loc = escapeXml(`${SITE_URL}${path === "/" ? "/" : path}`);
      return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function registerSeoRoutes(app: Express) {
  const sitemap = buildSitemap();
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(sitemap);
  });
}
