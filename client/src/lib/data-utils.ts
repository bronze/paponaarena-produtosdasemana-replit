import { episodes, products, people, mentions } from "./data";
import type { Product, Mention } from "./types";

const productMap = new Map(products.map((p) => [p.id, p]));
const episodeMap = new Map(episodes.map((e) => [e.id, e]));
const personMap = new Map(people.map((p) => [p.id, p]));

export function getProduct(id: string) {
  return productMap.get(id);
}
export function getEpisode(id: number) {
  return episodeMap.get(id);
}
export function getPerson(id: string) {
  return personMap.get(id);
}

export function resolveParent(productId: string): string {
  const product = productMap.get(productId);
  if (!product) return productId;
  if (product.parentId) {
    return resolveParent(product.parentId);
  }
  return productId;
}

function isChild(product: Product): boolean {
  return !!product.parentId;
}

function isCombo(product: Product): boolean {
  return !!product.alsoCredits && product.alsoCredits.length > 0;
}

export function getEffectiveMentionCounts(): Map<string, number> {
  const counts = new Map<string, number>();

  for (const mention of mentions) {
    const product = productMap.get(mention.productId);
    if (!product) continue;

    if (isCombo(product)) {
      for (const creditId of product.alsoCredits!) {
        const resolvedId = resolveParent(creditId);
        counts.set(resolvedId, (counts.get(resolvedId) || 0) + 1);
      }
    } else {
      const resolvedId = resolveParent(mention.productId);
      counts.set(resolvedId, (counts.get(resolvedId) || 0) + 1);
    }
  }

  return counts;
}

export function getLeaderboardProducts() {
  const counts = getEffectiveMentionCounts();
  return products
    .filter((p) => !isChild(p) && !isCombo(p))
    .map((p) => ({ ...p, mentionCount: counts.get(p.id) || 0 }))
    .filter((p) => p.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

export function getCategoryStats() {
  const counts = getEffectiveMentionCounts();
  const catMap = new Map<string, number>();

  for (const product of products) {
    if (isChild(product) || isCombo(product)) continue;
    const count = counts.get(product.id) || 0;
    if (count > 0) {
      catMap.set(product.category, (catMap.get(product.category) || 0) + count);
    }
  }

  return Array.from(catMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export function getProductsForCategory(category: string) {
  const counts = getEffectiveMentionCounts();
  return products
    .filter((p) => p.category === category && !isChild(p) && !isCombo(p))
    .map((p) => ({ ...p, mentionCount: counts.get(p.id) || 0 }))
    .filter((p) => p.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount);
}

export function getChildProducts(parentId: string) {
  return products.filter((p) => p.parentId === parentId);
}

export function getMentionsForProduct(productId: string): Mention[] {
  const children = products.filter((p) => resolveParent(p.id) === productId);
  const childIds = new Set(children.map((c) => c.id));
  childIds.add(productId);

  const combosCrediting = products.filter(
    (p) => isCombo(p) && p.alsoCredits!.some((c) => childIds.has(c) || resolveParent(c) === productId)
  );
  const comboIds = new Set(combosCrediting.map((c) => c.id));

  return mentions.filter((m) => childIds.has(m.productId) || comboIds.has(m.productId));
}

export function getMentionsForEpisode(episodeId: number) {
  return mentions.filter((m) => m.episodeId === episodeId);
}

export function getMentionsForPerson(personId: string) {
  return mentions.filter((m) => m.personId === personId);
}

export function getEpisodeMentionCount(episodeId: number) {
  return mentions.filter((m) => m.episodeId === episodeId).length;
}

export function getPersonMentionCount(personId: string) {
  return mentions.filter((m) => m.personId === personId).length;
}

export function getMentionsPerEpisodeTrend() {
  const sorted = [...episodes].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map((ep) => ({
    episode: `#${ep.id}`,
    episodeId: ep.id,
    mentions: getEpisodeMentionCount(ep.id),
    date: ep.date,
  }));
}

export function getTopProductsAscension(topN = 5) {
  const top = getLeaderboardProducts().slice(0, topN);
  const topIds = new Set(top.map((p) => p.id));
  const sortedEps = [...episodes].sort((a, b) => a.date.localeCompare(b.date));

  const cumulative: Record<string, number> = {};
  for (const p of top) cumulative[p.id] = 0;

  return sortedEps.map((ep) => {
    const epMentions = mentions.filter((m) => m.episodeId === ep.id);
    for (const m of epMentions) {
      const product = productMap.get(m.productId);
      if (!product) continue;
      if (isCombo(product)) {
        for (const creditId of product.alsoCredits!) {
          const resolvedId = resolveParent(creditId);
          if (topIds.has(resolvedId)) cumulative[resolvedId]++;
        }
      } else {
        const resolvedId = resolveParent(m.productId);
        if (topIds.has(resolvedId)) cumulative[resolvedId]++;
      }
    }
    const point: Record<string, string | number> = { episode: `#${ep.id}` };
    for (const p of top) point[p.name] = cumulative[p.id];
    return point;
  });
}

export function getTopProductNames(topN = 5) {
  return getLeaderboardProducts()
    .slice(0, topN)
    .map((p) => p.name);
}

export function getUniqueCategories() {
  const cats = new Set<string>();
  for (const p of products) {
    if (!isChild(p) && !isCombo(p)) {
      cats.add(p.category);
    }
  }
  return Array.from(cats);
}

export function getTotalStats() {
  const counts = getEffectiveMentionCounts();
  const parentProducts = products.filter((p) => !isChild(p) && !isCombo(p));
  const productsWithMentions = parentProducts.filter((p) => (counts.get(p.id) || 0) > 0);

  return {
    totalEpisodes: episodes.length,
    totalProducts: productsWithMentions.length,
    totalCategories: getUniqueCategories().length,
    totalPeople: people.length,
    totalMentions: mentions.length,
  };
}

export function getRecentMentions(limit = 10) {
  const sortedEpisodes = [...episodes].sort((a, b) => b.date.localeCompare(a.date));
  const result: Array<{ mention: Mention; episodeDate: string }> = [];

  for (const ep of sortedEpisodes) {
    const epMentions = mentions.filter((m) => m.episodeId === ep.id);
    for (const m of epMentions) {
      result.push({ mention: m, episodeDate: ep.date });
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export function getParticipantsForEpisode(episodeId: number) {
  const epMentions = mentions.filter((m) => m.episodeId === episodeId);
  const personIds = new Set(epMentions.map((m) => m.personId));
  return Array.from(personIds)
    .map((id) => personMap.get(id))
    .filter(Boolean);
}

export function getLastEpisode() {
  return [...episodes].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export { episodes, products, people, mentions };
