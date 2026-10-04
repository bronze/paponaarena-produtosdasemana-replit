import { RankRow } from "papo-na-arena-ds";

const top = [
  { id: "claude-code", name: "Claude Code", mentions: 73, episodes: 41 },
  { id: "claude", name: "Claude", mentions: 63, episodes: 38 },
  { id: "chatgpt", name: "ChatGPT", mentions: 56, episodes: 35 },
  { id: "replit", name: "Replit", mentions: 44, episodes: 27 },
];

export const ProductRanking = () => (
  <ol className="border-t">
    {top.map((p, i) => (
      <RankRow key={p.id} rank={i + 1} title={p.name} href={`/products/${p.id}`} count={p.mentions} max={top[0].mentions}>
        <p className="text-sm text-muted-foreground">AI Tools · em {p.episodes} episódios</p>
      </RankRow>
    ))}
  </ol>
);

export const ByEpisodes = () => (
  <ol className="border-t">
    {top.slice(0, 3).map((p, i) => (
      <RankRow key={p.id} rank={i + 1} title={p.name} href={`/products/${p.id}`} count={p.episodes} max={top[0].episodes} unit={["episódio", "episódios"]}>
        <p className="text-sm text-muted-foreground">AI Tools · {p.mentions} menções</p>
      </RankRow>
    ))}
  </ol>
);
