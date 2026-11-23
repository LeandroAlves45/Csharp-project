import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../core/api.config';
import { Login } from './login';

// Testa o componente com o HTML a sério (não só a classe): foi assim que faltou
// apanhar o "template: './login.html'", que compilava mas mostrava o texto no ecrã.
describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let element: HTMLElement;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Login);
    element = fixture.nativeElement;
    // whenStable: o ngModel liga os campos de forma assíncrona; esperamos que acabe
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  // Escreve no campo como o utilizador: o ngModel ouve o evento "input"
  async function type(selector: string, value: string): Promise<void> {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function submit(): Promise<void> {
    element.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await fixture.whenStable();
  }

  it('renders the login form from login.html', () => {
    expect(element.querySelector('h2')?.textContent).toContain('Entrar');
    expect(element.querySelector('input#email')).not.toBeNull();
    expect(element.querySelector('input#password')).not.toBeNull();
  });

  it('shows the field errors and does not call the API when the form is empty', async () => {
    await submit();

    const errors = Array.from(element.querySelectorAll('.field__error')).map((e) => e.textContent);
    expect(errors).toEqual(['Escreve um email válido.', 'Escreve a password.']);
    // Sem pedidos: o httpMock.verify() do afterEach também falharia se houvesse um
    httpMock.expectNone(`${API_BASE_URL}/auth/login`);
  });

  it('shows the API message when the login fails (401)', async () => {
    await type('#email', 'ana@teste.com');
    await type('#password', 'errada');
    await submit();

    httpMock
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush('Email ou password inválidos.', { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(element.querySelector('app-alert')?.textContent).toContain('Email ou password inválidos.');
    // O botão volta a ficar ativo para tentar outra vez
    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  });

  it('goes to /cars when the login succeeds', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);

    await type('#email', 'ana@teste.com');
    await type('#password', 'Teste123');
    await submit();

    httpMock
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush({ id: 1, name: 'Ana', email: 'ana@teste.com' });

    expect(navigate).toHaveBeenCalledWith('/cars');
  });
});
