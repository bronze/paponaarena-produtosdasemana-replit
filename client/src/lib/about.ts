import { mentions } from "./data";
import { getEpisode, getPerson, getProduct, getTotalStats } from "./data-utils";

export const REPLIT_URL = "https://replit.com";

export const MAINTAINER = {
  name: "Carlos Bronze",
  personId: "carlos-bronze",
  siteUrl: "https://www.carlosbronze.com.br/",
  linkedinUrl: "https://www.linkedin.com/in/carlosbronze/",
};

/** Textos da página /sobre, compartilhados entre o app e o HTML prerenderizado. */
export function getAboutCopy() {
  const stats = getTotalStats();
  const n = (value: number) => value.toLocaleString("pt-BR");
  const fanTitle = "Projeto de fã, não oficial.";
  const fanBody = "O Papo na Arena Radar é feito por um ouvinte e não tem vínculo com o Papo na Arena nem com a Product Arena.";
  return {
    fan: `${fanTitle} ${fanBody}`,
    fanTitle,
    fanBody,
    podcast:
      "O Papo na Arena é um podcast com Arthur e Aíquis sobre produto, tecnologia e inteligência artificial. Nos episódios, os participantes compartilham os produtos da semana: ferramentas, apps, serviços e lançamentos que estão usando ou acompanhando.",
    site: `O Papo na Arena Radar reúne os produtos da semana mencionados no podcast em um só lugar: ${n(stats.totalMentions)} menções em ${n(stats.totalEpisodes)} episódios, de ${n(stats.totalProducts)} produtos e ${n(stats.totalPeople)} pessoas. Dá para ver o ranking dos produtos mais citados, navegar por categoria, conferir o que cada pessoa recomendou e descobrir em qual episódio cada produto apareceu.`,
    maintainer: `Mantido por ${MAINTAINER.name}. As menções são adicionadas à mão depois que cada episódio vai ao ar.`,
    replit: "Este site foi feito com Replit.",
  };
}

/**
 * O marco do produto nº 1.000, marcado à mão nos dados com "#1000" no comentário da menção
 * (a contagem atual pode ter mudado depois, com menções antigas adicionadas).
 */
export function getThousandthMention() {
  const mention = mentions.find((m) => m.context?.includes("#1000"));
  if (!mention) return undefined;
  const person = getPerson(mention.personId);
  const product = getProduct(mention.productId);
  const episode = getEpisode(mention.episodeId);
  if (!person || !product || !episode) return undefined;
  return { mention, person, product, episode };
}
