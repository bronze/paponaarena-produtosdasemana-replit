import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { isKnownRoute } from "./seo";
import { prerender } from "./prerender";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // index: false -> "/" também passa pelo prerender, em vez de servir o index.html cru
  // Arquivos em /assets têm hash no nome (código e o JSON de dados): o conteúdo nunca muda
  // sob o mesmo nome, então o navegador pode guardá-los para sempre.
  app.use(
    express.static(distPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.startsWith(path.join(distPath, "assets") + path.sep)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    }),
  );

  const template = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
  const pages = new Map<string, string>();

  // Toda rota recebe o shell da SPA com head/conteúdo prerenderizados
  // (rotas desconhecidas saem com status 404 real)
  app.use("/{*path}", (req, res) => {
    const pathname = req.originalUrl.split("?")[0];
    const known = isKnownRoute(pathname);

    let html = known ? pages.get(pathname) : undefined;
    if (html === undefined) {
      html = prerender(template, pathname);
      if (known) pages.set(pathname, html);
    }

    // O HTML aponta para os arquivos atuais (código e dados): sempre confere se há versão nova
    res.status(known ? 200 : 404).type("html").set("Cache-Control", "no-cache").send(html);
  });
}
