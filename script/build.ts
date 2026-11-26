import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import zlib from "zlib";
import { COMPRESSIBLE } from "../server/static";
import { checkData, checkPrerender } from "./check-data";
import { mentions } from "../client/src/lib/data";


// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  const dataErrors = checkData();
  if (dataErrors.length) {
    throw new Error(`dados inválidos:\n- ${dataErrors.join("\n- ")}`);
  }
  const prerenderErrors = checkPrerender();
  if (prerenderErrors.length) {
    throw new Error(`prerender inválido:\n- ${prerenderErrors.slice(0, 20).join("\n- ")}`);
  }

  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  await checkClientData();
  await compressDist("dist/public");

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

/**
 * Os dados devem sair num JSON próprio (script/vite-radar-data.ts), fora do JavaScript.
 * Falha se o JSON não foi gerado ou se algum dado vazou para o código do navegador
 * (por exemplo, alguém importou client/src/lib/data ou data-static.ts no cliente).
 */
async function checkClientData() {
  const assetsDir = "dist/public/assets";
  const files = await readdir(assetsDir);
  const json = files.filter((f) => /^radar-data-[0-9a-f]+\.json$/.test(f));
  if (json.length !== 1) {
    throw new Error(`esperado 1 radar-data-*.json em ${assetsDir}, encontrado ${json.length}`);
  }
  const html = await readFile("dist/public/index.html", "utf-8");
  if (!html.includes(`/assets/${json[0]}`)) {
    throw new Error(`index.html não aponta para ${json[0]}`);
  }
  const sentinel = `"${mentions[mentions.length - 1].id}"`;
  for (const file of files.filter((f) => f.endsWith(".js"))) {
    const code = await readFile(path.join(assetsDir, file), "utf-8");
    if (code.includes(sentinel)) {
      throw new Error(`dados vazaram para o JavaScript do site (${file} contém ${sentinel})`);
    }
  }
}

/**
 * Gera versões .br (brotli) e .gz (gzip) dos arquivos de texto, na compressão máxima,
 * para o servidor entregar sem comprimir a cada requisição (ver server/static.ts).
 */
async function compressDist(dir: string) {
  let original = 0;
  let brotli = 0;
  for (const entry of await readdir(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !COMPRESSIBLE.test(entry.name)) continue;
    // parentPath só existe a partir do Node 20.12; antes disso, o mesmo valor vem em path
    const parent = entry.parentPath ?? (entry as unknown as { path: string }).path;
    const file = path.join(parent, entry.name);
    const content = await readFile(file);
    if (content.length < 1024) continue;
    const br = zlib.brotliCompressSync(content, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    });
    await writeFile(`${file}.br`, br);
    await writeFile(`${file}.gz`, zlib.gzipSync(content, { level: 9 }));
    original += content.length;
    brotli += br.length;
  }
  console.log(`compressed: ${Math.round(original / 1024)} KB -> ${Math.round(brotli / 1024)} KB (brotli)`);
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
