import { Reservation, ReservationStatus } from './models/reservation';
import { sortReservations } from './reservation-sort';

// Só os campos que interessam à ordenação mudam; o resto é igual em todas
function reservation(id: number, status: ReservationStatus, startDate: string): Reservation {
  return {
    id,
    userId: 1,
    carId: 1,
    startDate,
    endDate: '2027-01-31',
    totalPrice: 100,
    status,
    createdAt: '2026-11-23T10:00:00Z',
    cancelledAt: status === 'Cancelled' ? '2026-11-23T11:00:00Z' : null,
  };
}

describe('sortReservations', () => {
  it('shows active reservations before cancelled ones', () => {
    const sorted = sortReservations([
      reservation(1, 'Cancelled', '2026-12-01'),
      reservation(2, 'Active', '2026-12-20'),
    ]);

    expect(sorted.map((r) => r.id)).toEqual([2, 1]);
  });

  it('orders reservations with the same status by start date, earliest first', () => {
    const sorted = sortReservations([
      reservation(1, 'Active', '2027-01-10'),
      reservation(2, 'Active', '2026-12-05'),
      reservation(3, 'Active', '2026-12-20'),
    ]);

    expect(sorted.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it('does not change the original list', () => {
    const original = [
      reservation(1, 'Cancelled', '2026-12-01'),
      reservation(2, 'Active', '2026-12-20'),
    ];

    sortReservations(original);

    expect(original.map((r) => r.id)).toEqual([1, 2]);
  });
});
