import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { CreateReservationRequest, Reservation } from '../models/reservation';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private readonly http = inject(HttpClient);

  create(request: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(`${API_BASE_URL}/reservations`, request);
  }

  getByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${API_BASE_URL}/reservations`, {
      params: { userId },
    });
  }

  // A API responde 200 sem corpo
  cancel(id: number, userId: number): Observable<void> {
    return this.http.post<void>(`${API_BASE_URL}/reservations/${id}/cancel`, null, {
      params: { userId },
    });
  }
}
