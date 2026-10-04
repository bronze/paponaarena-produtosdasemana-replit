import { episodes, mentions, people, products } from "../client/src/lib/data";
import { categoryLabel, categoryPath } from "../client/src/lib/categories";
import { getUniqueCategories, resolveParent } from "../client/src/lib/data-utils";
import { prerender } from "../server/prerender";

/** Valida a consistência de data.ts. Retorna a lista de problemas (vazia = ok). */
export function checkData(): string[] {
  const errors: string[] = [];
  const personIds = new Set(people.map((p) => p.id));
  const productIds = new Set(products.map((p) => p.id));
  const episodeIds = new Set(episodes.map((e) => e.id));

  const unique = (label: string, ids: (string | number)[]) => {
    const seen = new Set<string | number>();
    for (const id of ids) {
      if (seen.has(id)) errors.push(`${label} duplicado: ${id}`);
      seen.add(id);
    }
  };
  unique("Episódio", episodes.map((e) => e.id));
  unique("Pessoa", people.map((p) => p.id));
  unique("Produto", products.map((p) => p.id));
  unique("Menção", mentions.map((m) => m.id));

  for (const e of episodes) {
    const cohosts = e.cohosts ?? [];
    if (e.hosts.length === 0) errors.push(`Ep${e.id}: hosts vazio`);
    for (const id of [...e.hosts, ...cohosts]) {
      if (!personIds.has(id)) errors.push(`Ep${e.id}: pessoa inexistente em hosts/cohosts: ${id}`);
    }
    for (const id of cohosts) {
      if (e.hosts.includes(id)) errors.push(`Ep${e.id}: ${id} está em hosts e em cohosts`);
    }
  }

  for (const m of mentions) {
    if (!episodeIds.has(m.episodeId)) errors.push(`Menção ${m.id}: episódio inexistente ${m.episodeId}`);
    if (!personIds.has(m.personId)) errors.push(`Menção ${m.id}: pessoa inexistente ${m.personId}`);
    if (!productIds.has(m.productId)) errors.push(`Menção ${m.id}: produto inexistente ${m.productId}`);
  }

  return errors;
}

const unescapeHtml = (value: string) =>
  value.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/**
 * Prerenderiza todas as páginas de detalhe e confere o <h1> e o JSON-LD.
 * Pega rotas renomeadas sem atualizar o prerender (crawlers sem JS só veem esse HTML).
 */
export function checkPrerender(): string[] {
  const errors: string[] = [];
  const template =
    '<html><head><title></title><link rel="canonical" href=""></head><body><div id="root"></div></body></html>';

  const pages: { path: string; h1: string; type?: string }[] = [
    ...episodes.map((e) => ({ path: `/episodios/${e.id}`, h1: e.title, type: "PodcastEpisode" })),
    ...products
      .filter((p) => !p.parentId)
      .map((p) => ({ path: `/produtos/${encodeURIComponent(p.id)}`, h1: p.name })),
    ...people.map((p) => ({ path: `/pessoas/${encodeURIComponent(p.id)}`, h1: p.name })),
    ...getUniqueCategories().map((c) => ({ path: categoryPath(c), h1: categoryLabel(c) })),
  ];

  for (const page of pages) {
    const html = prerender(template, page.path);
    const h1 = html.match(/<h1>([^<]*)<\/h1>/)?.[1];
    if (h1 === undefined || unescapeHtml(h1) !== page.h1) {
      errors.push(`${page.path}: <h1> "${h1}", esperado "${page.h1}"`);
    }

    const json = html.match(/<script id="route-jsonld" type="application\/ld\+json">(.*?)<\/script>/)?.[1];
    const graph: Record<string, any>[] = json ? JSON.parse(json)["@graph"] : [];
    if (page.type && !graph.some((item) => item["@type"] === page.type)) {
      errors.push(`${page.path}: JSON-LD sem ${page.type}`);
    }
    const crumbs = graph.find((item) => item["@type"] === "BreadcrumbList");
    if (!crumbs) errors.push(`${page.path}: JSON-LD sem BreadcrumbList`);
    for (const item of crumbs?.itemListElement ?? []) {
      if (!item.name) errors.push(`${page.path}: breadcrumb na posição ${item.position} sem name`);
    }
  }

  // produtos filhos apontam para o pai
  const child = products.find((p) => p.parentId);
  if (child) {
    const parent = products.find((p) => p.id === resolveParent(child.id))!;
    const html = prerender(template, `/produtos/${encodeURIComponent(child.id)}`);
    if (!html.includes(`<h1>${parent.name.replace(/&/g, "&amp;")}</h1>`)) {
      errors.push(`/produtos/${child.id}: <h1> deveria ser o do pai (${parent.name})`);
    }
  }

  return errors;
}

// Execução direta: `npx tsx script/check-data.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = [...checkData(), ...checkPrerender()];
  if (errors.length) {
    console.error(`data.ts/prerender com ${errors.length} problema(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("data.ts e prerender ok");
}
