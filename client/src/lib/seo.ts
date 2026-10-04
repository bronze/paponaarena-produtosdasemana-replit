import { categoryLabel, categoryPath } from "./categories";
import { MAINTAINER } from "./about";
import {
  episodes,
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
  people,
  products,
  resolveParent,
  getCategoryBySlug,
  getLastEpisode,
} from "./data-utils";
import { categorySummary, episodeSummary, personSummary, productSummary } from "./summaries";

export const SITE_URL = "https://paponaarena-produtosdasemana.replit.app";
/** Nome deste site (projeto de fã), separado do nome do podcast para as IAs não confundirem os dois. */
export const SITE_NAME = "Papo na Arena Radar";
export const PODCAST_NAME = "Papo na Arena";

export const DEFAULT_TITLE = "Papo na Arena Radar – Produtos da Semana, Episódios e Menções";
export const DEFAULT_DESCRIPTION =
  "Todos os produtos da semana citados no podcast Papo na Arena por Arthur e Aíquis: rankings, episódios, categorias e quem recomendou o quê.";

export interface PageMeta {
  title: string;
  description: string;
  /** Caminho canônico (sem domínio). */
  canonicalPath: string;
  noindex?: boolean;
}

function truncate(text: string, max = 158): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, "").replace(/[\s,;:]+$/, "") + "…";
}

/** "A", "A e B", "A, B e C" */
export function formatList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function plural(n: number, singular: string, pluralForm: string): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function nameCount<T extends { name: string }>(items: T[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.name, (counts.get(item.name) || 0) + 1);
  return counts;
}
const productNames = nameCount(products);
const personNames = nameCount(people);

/** Nome com desambiguação quando há outro produto com o mesmo nome (ex.: Zoom da loja x Zoom app). */
function productLabel(product: { name: string; category: string }): string {
  return (productNames.get(product.name) || 0) > 1 ? `${product.name} (${categoryLabel(product.category)})` : product.name;
}

/** Idem para pessoas homônimas (ex.: dois "Eduardo" em episódios diferentes). */
function personLabel(person: { id: string; name: string }): string {
  if ((personNames.get(person.name) || 0) <= 1) return person.name;
  const firstEpisode = Math.min(...getMentionsForPerson(person.id).map((m) => m.episodeId));
  return Number.isFinite(firstEpisode) ? `${person.name} (Ep${firstEpisode})` : person.name;
}

const notFound = (path: string): PageMeta => ({
  title: `Página não encontrada | ${SITE_NAME}`,
  description: DEFAULT_DESCRIPTION,
  canonicalPath: path,
  noindex: true,
});

export function getPageMeta(pathname: string): PageMeta {
  const path = pathname.replace(/\/+$/, "") || "/";
  const [, section, rawId, ...rest] = path.split("/");

  if (path === "/") {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, canonicalPath: "/" };
  }

  if (!rawId && rest.length === 0) {
    switch (section) {
      case "episodios":
        return {
          title: `Episódios do Papo na Arena – lista completa | ${SITE_NAME}`,
          description: `Todos os ${episodes.length} episódios do podcast Papo na Arena com os produtos da semana citados em cada um, por ano.`,
          canonicalPath: "/episodios",
        };
      case "produtos":
        return {
          title: `Produtos citados no Papo na Arena – ranking completo | ${SITE_NAME}`,
          description: `Ranking dos ${getLeaderboardProducts().length} produtos citados nos episódios do Papo na Arena, com categoria, número de menções e episódios.`,
          canonicalPath: "/produtos",
        };
      case "categorias":
        return {
          title: `Categorias de produtos do Papo na Arena | ${SITE_NAME}`,
          description: `Os produtos da semana do Papo na Arena organizados em ${getUniqueCategories().length} categorias.`,
          canonicalPath: "/categorias",
        };
      case "sobre":
        return {
          title: `Sobre o Papo na Arena e o Radar de Produtos da Semana | ${SITE_NAME}`,
          description:
            "Conheça o podcast Papo na Arena, de Arthur e Aíquis, e o Radar que reúne todos os produtos da semana citados nos episódios. Site feito com Replit.",
          canonicalPath: "/sobre",
        };
      case "pessoas":
        return {
          title: `Quem fala no Papo na Arena – convidados e hosts | ${SITE_NAME}`,
          description:
            "Hosts e convidados do podcast Papo na Arena e os produtos que cada um recomendou ao longo dos episódios.",
          canonicalPath: "/pessoas",
        };
    }
    return notFound(path);
  }

  if (!rawId || rest.length > 0) return notFound(path);
  const id = safeDecode(rawId);

  switch (section) {
    case "episodios": {
      const episode = getEpisode(Number(id));
      if (!episode) return notFound(path);

      const counts = new Map<string, number>();
      for (const m of getMentionsForEpisode(episode.id)) {
        const productId = resolveParent(m.productId);
        counts.set(productId, (counts.get(productId) || 0) + 1);
      }
      const names = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([productId]) => getProduct(productId)?.name)
        .filter((n): n is string => !!n)
        .slice(0, 6);

      const cast = getEpisodeCast(episode.id);
      const castNames = [...cast.hosts, ...cast.cohosts].map((p) => p.name);
      const withCast = castNames.length ? ` Com ${formatList(castNames)}.` : "";
      const products = names.length ? ` Produtos citados: ${names.join(", ")}.` : "";
      return {
        title: `Ep${episode.id} – ${episode.title} | ${SITE_NAME}`,
        description: truncate(`${episode.description}${withCast}${products}`),
        canonicalPath: `/episodios/${episode.id}`,
      };
    }

    case "produtos": {
      const product = getProduct(id);
      if (!product) return notFound(path);

      const canonicalId = resolveParent(product.id);
      const canonical = getProduct(canonicalId) ?? product;
      const mentions = getMentionsForProduct(canonical.id);
      const episodeCount = new Set(mentions.map((m) => m.episodeId)).size;
      return {
        title: `${productLabel(canonical)} – menções no ${PODCAST_NAME}`,
        description: truncate(
          `${canonical.name} (${categoryLabel(canonical.category)}) foi citado ${plural(mentions.length, "vez", "vezes")} em ${plural(episodeCount, "episódio", "episódios")} do Papo na Arena. Veja quem recomendou e em quais episódios.`,
        ),
        canonicalPath: `/produtos/${encodeURIComponent(canonical.id)}`,
      };
    }

    case "pessoas": {
      const person = getPerson(id);
      if (!person) return notFound(path);

      const mentions = getMentionsForPerson(person.id);
      const episodeCount = new Set(mentions.map((m) => m.episodeId)).size;
      return {
        title: `${personLabel(person)} no ${PODCAST_NAME} – produtos recomendados`,
        description: truncate(
          `${personLabel(person)} fez ${plural(mentions.length, "menção", "menções")} de produtos em ${plural(episodeCount, "episódio", "episódios")} do Papo na Arena. Veja o que recomendou.`,
        ),
        canonicalPath: `/pessoas/${encodeURIComponent(person.id)}`,
      };
    }

    case "categorias": {
      const category = getCategoryBySlug(id);
      if (!category) return notFound(path);

      const list = getProductsForCategory(category);
      const top = list.slice(0, 5).map((p) => p.name);
      return {
        title: `${categoryLabel(category)} – produtos da semana do ${PODCAST_NAME}`,
        description: truncate(
          `${plural(list.length, "produto", "produtos")} da categoria ${categoryLabel(category)} citados no Papo na Arena${top.length ? `, como ${top.join(", ")}` : ""}.`,
        ),
        canonicalPath: categoryPath(category),
      };
    }
  }

  return notFound(path);
}


export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@PaponaArena";
export const SPOTIFY_SHOW_URL = "https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ";

type JsonLd = Record<string, unknown>;

const absolute = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

// @id estáveis: a mesma entidade é referenciada igual em todas as páginas do grafo
const ids = {
  website: `${SITE_URL}/#website`,
  podcast: `${SITE_URL}/#podcast`,
  maintainer: `${SITE_URL}/#maintainer`,
  person: (id: string) => `${absolute(`/pessoas/${encodeURIComponent(id)}`)}#person`,
  product: (id: string) => `${absolute(`/produtos/${encodeURIComponent(id)}`)}#product`,
  episode: (id: number) => `${absolute(`/episodios/${id}`)}#episode`,
};

/** Listas longas no JSON-LD ficam no topo; o resto está nas páginas e no sitemap. */
const ITEM_LIST_LIMIT = 50;

const latest = (dates: (string | undefined)[]) =>
  dates.reduce<string>((max, d) => (d && d > max ? d : max), "");
const mentionDates = (mentions: { episodeId: number }[]) => mentions.map((m) => getEpisode(m.episodeId)?.date);

/**
 * Data da última mudança no conteúdo da rota (AAAA-MM-DD): o episódio mais recente que a afeta.
 * Usada no dateModified do JSON-LD e no lastmod do sitemap.
 */
export function getLastModified(pathname: string): string {
  const meta = getPageMeta(pathname);
  const [, section, rawId] = meta.canonicalPath.split("/");
  const fallback = getLastEpisode().date;
  if (meta.noindex || !rawId) return fallback;

  const id = safeDecode(rawId);
  switch (section) {
    case "episodios":
      return getEpisode(Number(id))?.date ?? fallback;
    case "produtos":
      return latest(mentionDates(getMentionsForProduct(id))) || fallback;
    case "pessoas": {
      const cast = episodes.filter((e) => e.hosts.includes(id) || e.cohosts?.includes(id)).map((e) => e.date);
      return latest([...mentionDates(getMentionsForPerson(id)), ...cast]) || fallback;
    }
    case "categorias": {
      const category = getCategoryBySlug(id);
      if (!category) return fallback;
      return latest(getProductsForCategory(category).flatMap((p) => mentionDates(getMentionsForProduct(p.id)))) || fallback;
    }
  }
  return fallback;
}

function personRef(id: string): JsonLd | undefined {
  const person = getPerson(id);
  if (!person) return undefined;
  return {
    "@type": "Person",
    "@id": ids.person(person.id),
    name: person.name,
    url: absolute(`/pessoas/${encodeURIComponent(person.id)}`),
    ...(person.linkedinUrl ? { sameAs: [person.linkedinUrl] } : {}),
  };
}

function productRef(id: string): JsonLd | undefined {
  const product = getProduct(id);
  if (!product) return undefined;
  return { "@type": "Thing", "@id": ids.product(product.id), name: product.name };
}

function episodeRef(id: number): JsonLd | undefined {
  const episode = getEpisode(id);
  if (!episode) return undefined;
  return {
    "@type": "PodcastEpisode",
    "@id": ids.episode(episode.id),
    name: `Ep${episode.id} – ${episode.title}`,
    url: absolute(`/episodios/${episode.id}`),
  };
}

const defined = <T,>(items: (T | undefined)[]) => items.filter((i): i is T => i !== undefined);

function podcastSeries(): JsonLd {
  return {
    "@type": "PodcastSeries",
    "@id": ids.podcast,
    name: PODCAST_NAME,
    url: SPOTIFY_SHOW_URL,
    inLanguage: "pt-BR",
    description:
      "Podcast de Arthur e Aíquis sobre produto, tecnologia e inteligência artificial, com os produtos da semana em cada episódio.",
    author: defined(["arthur", "aiquis"].map(personRef)),
    sameAs: [YOUTUBE_CHANNEL_URL, SPOTIFY_SHOW_URL],
  };
}

function maintainer(): JsonLd {
  return {
    "@type": "Person",
    "@id": ids.maintainer,
    name: MAINTAINER.name,
    url: MAINTAINER.siteUrl,
    sameAs: [MAINTAINER.linkedinUrl],
  };
}

function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

function itemList(name: string, total: number, items: { name: string; path: string }[]): JsonLd {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: total,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: items.slice(0, ITEM_LIST_LIMIT).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absolute(item.path),
    })),
  };
}

const productItems = (list: { id: string; name: string }[]) =>
  list.map((p) => ({ name: p.name, path: `/produtos/${encodeURIComponent(p.id)}` }));

/** Dados estruturados (schema.org) da rota. Vazio para rotas inexistentes. */
export function getJsonLd(pathname: string): JsonLd[] {
  const meta = getPageMeta(pathname);
  if (meta.noindex) return [];

  const path = meta.canonicalPath;
  const [, section, rawId] = path.split("/");
  const lastEpisode = getLastEpisode();

  if (path === "/") {
    const leaderboard = getLeaderboardProducts();
    return [
      {
        "@type": "WebSite",
        "@id": ids.website,
        name: SITE_NAME,
        url: absolute("/"),
        inLanguage: "pt-BR",
        description: DEFAULT_DESCRIPTION,
        about: { "@id": ids.podcast },
        author: maintainer(),
        dateModified: lastEpisode.date,
      },
      podcastSeries(),
      itemList(`Produtos mais citados no ${PODCAST_NAME}`, leaderboard.length, productItems(leaderboard.slice(0, 15))),
    ];
  }

  if (path === "/sobre") {
    return [
      {
        "@type": "AboutPage",
        name: meta.title,
        url: absolute(path),
        inLanguage: "pt-BR",
        description: meta.description,
        about: [{ "@id": ids.podcast }, { "@id": ids.website }],
        isPartOf: { "@id": ids.website },
        author: maintainer(),
        dateModified: getLastModified(path),
      },
      breadcrumbs([
        { name: SITE_NAME, path: "/" },
        { name: "Sobre", path },
      ]),
    ];
  }

  const sectionNames: Record<string, string> = {
    episodios: "Episódios",
    produtos: "Produtos",
    categorias: "Categorias",
    pessoas: "Pessoas",
  };
  const home = { name: SITE_NAME, path: "/" };
  const list = { name: sectionNames[section], path: `/${section}` };

  if (!rawId) {
    const crumbs = breadcrumbs([home, list]);
    switch (section) {
      case "episodios": {
        const sorted = [...episodes].sort((a, b) => b.date.localeCompare(a.date));
        return [
          crumbs,
          itemList(
            `Episódios do ${PODCAST_NAME}`,
            sorted.length,
            sorted.map((e) => ({ name: `Ep${e.id} – ${e.title}`, path: `/episodios/${e.id}` })),
          ),
        ];
      }
      case "produtos": {
        const leaderboard = getLeaderboardProducts();
        return [crumbs, itemList(`Produtos mais citados no ${PODCAST_NAME}`, leaderboard.length, productItems(leaderboard))];
      }
      case "categorias": {
        const categories = getUniqueCategories();
        return [
          crumbs,
          {
            ...itemList(
              `Categorias de produtos do ${PODCAST_NAME}`,
              categories.length,
              categories.map((c) => ({ name: categoryLabel(c), path: categoryPath(c) })),
            ),
            itemListOrder: "https://schema.org/ItemListUnordered",
          },
        ];
      }
    }
    return [crumbs];
  }

  const id = safeDecode(rawId);
  const crumbs = (name: string) => breadcrumbs([home, list, { name, path }]);

  if (section === "episodios") {
    const episode = getEpisode(Number(id))!;
    const sameAs = [episode.youtubeLink, episode.spotifyLink].filter(Boolean);
    const cast = getEpisodeCast(episode.id);
    const actors = defined([...cast.hosts, ...cast.cohosts].map((p) => personRef(p.id)));
    const mentioned = defined(
      Array.from(new Set(getMentionsForEpisode(episode.id).map((m) => resolveParent(m.productId)))).map(productRef),
    );
    return [
      {
        "@type": "PodcastEpisode",
        "@id": ids.episode(episode.id),
        name: episode.title,
        description: episode.description,
        abstract: episodeSummary(episode.id),
        url: absolute(path),
        datePublished: episode.date,
        episodeNumber: episode.id,
        inLanguage: "pt-BR",
        partOfSeries: { "@id": ids.podcast, "@type": "PodcastSeries", name: PODCAST_NAME, url: SPOTIFY_SHOW_URL },
        ...(actors.length ? { actor: actors } : {}),
        ...(mentioned.length ? { mentions: mentioned } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      crumbs(`Ep${episode.id}`),
    ];
  }

  if (section === "produtos") {
    const product = getProduct(resolveParent(id))!;
    const episodeIds = Array.from(new Set(getMentionsForProduct(product.id).map((m) => m.episodeId))).sort(
      (a, b) => b - a,
    );
    return [
      {
        // Thing não tem dateModified; a página que fala do produto tem
        "@type": "WebPage",
        name: meta.title,
        url: absolute(path),
        inLanguage: "pt-BR",
        isPartOf: { "@id": ids.website },
        mainEntity: { "@id": ids.product(product.id) },
        dateModified: getLastModified(path),
      },
      {
        "@type": "Thing",
        "@id": ids.product(product.id),
        name: product.name,
        description: productSummary(product.id),
        mainEntityOfPage: absolute(path),
        ...(product.url ? { url: product.url, sameAs: [product.url] } : {}),
        subjectOf: defined(episodeIds.map(episodeRef)),
      },
      crumbs(product.name),
    ];
  }

  if (section === "pessoas") {
    const person = getPerson(id)!;
    return [
      {
        "@type": "ProfilePage",
        name: meta.title,
        url: absolute(path),
        inLanguage: "pt-BR",
        isPartOf: { "@id": ids.website },
        dateModified: getLastModified(path),
        mainEntity: { ...personRef(person.id), description: personSummary(person.id) },
      },
      crumbs(person.name),
    ];
  }

  // categorias: o endereço traz o slug em português, os dados usam o nome original
  const category = getCategoryBySlug(id)!;
  const categoryProducts = getProductsForCategory(category);
  return [
    {
      "@type": "CollectionPage",
      name: meta.title,
      url: absolute(path),
      inLanguage: "pt-BR",
      description: categorySummary(category),
      isPartOf: { "@id": ids.website },
      dateModified: getLastModified(path),
      mainEntity: itemList(
        `${categoryLabel(category)} – produtos mais citados no ${PODCAST_NAME}`,
        categoryProducts.length,
        productItems(categoryProducts),
      ),
    },
    crumbs(categoryLabel(category)),
  ];
}
