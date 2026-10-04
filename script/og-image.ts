import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { episodes } from "../client/src/lib/data";
import { getEpisodeMentionCount, getTotalStats } from "../client/src/lib/data-utils";

/**
 * Gera client/public/og-image.jpg (1200×630) a partir de script/og/og-image.html,
 * com totais e onda sonora de fundo (menções por episódio) tirados de data.ts. Uso: `npm run og`.
 * Precisa de google-chrome (ou CHROME_PATH), do `convert` do ImageMagick e de internet (Google Fonts).
 */
const root = path.resolve(import.meta.dirname, "..");
const template = path.join(root, "script/og/og-image.html");
const output = path.join(root, "client/public/og-image.jpg");
const chrome = process.env.CHROME_PATH ?? "google-chrome";

const fmt = (n: number) => n.toLocaleString("pt-BR");

function fail(message: string): never {
  console.error(`og-image: ${message}`);
  process.exit(1);
}

const stats = getTotalStats();

// Onda sonora de fundo: uma barra por episódio, em ordem, com altura proporcional às menções
const ordered = [...episodes].sort((a, b) => a.id - b.id);
const perEpisode = ordered.map((e) => getEpisodeMentionCount(e.id));
// Acima de 150 episódios as barras ficariam finas demais; agrupa episódios vizinhos pela média
const MAX_BARS = 150;
const group = Math.max(1, Math.ceil(perEpisode.length / MAX_BARS));
const bars: number[] = [];
for (let i = 0; i < perEpisode.length; i += group) {
  const slice = perEpisode.slice(i, i + group);
  bars.push(slice.reduce((a, b) => a + b, 0) / slice.length);
}
const peak = Math.max(1, ...bars);
// A barra mais alta ocupa 90% da altura da imagem
const wave = bars.map((n) => `<i style="height:${Math.max(2, Math.round((n / peak) * 90))}%"></i>`).join("");
const waveGap = bars.length > 120 ? 3 : 4;

// Função como substituto: evita que um "$" nos dados vire padrão especial do replace
const html = readFileSync(template, "utf8")
  .replace("{{products}}", () => fmt(stats.totalProducts))
  .replace("{{mentions}}", () => fmt(stats.totalMentions))
  .replace("{{episodes}}", () => fmt(stats.totalEpisodes))
  .replace("{{waveGap}}", () => String(waveGap))
  .replaceAll("{{wave}}", () => wave);

function runChrome(args: string[]) {
  try {
    return execFileSync(
      chrome,
      ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=10000", ...args],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 60_000 },
    );
  } catch (error) {
    fail(`o Chrome falhou (${chrome}). Defina CHROME_PATH se ele estiver em outro lugar.\n${(error as Error).message}`);
  }
}

const dir = mkdtempSync(path.join(tmpdir(), "og-image-"));
try {
  const page = path.join(dir, "og.html");
  const shot = path.join(dir, "og.png");
  writeFileSync(page, html);

  // Sem a Plus Jakarta Sans o Chrome usaria uma fonte substituta em silêncio; melhor parar do que gerar imagem fora da marca
  const dom = runChrome(["--dump-dom", `file://${page}`]);
  if (!dom.includes('data-font="ok"')) {
    fail("a fonte Plus Jakarta Sans não carregou (sem internet ou Google Fonts fora do ar). A imagem não foi alterada.");
  }

  // O headless do Chrome corta a viewport em --window-size; renderiza mais alto e recorta depois
  runChrome(["--window-size=1200,800", `--screenshot=${shot}`, `file://${page}`]);
  if (!existsSync(shot)) fail("o Chrome não gerou o screenshot.");
  execFileSync("convert", [shot, "-crop", "1200x630+0+0", "+repage", "-quality", "90", output]);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(
  `og-image.jpg gerada: ${fmt(stats.totalProducts)} produtos · ${fmt(stats.totalMentions)} menções · ${fmt(stats.totalEpisodes)} episódios`,
);
