const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-09-30" → "30 set 2026" */
export function formatShortDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]} ${year}`;
}

/** "2026-09-30" → "30 de setembro de 2026" */
export function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
