import { HttpErrorResponse } from '@angular/common/http';

// Um só sítio que transforma qualquer erro da API numa frase para o utilizador.
// A API ainda responde em formatos diferentes (ver análise de 20/11), por isso tem de aceitar todos.
export function getErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Sem ligação ao servidor. Tenta novamente daqui a pouco.';

  if (typeof error.error === 'string' && error.error.trim() !== '') return error.error;

  if (error.error?.detail) return error.error.detail;

  return 'Ocorreu um erro inesperado. Tenta novamente.';
}
