import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { isKnownRoute } from "./seo";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // (unknown routes still get the SPA shell, but with a real 404 status)
  app.use("/{*path}", (req, res) => {
    res
      .status(isKnownRoute(req.originalUrl.split("?")[0]) ? 200 : 404)
      .sendFile(path.resolve(distPath, "index.html"));
  });
}
