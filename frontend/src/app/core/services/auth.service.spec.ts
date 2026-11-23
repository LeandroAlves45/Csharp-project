import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  // Faz de API falsa: apanha os pedidos e deixa o teste escolher a resposta
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  // Falha o teste se ficou algum pedido por responder ou houve um pedido inesperado
  afterEach(() => httpMock.verify());

  it('login saves the user when the API answers 200', () => {
    service.login({ email: 'ana@teste.com', password: 'Teste123' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, name: 'Ana', email: 'ana@teste.com' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.name).toBe('Ana');
    expect(localStorage.getItem('autorent.user')).toContain('"id":1');
  });

  it('login does not save anything when the API answers 401', () => {
    let failed = false;
    service
      .login({ email: 'ana@teste.com', password: 'errada' })
      .subscribe({ error: () => (failed = true) });

    httpMock
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush('Email ou password inválidos.', { status: 401, statusText: 'Unauthorized' });

    expect(failed).toBe(true);
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('autorent.user')).toBeNull();
  });

  it('register posts to /auth/register and starts the session', () => {
    service.register({ name: 'Ana', email: 'ana@teste.com', password: 'Teste123' }).subscribe();

    httpMock
      .expectOne(`${API_BASE_URL}/auth/register`)
      .flush(
        { id: 2, name: 'Ana', email: 'ana@teste.com' },
        { status: 201, statusText: 'Created' },
      );

    expect(service.currentUser()?.id).toBe(2);
  });

  it('logout clears the session', () => {
    service.login({ email: 'ana@teste.com', password: 'Teste123' }).subscribe();
    httpMock
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush({ id: 1, name: 'Ana', email: 'ana@teste.com' });

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('autorent.user')).toBeNull();
  });
});
