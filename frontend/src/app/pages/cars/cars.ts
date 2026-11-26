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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

type AvailabilityState = 'idle' | 'checking' | 'available' | 'unavailable' | 'error';

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

  // true quando a pesquisa tinha datas válidas: o modal mostra-as fixas, sem poderem ser mudadas
  protected readonly reservationLocked = signal(false);

  protected readonly availability = signal<AvailabilityState>('idle');

  // Só há o que verificar com a janela aberta e datas válidas
  private readonly availabilityQuery = computed(() => {
    const car = this.selectedCar();
    if (!car || this.validReservationDays() === 0) return null;
    return { carId: car.id, start: this.reservationStart(), end: this.reservationEnd() };
  });

  // Mensagem por cima do botão: erro de datas, carro ocupado ou erro da API
  protected readonly modalError = computed(() => {
    if (this.reservationDateError()) return this.reservationDateError();
    if (this.availability() === 'unavailable') {
      return 'Este carro já está reservado nestas datas. Escolhe outras datas ou outro carro.';
    }
    return this.reservationError();
  });

  protected readonly confirmBlocked = computed(
    () =>
      this.validReservationDays() === 0 ||
      this.availability() === 'checking' ||
      this.availability() === 'unavailable',
  );

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
    // Sempre que o carro ou as datas da reserva mudam, volta a perguntar à API.
    // O switchMap descarta respostas antigas se o utilizador mudar as datas depressa.
    toObservable(this.availabilityQuery)
      .pipe(
        switchMap((query) => {
          if (!query) return of<AvailabilityState>('idle');
          return this.carsService.getAvailability(query.carId, query.start, query.end).pipe(
            map((result): AvailabilityState => (result.available ? 'available' : 'unavailable')),
            startWith<AvailabilityState>('checking'),
            catchError(() => of<AvailabilityState>('error')),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((state) => this.availability.set(state));
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

    // Com datas na pesquisa, são essas as da reserva (fixas). Sem datas, escolhe-as no modal.
    const locked = this.validDays() > 0;
    this.reservationLocked.set(locked);
    this.reservationStart.set(locked ? this.startDate() : '');
    this.reservationEnd.set(locked ? this.endDate() : '');
    this.selectedCar.set(car);
  }

  // Volta à lista completa
  protected clearSearch(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.loadCars();
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
