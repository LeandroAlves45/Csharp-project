import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_CARS } from '../mocks/car.mock';
import { Car } from '../models/car';

@Injectable({
  providedIn: 'root',
})
export class CarsService {
  // MOCK: a assinatura já é a final (Observable), por isso trocar para a API
  // muda só o corpo deste método, e a página não muda. Quando a API estiver pronta:
  //   return this.http.get<Car[]>(`${API_BASE_URL}/cars`, { params: { startDate, endDate } });
  // Com datas, a API devolve só os carros livres (R3). O mock devolve sempre todos.
  getCars(startDate?: string, endDate?: string): Observable<Car[]> {
    return of(MOCK_CARS);
  }
}
