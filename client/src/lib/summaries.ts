import { categoryLabel } from "./categories";
import { formatLongDate } from "./dates";
import { joinNames } from "./text";
import {
  getEpisode,
  getEpisodeCast,
  getLastEpisode,
  getLeaderboardProducts,
  getMentionsForEpisode,
  getMentionsForPerson,
  getMentionsForProduct,
  getPerson,
  getPersonRoleCounts,
  getProduct,
  getProductsForCategory,
  getTotalStats,
  mentions as allMentions,
} from "./data-utils";
import type { Mention } from "./types";

/**
 * Frases de resumo no topo de cada página, compartilhadas entre o app e o HTML prerenderizado.
 * Respondem à pergunta principal da página com números, no formato que IAs e buscadores citam.
 */

const n = (value: number) => value.toLocaleString("pt-BR");
const plural = (count: number, singular: string, pluralForm: string) =>
  `${n(count)} ${count === 1 ? singular : pluralForm}`;
const episodeRef = (id: number) => {
  const episode = getEpisode(id);
  return episode ? `Ep${id} (${formatLongDate(episode.date)})` : `Ep${id}`;
};
const personName = (id: string) => getPerson(id)?.name ?? id;

/** Itens mais frequentes, em ordem decrescente (empate: ordem alfabética). */
function rank(ids: string[], label: (id: string) => string): { id: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) || 0) + 1);
  return Array.from(counts, ([id, count]) => ({ id, label: label(id), count })).sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt"),
  );
}

/** "X (3), Y (2) e Z (1)" */
const withCounts = (items: { label: string; count: number }[]) =>
  joinNames(items.map((i) => `${i.label} (${n(i.count)})`));

function episodeSpan(mentions: Mention[]): { first: number; last: number; count: number } {
  const ids = Array.from(new Set(mentions.map((m) => m.episodeId))).sort(
    (a, b) => (getEpisode(a)?.date ?? "").localeCompare(getEpisode(b)?.date ?? ""),
  );
  return { first: ids[0], last: ids[ids.length - 1], count: ids.length };
}

export function homeSummary(): string {
  const stats = getTotalStats();
  const last = getLastEpisode();
  const [p1, p2, p3] = getLeaderboardProducts();
  const topPeople = rank(allMentions.map((m) => m.personId), personName).slice(0, 2);

  return (
    `Até o ${episodeRef(last.id)}, foram registradas ${n(stats.totalMentions)} menções de ${n(stats.totalProducts)} produtos ` +
    `em ${n(stats.totalEpisodes)} episódios do Papo na Arena, feitas por ${n(stats.totalPeople)} pessoas. ` +
    `O produto mais citado é ${p1.name} (${plural(p1.mentionCount, "menção", "menções")}), seguido de ${p2.name} (${n(p2.mentionCount)}) e ${p3.name} (${n(p3.mentionCount)}). ` +
    `Quem mais recomendou produtos: ${withCounts(topPeople)}.`
  );
}

export function productSummary(productId: string): string {
  const product = getProduct(productId);
  if (!product) return "";
  const mentions = getMentionsForProduct(product.id);
  if (mentions.length === 0) return "";

  const span = episodeSpan(mentions);
  const who = rank(mentions.map((m) => m.personId), personName);
  const head = `${product.name} (${categoryLabel(product.category)}) foi citado ${plural(mentions.length, "vez", "vezes")} no Papo na Arena`;

  if (span.count === 1) {
    return `${head}, no ${episodeRef(span.first)}, por ${joinNames(who.map((w) => w.label))}.`;
  }
  const recommenders =
    who.length === 1
      ? `Todas as recomendações são de ${who[0].label}.`
      : who[0].count === 1
        ? `Foi recomendado por ${n(who.length)} pessoas diferentes, como ${joinNames(who.slice(0, 3).map((w) => w.label))}.`
        : `Quem mais recomendou: ${withCounts(who.slice(0, 3))}${who.length > 3 ? `, entre ${n(who.length)} pessoas` : ""}.`;
  return (
    `${head}, em ${plural(span.count, "episódio", "episódios")}. ` +
    `A primeira menção foi no ${episodeRef(span.first)} e a mais recente no ${episodeRef(span.last)}. ` +
    recommenders
  );
}

export function episodeSummary(episodeId: number): string {
  const episode = getEpisode(episodeId);
  if (!episode) return "";
  const cast = getEpisodeCast(episode.id);
  const castNames = [...cast.hosts, ...cast.cohosts].map((p) => p.name);
  const withCast = castNames.length ? `, com ${joinNames(castNames)},` : "";
  const intro = `No Ep${episode.id} do Papo na Arena (${formatLongDate(episode.date)})${withCast}`;

  // produto (como foi citado) → quem citou, na ordem dos dados
  const byProduct = new Map<string, string[]>();
  for (const m of getMentionsForEpisode(episode.id)) {
    const name = getProduct(m.productId)?.name;
    if (!name) continue;
    const who = byProduct.get(name) ?? [];
    const person = personName(m.personId);
    if (!who.includes(person)) who.push(person);
    byProduct.set(name, who);
  }
  if (byProduct.size === 0) return `${intro} não foram registrados produtos da semana.`;
  // conta menções, não produtos: variações (Claude Opus 5.5 → Claude) aparecem com o próprio nome
  const mentionCount = getMentionsForEpisode(episode.id).length;

  const LIMIT = 8;
  const items = Array.from(byProduct, ([name, who]) => `${name} (por ${joinNames(who)})`);
  const shown = items.slice(0, LIMIT);
  if (items.length > LIMIT) shown.push(`mais ${plural(items.length - LIMIT, "produto", "produtos")}`);
  return `${intro} ${mentionCount === 1 ? "foi feita 1 menção" : `foram feitas ${n(mentionCount)} menções`} de produtos da semana: ${joinNames(shown)}.`;
}

export function personSummary(personId: string): string {
  const person = getPerson(personId);
  if (!person) return "";
  const mentions = getMentionsForPerson(person.id);
  const roles = getPersonRoleCounts(person.id);

  const roleParts = [
    roles.host > 0 && `host em ${plural(roles.host, "episódio", "episódios")}`,
    roles.cohost > 0 && `cohost em ${plural(roles.cohost, "episódio", "episódios")}`,
  ].filter(Boolean) as string[];
  const roleText = roleParts.length ? ` Foi ${joinNames(roleParts)}.` : "";

  if (mentions.length === 0) return `${person.name} participou do Papo na Arena.${roleText}`;

  const span = episodeSpan(mentions);
  // pelo produto exato (sem juntar variações), como na lista da página da pessoa
  const top = rank(
    mentions.map((m) => m.productId),
    (id) => getProduct(id)?.name ?? id,
  );
  const distinct = top.length;
  const where =
    span.count === 1
      ? `no ${episodeRef(span.first)}`
      : `em ${plural(span.count, "episódio", "episódios")}, do ${episodeRef(span.first)} ao ${episodeRef(span.last)}`;
  const favorites =
    top[0].count > 1
      ? ` Os que mais aparecem: ${withCounts(top.filter((t) => t.count > 1).slice(0, 3))}.`
      : distinct > 1
        ? ` Entre eles: ${joinNames(top.slice(0, 3).map((t) => t.label))}.`
        : ` O produto foi ${top[0].label}.`;

  return (
    `${person.name} recomendou ${plural(distinct, "produto", "produtos")} no Papo na Arena ${where}.` +
    roleText +
    favorites
  );
}

export function categorySummary(category: string): string {
  const list = getProductsForCategory(category);
  if (list.length === 0) return "";
  const label = categoryLabel(category);
  const total = list.reduce((sum, p) => sum + p.mentionCount, 0);
  const top = list.slice(0, 3).map((p) => ({ label: p.name, count: p.mentionCount }));
  const topText =
    list.length === 1
      ? `O único produto é ${top[0].label}.`
      : `Os mais citados são ${withCounts(top)}.`;
  return (
    `A categoria ${label} reúne ${plural(list.length, "produto", "produtos")} e ${plural(total, "menção", "menções")} no Papo na Arena. ` +
    topText
  );
}
