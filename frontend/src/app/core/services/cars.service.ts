import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Car } from '../models/car';
import { CarAvailability } from '../models/car-availability';

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  private readonly http = inject(HttpClient);

  // Com as duas datas, a API devolve só os carros livres nesse intervalo.
  getCars(startDate?: string, endDate?: string): Observable<Car[]> {
    let params = new HttpParams();
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    return this.http
      .get<Car[]>(`${API_BASE_URL}/cars`, { params })
      .pipe(
        map((cars) => cars.map((car) => ({ ...car, imageUrl: this.toAbsoluteUrl(car.imageUrl) }))),
      );
  }

  // Diz se um carro está livre nesse intervalo (GET /cars/{id}/availability)
  getAvailability(carId: number, startDate: string, endDate: string): Observable<CarAvailability> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<CarAvailability>(`${API_BASE_URL}/cars/${carId}/availability`, { params });
  }

  // A API devolve "/images/cars/x.jpg". O browser procuraria isso no :4200,
  // por isso juntamos o endereço da API. Se já for um URL completo, fica como está.
  private toAbsoluteUrl(url: string): string {
    return url ? new URL(url, API_BASE_URL).href : '';
  }
}
