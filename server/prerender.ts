import {
  episodes,
  getEpisode,
  getLeaderboardProducts,
  getMentionsForEpisode,
  getMentionsForPerson,
  getMentionsForProduct,
  getPerson,
  getProduct,
  getProductsForCategory,
  getUniqueCategories,
  people,
  resolveParent,
} from "../client/src/lib/data-utils";
import { getJsonLd, getPageMeta, SITE_NAME, SITE_URL } from "../client/src/lib/seo";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;
const list = (items: string[]) => (items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "");
const productLink = (id: string) => {
  const parentId = resolveParent(id);
  const product = getProduct(parentId);
  return product ? link(`/products/${encodeURIComponent(parentId)}`, product.name) : "";
};
const episodeLink = (id: number) => {
  const episode = getEpisode(id);
  return episode ? link(`/episodes/${id}`, `Ep${id} – ${episode.title}`) : "";
};
const sortedEpisodes = () => [...episodes].sort((a, b) => b.date.localeCompare(a.date));
const unique = <T,>(items: T[]) => Array.from(new Set(items));

const nav = `<nav>${[
  link("/", "Início"),
  link("/episodes", "Episódios"),
  link("/products", "Produtos"),
  link("/categories", "Categorias"),
  link("/people", "Pessoas"),
].join(" · ")}</nav>`;

/** Conteúdo semântico com links reais, para crawlers que não executam JS. */
function bodyContent(pathname: string): string {
  const meta = getPageMeta(pathname);
  const path = meta.canonicalPath;
  const [, section, rawId] = path.split("/");
  const heading = (text: string) => `<h1>${esc(text)}</h1><p>${esc(meta.description)}</p>`;

  if (meta.noindex) {
    return `<h1>Página não encontrada</h1><p>${link("/", `Voltar para ${SITE_NAME}`)}</p>`;
  }

  if (path === "/") {
    return (
      heading(`${SITE_NAME} – Produtos da Semana`) +
      `<h2>Produtos mais citados</h2>` +
      list(getLeaderboardProducts().slice(0, 15).map((p) => productLink(p.id))) +
      `<h2>Episódios recentes</h2>` +
      list(sortedEpisodes().slice(0, 10).map((e) => episodeLink(e.id)))
    );
  }

  if (!rawId) {
    switch (section) {
      case "episodes":
        return heading("Episódios") + list(sortedEpisodes().map((e) => episodeLink(e.id)));
      case "products":
        return heading("Produtos") + list(getLeaderboardProducts().map((p) => productLink(p.id)));
      case "categories":
        return (
          heading("Categorias") +
          list(getUniqueCategories().map((c) => link(`/categories/${encodeURIComponent(c)}`, c)))
        );
      case "people":
        return heading("Pessoas") + list(people.map((p) => link(`/people/${encodeURIComponent(p.id)}`, p.name)));
    }
  }

  const id = decodeURIComponent(rawId);

  if (section === "episodes") {
    const episode = getEpisode(Number(id))!;
    const items = unique(getMentionsForEpisode(episode.id).map((m) => resolveParent(m.productId)));
    const external = [
      episode.youtubeLink && link(episode.youtubeLink, "Assistir no YouTube"),
      episode.spotifyLink && link(episode.spotifyLink, "Ouvir no Spotify"),
    ].filter(Boolean) as string[];
    return (
      heading(episode.title) +
      `<p>Publicado em ${esc(episode.date)}</p>` +
      list(external) +
      `<h2>Produtos citados</h2>` +
      list(items.map(productLink))
    );
  }

  if (section === "products") {
    const product = getProduct(id)!;
    const canonical = getProduct(resolveParent(product.id)) ?? product;
    const eps = unique(getMentionsForProduct(canonical.id).map((m) => m.episodeId)).sort((a, b) => b - a);
    return (
      heading(canonical.name) +
      `<p>Categoria: ${link(`/categories/${encodeURIComponent(canonical.category)}`, canonical.category)}</p>` +
      `<h2>Episódios em que foi citado</h2>` +
      list(eps.map(episodeLink))
    );
  }

  if (section === "people") {
    const person = getPerson(id)!;
    const mentions = getMentionsForPerson(person.id);
    return (
      heading(person.name) +
      `<h2>Produtos recomendados</h2>` +
      list(unique(mentions.map((m) => resolveParent(m.productId))).map(productLink)) +
      `<h2>Episódios</h2>` +
      list(unique(mentions.map((m) => m.episodeId)).sort((a, b) => b - a).map(episodeLink))
    );
  }

  // categories
  return heading(id) + list(getProductsForCategory(id).map((p) => productLink(p.id)));
}

function replaceMeta(html: string, attr: "name" | "property", key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${esc(content)}">`;
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  return re.test(html) ? html.replace(re, () => tag) : html.replace("</head>", () => `    ${tag}\n  </head>`);
}

function renderPage(template: string, pathname: string): string {
  const meta = getPageMeta(pathname);
  const url = `${SITE_URL}${meta.canonicalPath === "/" ? "/" : meta.canonicalPath}`;

  let html = template.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(meta.title)}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, () => `<link rel="canonical" href="${esc(url)}">`);
  html = replaceMeta(html, "name", "description", meta.description);
  html = replaceMeta(html, "name", "robots", meta.noindex ? "noindex, follow" : "index, follow");
  html = replaceMeta(html, "property", "og:url", url);
  html = replaceMeta(html, "property", "og:title", meta.title);
  html = replaceMeta(html, "property", "og:description", meta.description);
  html = replaceMeta(html, "name", "twitter:title", meta.title);
  html = replaceMeta(html, "name", "twitter:description", meta.description);

  const jsonLd = getJsonLd(pathname);
  if (jsonLd.length) {
    // "<" escapado para que o JSON nunca feche o <script> por acidente
    const json = JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLd }).replace(/</g, "\\u003c");
    html = html.replace(
      "</head>",
      () => `    <script id="route-jsonld" type="application/ld+json">${json}</script>\n  </head>`,
    );
  }

  // Visualmente oculto: o React substitui o #root no primeiro render.
  const fallback =
    `<div id="seo-fallback" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden">` +
    `${nav}<main>${bodyContent(pathname)}</main></div>`;
  return html.replace('<div id="root"></div>', () => `<div id="root">${fallback}</div>`);
}

/** Devolve o HTML da rota, com head e conteúdo já preenchidos. */
export function prerender(template: string, pathname: string): string {
  return renderPage(template, pathname);
}
