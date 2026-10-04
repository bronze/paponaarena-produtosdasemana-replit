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
} from "./data-utils";

export const SITE_URL = "https://paponaarena-produtosdasemana.replit.app";
export const SITE_NAME = "Papo na Arena";

export const DEFAULT_TITLE = "Papo na Arena – Produtos da Semana, Episódios e Menções";
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
  return (productNames.get(product.name) || 0) > 1 ? `${product.name} (${product.category})` : product.name;
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
      case "episodes":
        return {
          title: `Episódios do Papo na Arena – lista completa | ${SITE_NAME}`,
          description: `Todos os ${episodes.length} episódios do podcast Papo na Arena com os produtos da semana citados em cada um, por ano.`,
          canonicalPath: "/episodes",
        };
      case "products":
        return {
          title: `Produtos citados no Papo na Arena – ranking completo | ${SITE_NAME}`,
          description: `Ranking dos ${getLeaderboardProducts().length} produtos citados nos episódios do Papo na Arena, com categoria, número de menções e episódios.`,
          canonicalPath: "/products",
        };
      case "categories":
        return {
          title: `Categorias de produtos do Papo na Arena | ${SITE_NAME}`,
          description: `Os produtos da semana do Papo na Arena organizados em ${getUniqueCategories().length} categorias.`,
          canonicalPath: "/categories",
        };
      case "sobre":
        return {
          title: `Sobre o Papo na Arena e o Radar de Produtos da Semana | ${SITE_NAME}`,
          description:
            "Conheça o podcast Papo na Arena, de Arthur e Aíquis, e o Radar que reúne todos os produtos da semana citados nos episódios. Site feito com Replit.",
          canonicalPath: "/sobre",
        };
      case "people":
        return {
          title: `Quem fala no Papo na Arena – convidados e hosts | ${SITE_NAME}`,
          description:
            "Hosts e convidados do podcast Papo na Arena e os produtos que cada um recomendou ao longo dos episódios.",
          canonicalPath: "/people",
        };
    }
    return notFound(path);
  }

  if (!rawId || rest.length > 0) return notFound(path);
  const id = safeDecode(rawId);

  switch (section) {
    case "episodes": {
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
        canonicalPath: `/episodes/${episode.id}`,
      };
    }

    case "products": {
      const product = getProduct(id);
      if (!product) return notFound(path);

      const canonicalId = resolveParent(product.id);
      const canonical = getProduct(canonicalId) ?? product;
      const mentions = getMentionsForProduct(canonical.id);
      const episodeCount = new Set(mentions.map((m) => m.episodeId)).size;
      return {
        title: `${productLabel(canonical)} – menções no ${SITE_NAME}`,
        description: truncate(
          `${canonical.name} (${canonical.category}) foi citado ${plural(mentions.length, "vez", "vezes")} em ${plural(episodeCount, "episódio", "episódios")} do Papo na Arena. Veja quem recomendou e em quais episódios.`,
        ),
        canonicalPath: `/products/${encodeURIComponent(canonical.id)}`,
      };
    }

    case "people": {
      const person = getPerson(id);
      if (!person) return notFound(path);

      const mentions = getMentionsForPerson(person.id);
      const episodeCount = new Set(mentions.map((m) => m.episodeId)).size;
      return {
        title: `${personLabel(person)} no ${SITE_NAME} – produtos recomendados`,
        description: truncate(
          `${personLabel(person)} fez ${plural(mentions.length, "menção", "menções")} de produtos em ${plural(episodeCount, "episódio", "episódios")} do Papo na Arena. Veja o que recomendou.`,
        ),
        canonicalPath: `/people/${encodeURIComponent(person.id)}`,
      };
    }

    case "categories": {
      if (!getUniqueCategories().includes(id)) return notFound(path);

      const list = getProductsForCategory(id);
      const top = list.slice(0, 5).map((p) => p.name);
      return {
        title: `${id} – produtos da semana do ${SITE_NAME}`,
        description: truncate(
          `${plural(list.length, "produto", "produtos")} da categoria ${id} citados no Papo na Arena${top.length ? `, como ${top.join(", ")}` : ""}.`,
        ),
        canonicalPath: `/categories/${encodeURIComponent(id)}`,
      };
    }
  }

  return notFound(path);
}


export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@PaponaArena";
export const SPOTIFY_SHOW_URL = "https://open.spotify.com/show/7lcBkPYn5HgEZjTkJhNUFJ";

type JsonLd = Record<string, unknown>;

const absolute = (path: string) => `${SITE_URL}${path === "/" ? "/" : path}`;

function podcastSeries(): JsonLd {
  const hosts = ["arthur", "aiquis"]
    .map((id) => getPerson(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({
      "@type": "Person",
      name: p.name,
      ...(p.linkedinUrl ? { sameAs: [p.linkedinUrl] } : {}),
    }));

  return {
    "@type": "PodcastSeries",
    "@id": `${SITE_URL}/#podcast`,
    name: SITE_NAME,
    url: SPOTIFY_SHOW_URL,
    inLanguage: "pt-BR",
    description:
      "Podcast de Arthur e Aíquis sobre produto, tecnologia e inteligência artificial, com os produtos da semana em cada episódio.",
    author: hosts,
    sameAs: [YOUTUBE_CHANNEL_URL, SPOTIFY_SHOW_URL],
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

/** Dados estruturados (schema.org) da rota. Vazio para rotas inexistentes. */
export function getJsonLd(pathname: string): JsonLd[] {
  const meta = getPageMeta(pathname);
  if (meta.noindex) return [];

  const path = meta.canonicalPath;
  const [, section, rawId] = path.split("/");

  if (path === "/") {
    return [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: `${SITE_NAME} – Produtos da Semana`,
        alternateName: SITE_NAME,
        url: absolute("/"),
        inLanguage: "pt-BR",
        description: DEFAULT_DESCRIPTION,
        about: { "@id": `${SITE_URL}/#podcast` },
      },
      podcastSeries(),
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
        about: { "@id": `${SITE_URL}/#podcast` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      breadcrumbs([
        { name: SITE_NAME, path: "/" },
        { name: "Sobre", path },
      ]),
    ];
  }

  const sectionNames: Record<string, string> = {
    episodes: "Episódios",
    products: "Produtos",
    categories: "Categorias",
    people: "Pessoas",
  };
  const home = { name: SITE_NAME, path: "/" };
  const list = { name: sectionNames[section], path: `/${section}` };

  if (!rawId) return [breadcrumbs([home, list])];

  const id = safeDecode(rawId);
  const crumbs = (name: string) => breadcrumbs([home, list, { name, path }]);

  if (section === "episodes") {
    const episode = getEpisode(Number(id))!;
    const sameAs = [episode.youtubeLink, episode.spotifyLink].filter(Boolean);
    const cast = getEpisodeCast(episode.id);
    const actors = [...cast.hosts, ...cast.cohosts].map((p) => ({
      "@type": "Person",
      name: p.name,
      ...(p.linkedinUrl ? { sameAs: [p.linkedinUrl] } : {}),
    }));
    return [
      {
        "@type": "PodcastEpisode",
        name: episode.title,
        description: episode.description,
        url: absolute(path),
        datePublished: episode.date,
        episodeNumber: episode.id,
        inLanguage: "pt-BR",
        partOfSeries: { "@id": `${SITE_URL}/#podcast`, "@type": "PodcastSeries", name: SITE_NAME, url: SPOTIFY_SHOW_URL },
        ...(actors.length ? { actor: actors } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      crumbs(`Ep${episode.id}`),
    ];
  }

  const names: Record<string, string | undefined> = {
    products: getProduct(id)?.name,
    people: getPerson(id)?.name,
    categories: id,
  };
  return [crumbs(names[section] ?? id)];
}
