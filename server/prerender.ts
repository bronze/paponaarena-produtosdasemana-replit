import { categoryLabel, categoryPath } from "../client/src/lib/categories";
import {
  episodes,
  getCategoryBySlug,
  getEpisode,
  getEpisodeCast,
  getLeaderboardProducts,
  getMentionsForEpisode,
  getMentionsForPerson,
  getMentionsForProduct,
  getPerson,
  getProduct,
  getProductsForCategory,
  getUniqueCategories,
  getLastEpisode,
  people,
  resolveParent,
} from "../client/src/lib/data-utils";
import { formatLongDate } from "../client/src/lib/dates";
import { getAboutCopy, getThousandthMention, MAINTAINER, REPLIT_URL } from "../client/src/lib/about";
import { categorySummary, episodeSummary, homeSummary, personSummary, productSummary } from "../client/src/lib/summaries";
import { getJsonLd, getPageMeta, SITE_NAME, SITE_URL, SPOTIFY_SHOW_URL, YOUTUBE_CHANNEL_URL } from "../client/src/lib/seo";

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
  return product ? link(`/produtos/${encodeURIComponent(parentId)}`, product.name) : "";
};
const episodeLink = (id: number) => {
  const episode = getEpisode(id);
  return episode ? link(`/episodios/${id}`, `Ep${id} – ${episode.title}`) : "";
};
const sortedEpisodes = () => [...episodes].sort((a, b) => b.date.localeCompare(a.date));
const unique = <T,>(items: T[]) => Array.from(new Set(items));

const nav = `<nav>${[
  link("/", "Início"),
  link("/episodios", "Episódios"),
  link("/produtos", "Produtos"),
  link("/categorias", "Categorias"),
  link("/pessoas", "Pessoas"),
  link("/sobre", "Sobre"),
].join(" · ")}</nav>`;

function milestoneHtml(): string {
  const m = getThousandthMention();
  if (!m) return "";
  return (
    `<h2>O produto nº 1.000</h2>` +
    `<p>O milésimo produto da semana registrado no Radar foi ${link(`/produtos/${encodeURIComponent(m.product.id)}`, m.product.name)}, ` +
    `citado por ${link(`/pessoas/${encodeURIComponent(m.person.id)}`, m.person.name)} no episódio ${episodeLink(m.episode.id)}.</p>`
  );
}

function footer(): string {
  const last = getLastEpisode();
  return (
    `<footer><p>Atualizado em <time datetime="${last.date}">${esc(formatLongDate(last.date))}</time>, ` +
    `com o ${episodeLink(last.id)}.</p></footer>`
  );
}

/** Conteúdo semântico com links reais, para crawlers que não executam JS. */
function bodyContent(pathname: string): string {
  const meta = getPageMeta(pathname);
  const path = meta.canonicalPath;
  const [, section, rawId] = path.split("/");
  // o resumo (frase com números) abre a página; sem ele, vale a description
  const heading = (text: string, summary = "") => `<h1>${esc(text)}</h1><p>${esc(summary || meta.description)}</p>`;

  if (meta.noindex) {
    return `<h1>Página não encontrada</h1><p>${link("/", `Voltar para ${SITE_NAME}`)}</p>`;
  }

  if (path === "/") {
    return (
      heading(`${SITE_NAME} – Produtos da Semana`) +
      `<p>${esc(homeSummary())}</p>` +
      `<h2>Produtos mais citados</h2>` +
      list(getLeaderboardProducts().slice(0, 15).map((p) => productLink(p.id))) +
      `<h2>Episódios recentes</h2>` +
      list(sortedEpisodes().slice(0, 10).map((e) => episodeLink(e.id)))
    );
  }

  if (!rawId) {
    switch (section) {
      case "episodios":
        return heading("Episódios") + list(sortedEpisodes().map((e) => episodeLink(e.id)));
      case "produtos":
        return heading("Produtos") + list(getLeaderboardProducts().map((p) => productLink(p.id)));
      case "categorias":
        return (
          heading("Categorias") +
          list(getUniqueCategories().map((c) => link(categoryPath(c), categoryLabel(c))))
        );
      case "sobre": {
        const copy = getAboutCopy();
        return (
          heading("Sobre o Papo na Arena Radar") +
          `<p>${esc(copy.fan)}</p>` +
          `<h2>O podcast Papo na Arena</h2><p>${esc(copy.podcast)}</p>` +
          `<p>Hosts: ${link("/pessoas/arthur", "Arthur")} e ${link("/pessoas/aiquis", "Aíquis")}.</p>` +
          list([link(SPOTIFY_SHOW_URL, "Ouvir no Spotify"), link(YOUTUBE_CHANNEL_URL, "Assistir no YouTube")]) +
          `<h2>O que é este site</h2><p>${esc(copy.site)}</p>` +
          milestoneHtml() +
          `<h2>Quem faz</h2><p>${esc(copy.maintainer)}</p>` +
          list([link(MAINTAINER.siteUrl, "carlosbronze.com.br"), link(MAINTAINER.linkedinUrl, "LinkedIn")]) +
          `<p>${esc(copy.replit)} ${link(REPLIT_URL, "Conheça o Replit")}.</p>` +
          `<p>Para IAs e agentes: ${link("/llms.txt", "llms.txt")} · ${link("/llms-full.txt", "acervo completo (llms-full.txt)")}</p>`
        );
      }
      case "pessoas":
        return heading("Pessoas") + list(people.map((p) => link(`/pessoas/${encodeURIComponent(p.id)}`, p.name)));
    }
  }

  const id = decodeURIComponent(rawId);

  if (section === "episodios") {
    const episode = getEpisode(Number(id))!;
    const items = unique(getMentionsForEpisode(episode.id).map((m) => resolveParent(m.productId)));
    const external = [
      episode.youtubeLink && link(episode.youtubeLink, "Assistir no YouTube"),
      episode.spotifyLink && link(episode.spotifyLink, "Ouvir no Spotify"),
    ].filter(Boolean) as string[];
    const cast = getEpisodeCast(episode.id);
    const castLinks = [...cast.hosts, ...cast.cohosts].map((p) => link(`/pessoas/${encodeURIComponent(p.id)}`, p.name));
    return (
      heading(episode.title, episodeSummary(episode.id)) +
      (castLinks.length ? `<p>Com ${castLinks.join(", ")}</p>` : "") +
      `<p>Publicado em ${esc(episode.date)}</p>` +
      list(external) +
      `<h2>Produtos citados</h2>` +
      list(items.map(productLink))
    );
  }

  if (section === "produtos") {
    const product = getProduct(id)!;
    const canonical = getProduct(resolveParent(product.id)) ?? product;
    const eps = unique(getMentionsForProduct(canonical.id).map((m) => m.episodeId)).sort((a, b) => b - a);
    return (
      heading(canonical.name, productSummary(canonical.id)) +
      `<p>Categoria: ${link(categoryPath(canonical.category), categoryLabel(canonical.category))}</p>` +
      `<h2>Episódios em que foi citado</h2>` +
      list(eps.map(episodeLink))
    );
  }

  if (section === "pessoas") {
    const person = getPerson(id)!;
    const mentions = getMentionsForPerson(person.id);
    return (
      heading(person.name, personSummary(person.id)) +
      `<h2>Produtos recomendados</h2>` +
      list(unique(mentions.map((m) => resolveParent(m.productId))).map(productLink)) +
      `<h2>Episódios</h2>` +
      list(unique(mentions.map((m) => m.episodeId)).sort((a, b) => b - a).map(episodeLink))
    );
  }

  // categorias: o endereço traz o slug em português, os dados usam o nome original
  const category = getCategoryBySlug(id)!;
  return heading(categoryLabel(category), categorySummary(category)) + list(getProductsForCategory(category).map((p) => productLink(p.id)));
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
    `${nav}<main>${bodyContent(pathname)}</main>${footer()}</div>`;
  return html.replace('<div id="root"></div>', () => `<div id="root">${fallback}</div>`);
}

/** Devolve o HTML da rota, com head e conteúdo já preenchidos. */
export function prerender(template: string, pathname: string): string {
  return renderPage(template, pathname);
}
