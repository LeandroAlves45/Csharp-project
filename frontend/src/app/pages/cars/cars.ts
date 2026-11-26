import { CurrencyPipe, DatePipe, formatCurrency } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getErrorMessage } from '../../core/http-error';
import { Car } from '../../core/models/car';
import { Reservation } from '../../core/models/reservation';
import { rentalDays, tomorrowIso } from '../../core/rental';
import { AuthService } from '../../core/services/auth.service';
import { CarSearchService } from '../../core/services/car-search.service';
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
  private readonly search = inject(CarSearchService);
  private readonly locale = inject(LOCALE_ID);

  // Primeiro dia que se pode reservar: amanhã
  protected readonly minDate = tomorrowIso();

  // Datas da PESQUISA: vêm do CarSearchService, por isso não se perdem
  // quando se vai a "As minhas reservas" e se volta
  protected readonly startDate = this.search.startDate;
  protected readonly endDate = this.search.endDate;

  protected readonly cars = signal<Car[]>([]);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  // Estado da reserva: um carro escolhido abre a janela; null fecha-a
  protected readonly selectedCar = signal<Car | null>(null);
  protected readonly reserving = signal(false);
  protected readonly reservationError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // Datas da RESERVA, escolhidas dentro da janela
  protected readonly reservationStart = signal('');
  protected readonly reservationEnd = signal('');

  // true quando a pesquisa tinha datas válidas: o modal mostra-as fixas, sem poderem ser mudadas
  protected readonly reservationLocked = signal(false);

  protected readonly availability = signal<AvailabilityState>('idle');

  // Sobe 1 sempre que é preciso pedir a lista outra vez com as mesmas datas (depois de reservar)
  private readonly reloadCount = signal(0);

  // Só há o que verificar com a janela aberta e datas válidas
  private readonly availabilityQuery = computed(() => {
    const car = this.selectedCar();
    if (!car || this.validReservationDays() === 0) return null;
    return { carId: car.id, start: this.reservationStart(), end: this.reservationEnd() };
  });

  // Mensagem por cima do botão: erro de datas, carro ocupado ou erro do servidor
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

  // Com datas válidas a lista só tem carros livres; sem datas é a frota toda
  protected readonly title = computed(() =>
    this.validDays() > 0 ? 'Carros disponíveis' : 'A nossa frota',
  );

  // O que a lista precisa para ser pedida: datas só quando são válidas.
  // equal: enquanto o utilizador escreve uma data incompleta, o pedido não se repete.
  private readonly listQuery = computed(
    () => ({
      start: this.validDays() > 0 ? this.startDate() : '',
      end: this.validDays() > 0 ? this.endDate() : '',
      reload: this.reloadCount(),
    }),
    { equal: (a, b) => a.start === b.start && a.end === b.end && a.reload === b.reload },
  );

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
    // A lista acompanha as datas sozinha: não é preciso carregar em Procurar.
    // O switchMap descarta a resposta antiga se as datas mudarem antes de ela chegar.
    toObservable(this.listQuery)
      .pipe(
        switchMap(({ start, end }) => {
          this.loading.set(true);
          this.errorMessage.set(null);
          return this.carsService.getCars(start || undefined, end || undefined).pipe(
            catchError((error: HttpErrorResponse) => {
              this.errorMessage.set(getErrorMessage(error));
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((cars) => {
        if (cars) this.cars.set(cars);
        this.loading.set(false);
      });

    // Sempre que o carro ou as datas da reserva mudam, volta a perguntar ao servidor.
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
  }

  // Sem datas na pesquisa, a janela abre com as datas vazias para o utilizador escolher
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

  // Volta à frota toda: a lista atualiza-se sozinha porque as datas mudaram
  protected clearSearch(): void {
    this.search.clear();
  }

  protected closeReservation(): void {
    if (this.reserving()) return;
    this.selectedCar.set(null);
  }

  // Usa as datas da janela, não as da pesquisa
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
          // Pede a lista outra vez: com datas, o carro reservado deixa de aparecer
          this.reloadCount.update((count) => count + 1);
        },
        error: (error: HttpErrorResponse) => {
          this.reserving.set(false);
          this.reservationError.set(getErrorMessage(error));
        },
      });
  }

  // As mesmas regras do servidor, partilhadas pela pesquisa e pela janela
  private rangeError(start: string, end: string, days: number): string | null {
    if (!start || !end) return null;
    if (start < this.minDate) return 'A data de início tem de ser a partir de amanhã.';
    if (end <= start) return 'A data de fim tem de ser depois da data de início.';
    if (days > 30) return 'A reserva não pode passar de 30 dias.';
    return null;
  }

  private successText(reservation: Reservation, car: Car): string {
    const total = formatCurrency(reservation.totalPrice, this.locale, '€', 'EUR');
    return `Reserva n.º ${reservation.id} criada: ${car.brand} ${car.model}. Total: ${total}.`;
  }
}
