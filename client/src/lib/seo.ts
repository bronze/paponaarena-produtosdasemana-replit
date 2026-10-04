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
  return text.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
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

      const products = names.length ? ` Produtos citados: ${names.join(", ")}.` : "";
      return {
        title: `Ep${episode.id} – ${episode.title} | ${SITE_NAME}`,
        description: truncate(`${episode.description}${products}`),
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
        title: `${canonical.name} – menções no ${SITE_NAME}`,
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
        title: `${person.name} no ${SITE_NAME} – produtos recomendados`,
        description: truncate(
          `${person.name} fez ${plural(mentions.length, "menção", "menções")} de produtos em ${plural(episodeCount, "episódio", "episódios")} do Papo na Arena. Veja o que recomendou.`,
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

