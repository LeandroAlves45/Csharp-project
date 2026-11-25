import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ReservationsService } from './reservations.service';

describe('ReservationsService (mock)', () => {
  let service: ReservationsService;

  beforeEach(() => {
    service = TestBed.inject(ReservationsService);
  });

  it('creates an active reservation with the price of the charged days (R5)', async () => {
    // Toyota Corolla (id 1) custa 35 €/dia; 4 dias cobrados
    const reservation = await firstValueFrom(
      service.create({ userId: 1, carId: 1, startDate: '2026-12-01', endDate: '2026-12-05' }),
    );

    expect(reservation.status).toBe('Active');
    expect(reservation.totalPrice).toBe(140);
    expect(reservation.cancelledAt).toBeNull();
  });

  it('gives each new reservation a different id', async () => {
    const request = { userId: 1, carId: 2, startDate: '2026-12-01', endDate: '2026-12-03' };
    const first = await firstValueFrom(service.create(request));
    const second = await firstValueFrom(service.create(request));

    expect(second.id).not.toBe(first.id);
  });
});

describe('ReservationsService (mock) - list and cancel', () => {
  let service: ReservationsService;

  beforeEach(() => {
    service = TestBed.inject(ReservationsService);
  });

  it('lists only the reservations of the given user', async () => {
    await firstValueFrom(
      service.create({ userId: 1, carId: 1, startDate: '2026-12-01', endDate: '2026-12-03' }),
    );
    await firstValueFrom(
      service.create({ userId: 2, carId: 2, startDate: '2026-12-01', endDate: '2026-12-03' }),
    );

    const mine = await firstValueFrom(service.getByUser(1));

    expect(mine.length).toBe(1);
    expect(mine[0].userId).toBe(1);
  });

  it('marks a reservation as cancelled', async () => {
    const created = await firstValueFrom(
      service.create({ userId: 1, carId: 1, startDate: '2026-12-01', endDate: '2026-12-03' }),
    );

    await firstValueFrom(service.cancel(created.id, 1));
    const [reservation] = await firstValueFrom(service.getByUser(1));

    expect(reservation.status).toBe('Cancelled');
    expect(reservation.cancelledAt).not.toBeNull();
  });
});
