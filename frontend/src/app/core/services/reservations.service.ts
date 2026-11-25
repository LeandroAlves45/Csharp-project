import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { MOCK_CARS } from '../mocks/car.mock';
import { CreateReservationRequest, Reservation } from '../models/reservation';
import { rentalDays } from '../rental';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  // MOCK: as reservas ficam numa lista em memória, como a List<T> da API.
  // Perdem-se com um refresh (F5). A assinatura já é a final (Observable).
  // As regras (R1 a R5, C1 a C3) ficam na API. O mock não as repete: só faz o "caminho feliz".
  private readonly reservations: Reservation[] = [];
  private nextId = 1;

  // API: return this.http.post<Reservation>(`${API_BASE_URL}/reservations`, request);
  create(request: CreateReservationRequest): Observable<Reservation> {
    const car = MOCK_CARS.find((car) => car.id === request.carId);
    const reservation: Reservation = {
      id: this.nextId++,
      ...request,
      // Na API é o servidor que calcula o preço (R5); aqui imitamos esse cálculo
      totalPrice: rentalDays(request.startDate, request.endDate) * (car?.dailyPrice ?? 0),
      status: 'Active',
      createdAt: new Date().toISOString(),
      cancelledAt: null,
    };
    this.reservations.push(reservation);

    // delay imita o tempo de resposta da rede, para se ver o estado 'a reservar' no browser
    return of(reservation).pipe(delay(400));
  }

  // API: return this.http.get<Reservation[]>(`${API_BASE_URL}/reservations`, { params: { userId } });
  getByUser(userId: number): Observable<Reservation[]> {
    // Cópias ({ ...r }): como numa resposta HTTP, a página recebe objetos novos
    // e não consegue alterar a "base de dados" do mock por engano
    const mine = this.reservations.filter((r) => r.userId === userId).map((r) => ({ ...r }));
    return of(mine).pipe(delay(400));
  }

  // API (o controller do Bruno lê o userId da query string, 20/11):
  //   return this.http.post<void>(`${API_BASE_URL}/reservations/${id}/cancel`, null, { params: { userId } });
  // A API responde 200 sem corpo, por isso o tipo é void.
  cancel(id: number, userId: number): Observable<void> {
    const reservation = this.reservations.find((r) => r.id === id && r.userId === userId);
    if (reservation) {
      reservation.status = 'Cancelled';
      reservation.cancelledAt = new Date().toISOString();
    }
    return of(undefined).pipe(delay(400));
  }
}
