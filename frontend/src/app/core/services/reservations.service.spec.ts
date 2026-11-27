import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api.config';
import { ReservationsService } from './reservations.service';

// O HttpTestingController faz de servidor falso: nenhum pedido sai do teste.
// (A versão antiga destes testes era do mock e, com o HttpClient real, chegava a criar
// reservas na API que estivesse a correr.)
describe('ReservationsService', () => {
  let service: ReservationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Falha se ficou algum pedido por responder ou houve um pedido inesperado
  afterEach(() => httpMock.verify());

  it('create posts the reservation and returns what the server answers', () => {
    const request = { userId: 1, carId: 1, startDate: '2026-12-01', endDate: '2026-12-05' };
    let totalPrice = 0;

    service.create(request).subscribe((reservation) => (totalPrice = reservation.totalPrice));

    const req = httpMock.expectOne(`${API_BASE_URL}/reservations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ id: 1, ...request, totalPrice: 140, status: 'Active', createdAt: '', cancelledAt: null });

    expect(totalPrice).toBe(140);
  });

  it('getByUser sends the userId in the query string', () => {
    service.getByUser(7).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/reservations` && r.params.get('userId') === '7',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('cancel posts to /reservations/{id}/cancel with the userId', () => {
    service.cancel(3, 7).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === `${API_BASE_URL}/reservations/3/cancel` && r.params.get('userId') === '7',
    );
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });
});
