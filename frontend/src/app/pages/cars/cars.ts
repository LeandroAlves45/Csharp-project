import { CurrencyPipe, DatePipe, formatCurrency } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getErrorMessage } from '../../core/http-error';
import { Car } from '../../core/models/car';
import { Reservation } from '../../core/models/reservation';
import { rentalDays, todayIso } from '../../core/rental';
import { AuthService } from '../../core/services/auth.service';
import { CarsService } from '../../core/services/cars.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { Alert } from '../../shared/alert/alert';
import { CarCard } from '../../shared/car-card/car-card';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-cars',
  imports: [FormsModule, CurrencyPipe, DatePipe, Alert, CarCard, ConfirmModal],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars {
  private readonly carsService = inject(CarsService);
  private readonly reservationsService = inject(ReservationsService);
  private readonly auth = inject(AuthService);
  private readonly locale = inject(LOCALE_ID);

  protected readonly today = todayIso();

  // Datas da PESQUISA: só filtram a lista de carros
  protected readonly startDate = signal('');
  protected readonly endDate = signal('');

  protected readonly cars = signal<Car[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  // Estado da reserva: um carro escolhido abre a janela; null fecha-a
  protected readonly selectedCar = signal<Car | null>(null);
  protected readonly reserving = signal(false);
  protected readonly reservationError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // NOVO: datas da RESERVA, escolhidas dentro da janela
  protected readonly reservationStart = signal('');
  protected readonly reservationEnd = signal('');

  protected readonly days = computed(() => rentalDays(this.startDate(), this.endDate()));

  protected readonly dateError = computed(() =>
    this.rangeError(this.startDate(), this.endDate(), this.days()),
  );

  protected readonly validDays = computed(() => (this.dateError() ? 0 : this.days()));

  // NOVO: as mesmas regras aplicadas às datas da reserva
  protected readonly reservationDays = computed(() =>
    rentalDays(this.reservationStart(), this.reservationEnd()),
  );

  protected readonly reservationDateError = computed(() =>
    this.rangeError(this.reservationStart(), this.reservationEnd(), this.reservationDays()),
  );

  // 0 enquanto as datas faltam ou estão erradas
  protected readonly validReservationDays = computed(() =>
    !this.reservationStart() || !this.reservationEnd() || this.reservationDateError()
      ? 0
      : this.reservationDays(),
  );

  constructor() {
    this.loadCars();
  }

  protected search(): void {
    if (this.validDays() === 0) return;
    this.loadCars(this.startDate(), this.endDate());
  }

  // ALTERADO: já não exige datas na pesquisa. Se houver, a janela abre com elas
  // preenchidas e o utilizador pode mudá-las.
  protected openReservation(car: Car): void {
    this.reservationError.set(null);
    this.successMessage.set(null);
    this.reservationStart.set(this.validDays() > 0 ? this.startDate() : '');
    this.reservationEnd.set(this.validDays() > 0 ? this.endDate() : '');
    this.selectedCar.set(car);
  }

  protected closeReservation(): void {
    if (this.reserving()) return;
    this.selectedCar.set(null);
  }

  // ALTERADO: usa as datas da janela, não as da pesquisa
  protected confirmReservation(car: Car): void {
    const user = this.auth.currentUser();
    if (!user || this.validReservationDays() === 0) return;
    this.reservationError.set(null);
    this.reserving.set(true);

    this.reservationsService
      .create({
        userId: user.id,
        carId: car.id,
        startDate: this.reservationStart(),
        endDate: this.reservationEnd(),
      })
      .subscribe({
        next: (reservation) => {
          this.reserving.set(false);
          this.selectedCar.set(null);
          this.successMessage.set(this.successText(reservation, car));
          this.refreshList();
        },
        error: (error: HttpErrorResponse) => {
          this.reserving.set(false);
          this.reservationError.set(getErrorMessage(error));
        },
      });
  }

  // NOVO: antes o search() não recarregava a lista quando não havia datas na pesquisa
  private refreshList(): void {
    if (this.validDays() > 0) {
      this.loadCars(this.startDate(), this.endDate());
    } else {
      this.loadCars();
    }
  }

  // NOVO: as regras que estavam dentro do dateError, agora partilhadas pelos dois pares de datas
  private rangeError(start: string, end: string, days: number): string | null {
    if (!start || !end) return null;
    if (start < this.today) return 'A data de início não pode ser no passado.';
    if (end <= start) return 'A data de fim tem de ser depois da data de início.';
    if (days > 30) return 'A reserva não pode passar de 30 dias.';
    return null;
  }

  private successText(reservation: Reservation, car: Car): string {
    const total = formatCurrency(reservation.totalPrice, this.locale, '€', 'EUR');
    return `Reserva n.º ${reservation.id} criada: ${car.brand} ${car.model}. Total: ${total}.`;
  }

  private loadCars(startDate?: string, endDate?: string): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.carsService.getCars(startDate, endDate).subscribe({
      next: (cars) => {
        this.cars.set(cars);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
