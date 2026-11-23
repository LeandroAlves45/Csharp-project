// Regras de datas do aluguer usadas no ecrã.
// A API volta a validar e é ela que manda (R2, R4, R5).

// Dias cobrados (R5): do dia de início até ao de fim, sem contar o dia de devolução.
export function rentalDays(startDate: string, endDate: string): number {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (start > end || isNaN(start) || isNaN(end)) return 0;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

// Hoje no formato do <input type="date"> (yyyy-MM-dd), na hora local.
// Não usar toISOString(): dá a data em UTC, que perto da meia-noite pode ser o dia errado.
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
