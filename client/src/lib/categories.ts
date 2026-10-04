/**
 * Nomes das categorias em português. Os dados continuam com o nome original em inglês;
 * o endereço usa o nome em português sem acentos (/categorias/ferramentas-de-ia).
 */
const CATEGORY_LABELS: Record<string, string> = {
  "AI Tools": "Ferramentas de IA",
  Analytics: "Análise de dados",
  Apps: "Apps",
  Automation: "Automação",
  Business: "Negócios",
  Communication: "Comunicação",
  Data: "Dados",
  Delivery: "Delivery",
  Development: "Desenvolvimento",
  Education: "Educação",
  Entertainment: "Entretenimento",
  Finance: "Finanças",
  Fitness: "Exercícios",
  "Food & Drink": "Comida e bebida",
  Hardware: "Hardware",
  Health: "Saúde",
  Insurance: "Seguros",
  Lifestyle: "Estilo de vida",
  Productivity: "Produtividade",
  Reading: "Leitura",
  Retail: "Compras",
  Services: "Serviços",
  Social: "Redes sociais",
  Tech: "Tecnologia",
  Transportation: "Transporte",
  Travel: "Viagem",
  Utilities: "Utilidades",
  Wellness: "Bem-estar",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

/** Endereço da categoria: nome em português sem acentos, com hífens ("AI Tools" → "ferramentas-de-ia"). */
export function categorySlug(category: string): string {
  return categoryLabel(category)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Caminho da página da categoria. */
export function categoryPath(category: string): string {
  return `/categorias/${categorySlug(category)}`;
}
