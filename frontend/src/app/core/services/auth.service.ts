import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { LoginRequest, RegisterRequest, UserResponse } from '../models/user';

// Chave com prefixo da app para não colidir com outros dados no localStorage do mesmo endereço
const STORAGE_KEY = 'autorent.user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // Signal: quem o lê (navbar, guard) é atualizado sozinho quando o utilizador muda.
  // Arranca com o que estiver no localStorage, para a sessão sobreviver a um refresh (F5).
  private readonly user = signal<UserResponse | null>(this.readStoredUser());

  // Só leitura para fora: apenas este serviço pode mudar quem tem sessão iniciada
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  // Devolve o Observable sem subscrever: é o componente que subscreve e decide
  // o que fazer no sucesso (navegar) e no erro (mostrar o alerta).
  // O tap guarda a sessão só quando a API responde com sucesso.
  login(request: LoginRequest): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${API_BASE_URL}/auth/login`, request)
      .pipe(tap((user) => this.saveUser(user)));
  }

  // A API devolve o mesmo UserResponse no registo, por isso a conta nova já fica com sessão
  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${API_BASE_URL}/auth/register`, request)
      .pipe(tap((user) => this.saveUser(user)));
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
  }

  // Privado: agora só o login e o registo podem criar uma sessão
  private saveUser(user: UserResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readStoredUser(): UserResponse | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as UserResponse;
    } catch {
      // Valor estragado (editado à mão, por exemplo): limpa e trata como sem sessão
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
