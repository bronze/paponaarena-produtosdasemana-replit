import { episodes, mentions, people, products } from "../client/src/lib/data";

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

// Execução direta: `npx tsx script/check-data.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const errors = checkData();
  if (errors.length) {
    console.error(`data.ts com ${errors.length} problema(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("data.ts ok");
}
