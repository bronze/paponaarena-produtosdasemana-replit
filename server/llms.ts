import { categoryLabel, categoryPath } from "../client/src/lib/categories";
import {
  episodes,
  getEpisodeCast,
  getLastEpisode,
  getLeaderboardProducts,
  getMentionsForEpisode,
  getPerson,
  getProduct,
  getTotalStats,
  getUniqueCategories,
  people,
  getMentionsForPerson,
} from "../client/src/lib/data-utils";
import { getAboutCopy, MAINTAINER } from "../client/src/lib/about";
import { formatList, SITE_URL, SPOTIFY_SHOW_URL, YOUTUBE_CHANNEL_URL } from "../client/src/lib/seo";

// Arquivos para LLMs (https://llmstxt.org): /llms.txt é o índice curto, /llms-full.txt traz o acervo inteiro.

const url = (path: string) => `${SITE_URL}${path}`;
const n = (value: number) => value.toLocaleString("pt-BR");
const plural = (count: number, singular: string, pluralForm: string) =>
  `${n(count)} ${count === 1 ? singular : pluralForm}`;
const sortedEpisodes = () => [...episodes].sort((a, b) => b.date.localeCompare(a.date));

function header(): string {
  const stats = getTotalStats();
  const last = getLastEpisode();
  const copy = getAboutCopy();
  return [
    "# Papo na Arena Radar",
    "",
    `> Índice não oficial de todos os produtos da semana citados no podcast Papo na Arena, de Arthur e Aíquis: ${n(stats.totalMentions)} menções de ${n(stats.totalProducts)} produtos em ${n(stats.totalEpisodes)} episódios, com quem recomendou cada produto e em qual episódio.`,
    "",
    copy.podcast,
    "",
    `${copy.fan} ${copy.maintainer}`,
    "",
    `Dados atualizados até o Ep${last.id} (${last.date}). Fonte: ${SITE_URL}/`,
  ].join("\n");
}

function topProducts(limit?: number): string[] {
  const list = getLeaderboardProducts();
  return (limit ? list.slice(0, limit) : list).map(
    (p, i) =>
      `${i + 1}. [${p.name}](${url(`/produtos/${encodeURIComponent(p.id)}`)}) (${categoryLabel(p.category)}): ${plural(p.mentionCount, "menção", "menções")}`,
  );
}

function topPeople(limit: number): string[] {
  return people
    .map((p) => ({ ...p, count: getMentionsForPerson(p.id).length }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(
      (p, i) =>
        `${i + 1}. [${p.name}](${url(`/pessoas/${encodeURIComponent(p.id)}`)}): ${plural(p.count, "menção", "menções")}`,
    );
}

export function buildLlmsTxt(): string {
  const last = getLastEpisode();
  return [
    header(),
    "",
    "## Páginas",
    "",
    `- [Início](${url("/")}): ranking dos produtos mais citados e episódios recentes`,
    `- [Episódios](${url("/episodios")}): todos os episódios com os produtos citados em cada um`,
    `- [Produtos](${url("/produtos")}): ranking completo, com categoria, menções e episódios`,
    `- [Categorias](${url("/categorias")}): produtos agrupados em ${getUniqueCategories().length} categorias`,
    `- [Pessoas](${url("/pessoas")}): hosts e convidados e o que cada um recomendou`,
    `- [Sobre](${url("/sobre")}): o que é o podcast e este site`,
    `- [Último episódio: Ep${last.id} – ${last.title}](${url(`/episodios/${last.id}`)})`,
    "",
    "## Produtos mais citados",
    "",
    ...topProducts(20),
    "",
    "## Quem mais recomendou produtos",
    "",
    ...topPeople(10),
    "",
    "## Podcast oficial",
    "",
    `- [Spotify](${SPOTIFY_SHOW_URL})`,
    `- [YouTube](${YOUTUBE_CHANNEL_URL})`,
    "",
    "## Optional",
    "",
    `- [Acervo completo em Markdown](${url("/llms-full.txt")}): todos os episódios, com participantes e produtos citados por pessoa, e o ranking completo`,
    `- [Sitemap](${url("/sitemap.xml")})`,
    `- [Mantenedor: ${MAINTAINER.name}](${MAINTAINER.siteUrl})`,
    "",
  ].join("\n");
}

function episodeSection(episodeId: number): string {
  const episode = episodes.find((e) => e.id === episodeId)!;
  const cast = getEpisodeCast(episode.id);
  const lines = [`## Ep${episode.id} – ${episode.title}`, "", `- Data: ${episode.date}`];
  if (cast.hosts.length) lines.push(`- Hosts: ${formatList(cast.hosts.map((p) => p.name))}`);
  if (cast.cohosts.length) lines.push(`- Cohosts: ${formatList(cast.cohosts.map((p) => p.name))}`);
  lines.push(`- Página: ${url(`/episodios/${episode.id}`)}`);
  if (episode.youtubeLink) lines.push(`- YouTube: ${episode.youtubeLink}`);
  if (episode.spotifyLink) lines.push(`- Spotify: ${episode.spotifyLink}`);
  if (episode.description) lines.push("", episode.description);

  // menções agrupadas por pessoa, na ordem em que aparecem nos dados
  const byPerson = new Map<string, string[]>();
  for (const m of getMentionsForEpisode(episode.id)) {
    const product = getProduct(m.productId);
    if (!product) continue;
    const item = m.context ? `${product.name} (${m.context})` : product.name;
    byPerson.set(m.personId, [...(byPerson.get(m.personId) ?? []), item]);
  }
  if (byPerson.size) {
    lines.push("", "Produtos da semana:", "");
    for (const [personId, items] of Array.from(byPerson)) {
      lines.push(`- ${getPerson(personId)?.name ?? personId}: ${items.join(", ")}`);
    }
  }
  return lines.join("\n");
}

export function buildLlmsFullTxt(): string {
  return [
    header(),
    "",
    "Este arquivo traz o acervo inteiro: os episódios, do mais recente ao mais antigo, com os produtos da semana citados por cada pessoa, e depois o ranking completo de produtos e as categorias.",
    "",
    "# Episódios",
    "",
    sortedEpisodes().map((e) => episodeSection(e.id)).join("\n\n"),
    "",
    "# Ranking completo de produtos",
    "",
    "Variações de um produto (ex.: versões de um mesmo app) contam para o produto principal.",
    "",
    ...topProducts(),
    "",
    "# Categorias",
    "",
    ...getUniqueCategories().map((c) => `- [${categoryLabel(c)}](${url(categoryPath(c))})`),
    "",
  ].join("\n");
}
