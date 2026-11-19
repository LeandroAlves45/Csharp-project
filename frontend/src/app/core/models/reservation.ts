// Baseado no ARCHITECTURE.md sec. 5; confirmar quando o ReservationResponse estiver feito.

/** Só 'Active' tem botão Cancelar. Exige que a API envie o enum como texto (análise D). */
export type ReservationStatus = 'Active' | 'Cancelled';

/** Corpo do POST /api/reservations. O preço não vai: é calculado pelo servidor (R5). */
export interface CreateReservationRequest {
  userId: number;
  carId: number;
  /** DateOnly chega e parte como "yyyy-MM-dd", o mesmo formato do <input type="date"> */
  startDate: string;
  endDate: string;
}

export interface Reservation {
  id: number;
  userId: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  cancelledAt: string | null;
}
