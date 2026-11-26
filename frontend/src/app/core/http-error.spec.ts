import { HttpErrorResponse } from '@angular/common/http';
import { getErrorMessage } from './http-error';

// Os 4 casos vêm de pedidos reais à API em 20/11.
describe('getErrorMessage', () => {
  it('returns the plain text body (auth and cars today)', () => {
    const error = new HttpErrorResponse({ status: 401, error: 'Email ou password inválidos.' });

    expect(getErrorMessage(error)).toBe('Email ou password inválidos.');
  });

  it('returns the ProblemDetails detail (the agreed format)', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: {
        status: 409,
        title: 'Conflict',
        detail: 'A reserva conflita com uma reserva existente.',
      },
    });

    expect(getErrorMessage(error)).toBe('A reserva conflita com uma reserva existente.');
  });

  it('returns a generic message for a ProblemDetails without detail (500)', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { status: 500, title: 'An error occurred while processing your request.' },
    });

    expect(getErrorMessage(error)).toBe('Ocorreu um erro inesperado. Tenta novamente.');
  });

  it('returns a connection message when the API is off (status 0)', () => {
    const error = new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') });

    expect(getErrorMessage(error)).toBe('Sem ligação ao servidor. Tenta novamente daqui a pouco.');
  });
});
