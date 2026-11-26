import type { Plugin } from "vite";
import { createHash } from "crypto";
import type { RadarData } from "../client/src/lib/types";

/** Endereço do JSON no servidor de desenvolvimento (gerado a cada requisição, sem cache). */
const DEV_URL = "/radar-data.json";
/** Fonte dos dados, relativa à raiz do Vite (client/). */
const DATA_ENTRY = "/src/lib/data/index.ts";

function toJson(data: RadarData): string {
  const { episodes, products, people, mentions, dataRevisedAt } = data;
  return JSON.stringify({ episodes, products, people, mentions, dataRevisedAt });
}

/**
 * Tira os dados do JavaScript do site e os entrega como JSON separado.
 *
 * - Build: gera assets/radar-data-[hash].json. O hash muda só quando os dados mudam,
 *   então o navegador guarda dados e código em caches independentes.
 * - Dev: serve o JSON em /radar-data.json, sempre lendo a versão atual dos arquivos.
 * - Nos dois casos, injeta no HTML um <link rel="preload" id="radar-data"> com o endereço.
 *   O HTML nunca é guardado em cache, então é ele quem aponta para o JSON atual,
 *   e o JavaScript não precisa mudar quando sai um episódio.
 */
export function radarData(): Plugin {
  let isBuild = false;
  let fileName = "";
  let source = "";

  return {
    name: "radar-data",
    configResolved(config) {
      isBuild = config.command === "build";
    },
    async buildStart() {
      if (!isBuild) return;
      const data: RadarData = await import("../client/src/lib/data/index.ts");
      source = toJson(data);
      const hash = createHash("sha256").update(source).digest("hex").slice(0, 10);
      fileName = `assets/radar-data-${hash}.json`;
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName, source });
    },
    configureServer(server) {
      server.middlewares.use(DEV_URL, async (_req, res, next) => {
        try {
          const data = (await server.ssrLoadModule(DATA_ENTRY)) as RadarData;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(toJson(data));
        } catch (err) {
          next(err);
        }
      });
    },
    transformIndexHtml() {
      return [
        {
          tag: "link",
          attrs: {
            rel: "preload",
            as: "fetch",
            crossorigin: "anonymous",
            id: "radar-data",
            href: isBuild ? `/${fileName}` : DEV_URL,
          },
          injectTo: "head",
        },
      ];
    },
  };
}
