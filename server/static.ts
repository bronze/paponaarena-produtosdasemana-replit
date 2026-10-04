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
  app.use(express.static(distPath, { index: false }));

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

    res.status(known ? 200 : 404).type("html").send(html);
  });
}
