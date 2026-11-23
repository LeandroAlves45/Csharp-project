import { rentalDays } from './rental';

// R5: o dia de devolução bloqueia o carro mas não é cobrado.
describe('rentalDays', () => {
  it('counts the days between start and end, without the return day', () => {
    expect(rentalDays('2026-12-01', '2026-12-05')).toBe(4);
  });

  it('works across months and years', () => {
    expect(rentalDays('2026-12-30', '2027-01-02')).toBe(3);
  });

  it('is not affected by the summer time change (28/03/2027 in Portugal)', () => {
    expect(rentalDays('2027-03-27', '2027-03-29')).toBe(2);
  });

  it('returns 0 when the end is not after the start', () => {
    expect(rentalDays('2026-12-05', '2026-12-05')).toBe(0);
    expect(rentalDays('2026-12-05', '2026-12-01')).toBe(0);
  });

  it('returns 0 while a date is still empty', () => {
    expect(rentalDays('', '2026-12-05')).toBe(0);
    expect(rentalDays('2026-12-01', '')).toBe(0);
  });
});
