import { Reservation } from './models/reservation';

// Ordem da tabela "As minhas reservas": decisão de ecrã, não regra da API.
// Ativas primeiro (são as que o utilizador ainda pode cancelar);
// dentro do mesmo estado, a que começa mais cedo aparece primeiro.
export function sortReservations(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => {
    if (a.status !== 'Active' && b.status === 'Active') return 1;
    if (a.status === 'Active' && b.status !== 'Active') return -1;
    return a.startDate.localeCompare(b.startDate);
  });
}
