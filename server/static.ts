import express, { type Express, type Request } from "express";
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { isKnownRoute } from "./seo";
import { prerender } from "./prerender";

const IMMUTABLE = "public, max-age=31536000, immutable";

/** Extensões que o build pré-comprime (ver compressDist em script/build.ts). */
export const COMPRESSIBLE = /\.(js|css|json|html|svg|xml|txt|webmanifest)$/;

type Encoding = "br" | "gzip";

/** Melhor compressão que o navegador aceita: brotli, senão gzip, senão nenhuma. */
function pickEncoding(req: Request): Encoding | null {
  const accepted = String(req.headers["accept-encoding"] ?? "");
  if (/\bbr\b/.test(accepted)) return "br";
  if (/\bgzip\b/.test(accepted)) return "gzip";
  return null;
}

function compress(content: string, encoding: Encoding, quality: "max" | "fast"): Buffer {
  return encoding === "br"
    ? zlib.brotliCompressSync(content, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: quality === "max" ? 11 : 4 },
      })
    : zlib.gzipSync(content, { level: quality === "max" ? 9 : 6 });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }
  const assetsPath = path.join(distPath, "assets") + path.sep;

  // Arquivos de texto têm versões .br e .gz geradas no build: entrega a comprimida quando o
  // navegador aceita. O Express não comprime nada sozinho, e o Replit também não.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    if (!COMPRESSIBLE.test(req.path)) return next();
    res.vary("Accept-Encoding");

    const encoding = pickEncoding(req);
    if (!encoding) return next();

    const file = path.join(distPath, decodeURIComponent(req.path));
    if (!file.startsWith(distPath + path.sep)) return next();
    const compressed = `${file}.${encoding === "br" ? "br" : "gz"}`;
    if (!fs.existsSync(compressed)) return next();

    res.type(path.extname(file));
    res.setHeader("Content-Encoding", encoding);
    if (file.startsWith(assetsPath)) res.setHeader("Cache-Control", IMMUTABLE);
    res.sendFile(compressed);
  });

  // index: false -> "/" também passa pelo prerender, em vez de servir o index.html cru
  // Arquivos em /assets têm hash no nome (código e o JSON de dados): o conteúdo nunca muda
  // sob o mesmo nome, então o navegador pode guardá-los para sempre.
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.startsWith(assetsPath)) {
          res.setHeader("Cache-Control", IMMUTABLE);
        }
      },
    }),
  );

  const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
  // HTML de cada rota conhecida, gerado no primeiro acesso, com as versões comprimidas
  // calculadas uma vez por codificação
  const pages = new Map<string, { html: string; br?: Buffer; gzip?: Buffer }>();

  // Toda rota recebe o shell da SPA com head/conteúdo prerenderizados
  // (rotas desconhecidas saem com status 404 real)
  app.use("/{*path}", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const known = isKnownRoute(pathname);

    let page = known ? pages.get(pathname) : undefined;
    if (page === undefined) {
      page = { html: prerender(template, pathname) };
      if (known) pages.set(pathname, page);
    }

    // O HTML aponta para os arquivos atuais (código e dados): sempre confere se há versão nova
    res.status(known ? 200 : 404).type("html").set("Cache-Control", "no-cache").vary("Accept-Encoding");

    const encoding = pickEncoding(req);
    if (!encoding) {
      res.send(page.html);
      return;
    }
    // Rotas conhecidas ficam em memória: vale a compressão máxima. 404s não, então rápida.
    const body = known
      ? (page[encoding] ??= compress(page.html, encoding, "max"))
      : compress(page.html, encoding, "fast");
    res.setHeader("Content-Encoding", encoding);
    res.send(body);
  });
}
