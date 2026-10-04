import type { Express } from "express";
import { episodes, products, people } from "../client/src/lib/data";
import { getCategoryBySlug, getUniqueCategories } from "../client/src/lib/data-utils";
import { categoryPath } from "../client/src/lib/categories";
import { SITE_URL } from "../client/src/lib/seo";

export { SITE_URL };

const episodeIds = new Set(episodes.map((e) => String(e.id)));
const productIds = new Set(products.map((p) => p.id));
const personIds = new Set(people.map((p) => p.id));

const listRoutes = ["/episodios", "/produtos", "/categorias", "/pessoas", "/sobre"];

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
    case "episodios":
      return episodeIds.has(id);
    case "produtos":
      return productIds.has(id);
    case "pessoas":
      return personIds.has(id);
    case "categorias":
      return getCategoryBySlug(id) !== undefined;
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
    ...episodes.map((e) => ({ path: `/episodios/${e.id}`, lastmod: e.date })),
    // produtos filhos (parentId) são variações; a página canônica é a do pai
    ...products
      .filter((p) => !p.parentId)
      .map((p) => ({ path: `/produtos/${encodeURIComponent(p.id)}` })),
    ...people.map((p) => ({ path: `/pessoas/${encodeURIComponent(p.id)}` })),
    ...getUniqueCategories().map((c) => ({
      path: categoryPath(c),
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

// Endereços antigos, em inglês, e os novos em português
const legacySections: Record<string, string> = {
  episodes: "/episodios",
  products: "/produtos",
  people: "/pessoas",
  categories: "/categorias",
};

/** Endereço novo para um caminho antigo (/products/x → /produtos/x), ou null se o caminho não for antigo. */
export function legacyRedirect(pathname: string): string | null {
  const [, section, rawId, ...rest] = pathname.replace(/\/+$/, "").split("/");
  const target = legacySections[section];
  if (!target || rest.length > 0) return null;
  if (!rawId) return target;

  if (section === "categories") {
    // categorias antigas usavam o nome em inglês: /categories/AI%20Tools
    let name: string;
    try {
      name = decodeURIComponent(rawId);
    } catch {
      return target;
    }
    return getUniqueCategories().includes(name) ? categoryPath(name) : target;
  }
  return `${target}/${rawId}`;
}

export function registerSeoRoutes(app: Express) {
  // 301 permanente: links antigos e páginas já indexadas passam para o endereço em português
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    const target = legacyRedirect(req.path);
    if (!target) return next();
    const query = req.originalUrl.slice(req.path.length);
    res.redirect(301, `${target}${query}`);
  });

  const sitemap = buildSitemap();
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send(sitemap);
  });
}
