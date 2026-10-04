import { LatestEpisode } from "papo-na-arena-ds";

const episode = {
  id: 136,
  title: "O Vale faz algo diferente em produto e IA?",
  date: "2026-09-30",
  description: "Discussão sobre se o Vale do Silício faz algo diferente em produto e IA, e os produtos da semana.",
  youtubeLink: "https://www.youtube.com/watch?v=PR_Z6fPAI6w",
  spotifyLink: "https://open.spotify.com/episode/5YqA5txsuWegGGHA5XT460",
  hosts: ["arthur", "aiquis"],
  cohosts: ["gabriel-hamu", "bruno-nunes"],
};
const cast = [
  { id: "arthur", name: "Arthur" },
  { id: "aiquis", name: "Aíquis" },
  { id: "gabriel-hamu", name: "Gabriel Hamú" },
  { id: "bruno-nunes", name: "Bruno Nunes" },
];
const products = [
  { id: "codex-openai", name: "Codex da OpenAI", category: "AI Tools" },
  { id: "claude-opus-55", name: "Claude Opus 5.5", category: "AI Tools" },
  { id: "claude-fable", name: "Claude Fable", category: "AI Tools" },
];

export const Escuro = () => <LatestEpisode variant="escuro" episode={episode} cast={cast} mentionCount={5} products={products} />;
export const Cinza = () => <LatestEpisode variant="cinza" episode={episode} cast={cast} mentionCount={5} products={products} />;
export const Editorial = () => <LatestEpisode variant="editorial" episode={episode} cast={cast} mentionCount={5} products={products} />;
