import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getErrorMessage } from '../../core/http-error';
import { Car } from '../../core/models/car';
import { Reservation } from '../../core/models/reservation';
import { sortReservations } from '../../core/reservation-sort';
import { AuthService } from '../../core/services/auth.service';
import { CarsService } from '../../core/services/cars.service';
import { ReservationsService } from '../../core/services/reservations.service';
import { Alert } from '../../shared/alert/alert';
import { ConfirmModal } from '../../shared/confirm-modal/confirm-modal';

@Component({
  selector: 'app-my-reservations',
  imports: [CurrencyPipe, DatePipe, RouterLink, Alert, ConfirmModal],
  templateUrl: './my-reservations.html',
  styleUrl: './my-reservations.css',
})
export class MyReservations {
  private readonly reservationsService = inject(ReservationsService);
  private readonly carsService = inject(CarsService);
  private readonly auth = inject(AuthService);

  protected readonly reservations = signal<Reservation[]>([]);
  protected readonly cars = signal<Car[]>([]);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  // Estado do cancelamento: uma reserva escolhida abre a janela; null fecha-a
  protected readonly selected = signal<Reservation | null>(null);
  protected readonly cancelling = signal(false);
  protected readonly cancelError = signal<string | null>(null);

  // A reserva só traz o carId: este mapa traduz o id para "Marca Modelo" na tabela
  protected readonly carNames = computed(
    () => new Map(this.cars().map((car) => [car.id, `${car.brand} ${car.model}`])),
  );

  // Sempre que a lista muda (carregar, cancelar), a ordem recalcula-se sozinha
  protected readonly sorted = computed(() => sortReservations(this.reservations()));

  constructor() {
    this.carsService.getCars().subscribe((cars) => this.cars.set(cars));
    this.loadReservations();
  }

  protected openCancel(reservation: Reservation): void {
    this.cancelError.set(null);
    this.successMessage.set(null);
    this.selected.set(reservation);
  }

  protected closeCancel(): void {
    // Enquanto o pedido decorre, a janela não fecha: o utilizador vê sempre o resultado
    if (this.cancelling()) return;
    this.selected.set(null);
  }

  protected confirmCancel(reservation: Reservation): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.cancelError.set(null);
    this.cancelling.set(true);

    this.reservationsService.cancel(reservation.id, user.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.selected.set(null);
        this.successMessage.set(`Reserva n.º ${reservation.id} cancelada.`);
        // A API devolve 200 sem corpo: voltamos a pedir a lista para ver o estado novo
        this.loadReservations();
      },
      error: (error: HttpErrorResponse) => {
        // C1, C2 e C3 são validadas pela API; o erro dela aparece dentro da janela
        this.cancelling.set(false);
        this.cancelError.set(getErrorMessage(error));
      },
    });
  }

  private loadReservations(): void {
    const user = this.auth.currentUser();
    if (!user) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.reservationsService.getByUser(user.id).subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
