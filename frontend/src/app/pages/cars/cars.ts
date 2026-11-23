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

  // Signals ligados aos <input type="date"> com [(ngModel)]: tudo o que depende das datas
  // (dias, erro, estimativa nos cartões) recalcula-se sozinho quando o utilizador as muda
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

  protected readonly days = computed(() => rentalDays(this.startDate(), this.endDate()));

  // As mesmas regras da API (R2, R4), com as mesmas mensagens: o utilizador vê o problema
  // antes de reservar. A API continua a validar, porque o browser pode ser contornado.
  protected readonly dateError = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    if (!start || !end) return null;
    if (start < this.today) return 'A data de início não pode ser no passado.';
    if (end <= start) return 'A data de fim tem de ser depois da data de início.';
    if (this.days() > 30) return 'A reserva não pode passar de 30 dias.';
    return null;
  });

  // 0 quando as datas faltam ou estão erradas: os cartões não mostram estimativa
  protected readonly validDays = computed(() => (this.dateError() ? 0 : this.days()));

  constructor() {
    // Sem datas, a API devolve todos os carros (ecrã inicial)
    this.loadCars();
  }

  protected search(): void {
    if (this.validDays() === 0) return;
    this.loadCars(this.startDate(), this.endDate());
  }

  protected openReservation(car: Car): void {
    // O botão já está desativado sem datas válidas; isto protege na mesma
    if (this.validDays() === 0) return;
    this.reservationError.set(null);
    this.successMessage.set(null);
    this.selectedCar.set(car);
  }

  protected closeReservation(): void {
    // Enquanto o pedido decorre, a janela não fecha: o utilizador vê sempre o resultado
    if (this.reserving()) return;
    this.selectedCar.set(null);
  }

  protected confirmReservation(car: Car): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.reservationError.set(null);
    this.reserving.set(true);

    this.reservationsService
      .create({
        userId: user.id,
        carId: car.id,
        startDate: this.startDate(),
        endDate: this.endDate(),
      })
      .subscribe({
        next: (reservation) => {
          this.reserving.set(false);
          this.selectedCar.set(null);
          this.successMessage.set(this.successText(reservation, car));
          this.search();
        },
        error: (error: HttpErrorResponse) => {
          this.reserving.set(false);
          this.reservationError.set(getErrorMessage(error));
        },
      });
  }

  // O total vem da resposta da API (R5), não da estimativa do ecrã
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
