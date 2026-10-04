/**
 * Nomes das categorias em português. Os dados e os endereços (/categories/AI%20Tools)
 * continuam com o nome original em inglês, para não quebrar links já indexados.
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
