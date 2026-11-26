import { createRoot } from "react-dom/client";
import App from "./App";
import { initAnalytics } from "./lib/analytics";
import { initData } from "./lib/data-utils";
import type { RadarData } from "./lib/types";
import "./index.css";

/**
 * Os dados chegam num JSON separado do código, gerado no build (script/vite-radar-data.ts).
 * O endereço vem do <link id="radar-data"> que o build injeta no HTML, e o download já
 * começou com o preload. Até o React renderizar, fica visível o conteúdo prerenderizado.
 */
async function loadData(): Promise<RadarData> {
  const href = document.getElementById("radar-data")?.getAttribute("href");
  if (!href) throw new Error("link #radar-data ausente no HTML");
  const res = await fetch(href);
  if (!res.ok) throw new Error(`falha ao carregar ${href}: ${res.status}`);
  return res.json();
}

loadData()
  .then((data) => {
    initData(data);
    createRoot(document.getElementById("root")!).render(<App />);
  })
  .catch((err) => console.error("Não foi possível carregar os dados do site.", err));

initAnalytics();
