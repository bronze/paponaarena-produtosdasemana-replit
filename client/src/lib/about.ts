import { getTotalStats } from "./data-utils";

export const REPLIT_URL = "https://replit.com";

/** Textos da página /sobre, compartilhados entre o app e o HTML prerenderizado. */
export function getAboutCopy() {
  const stats = getTotalStats();
  return {
    podcast:
      "O Papo na Arena é um podcast com Arthur e Aíquis sobre produto, tecnologia e inteligência artificial. Nos episódios, os participantes compartilham os produtos da semana: ferramentas, apps, serviços e lançamentos que estão usando ou acompanhando.",
    site: `O Papo na Arena Radar reúne os produtos da semana mencionados no podcast em um só lugar: ${stats.totalMentions} menções de ${stats.totalProducts} produtos em ${stats.totalEpisodes} episódios, com ${stats.totalPeople} pessoas. Dá para ver o ranking dos produtos mais citados, navegar por categoria, conferir o que cada pessoa recomendou e descobrir em qual episódio cada produto apareceu.`,
    fan: "Projeto de fã, não oficial. O Papo na Arena Radar é feito por ouvintes e não tem vínculo com o Papo na Arena nem com a Product Arena.",
    replit: "Este site foi feito com Replit.",
  };
}
