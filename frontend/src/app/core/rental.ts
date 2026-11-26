// Regras de datas do aluguer usadas no ecrã.
// A API volta a validar e é ela que manda (R2, R4, R5).

// Dias cobrados: do dia de início até ao de fim, sem contar o dia de devolução.
export function rentalDays(startDate: string, endDate: string): number {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (start > end || isNaN(start) || isNaN(end)) return 0;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

// Hoje no formato do <input type="date"> (yyyy-MM-dd), na hora local.
// Não usar toISOString(): dá a data em UTC, que perto da meia-noite pode ser o dia errado.
export function todayIso(): string {
  return toIsoDate(new Date());
}

// Primeiro dia que se pode reservar: não se reserva para o próprio dia,
// porque o carro tem de ser preparado e a reserva nunca poderia ser cancelada
export function tomorrowIso(): string {
  const tomorrow = new Date();
  // setDate trata da mudança de mês e de ano (31/12 + 1 = 01/01)
  tomorrow.setDate(tomorrow.getDate() + 1);
  return toIsoDate(tomorrow);
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
