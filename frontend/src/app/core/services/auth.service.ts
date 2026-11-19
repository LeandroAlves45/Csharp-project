import { Injectable, computed, signal } from '@angular/core';
import { UserResponse } from '../models/user';

// Chave com prefixo da app para não colidir com outros dados no localStorage do mesmo endereço
const STORAGE_KEY = 'autorent.user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signal: quem o lê (navbar, guard) é atualizado sozinho quando o utilizador muda.
  // Arranca com o que estiver no localStorage, para a sessão sobreviver a um refresh (F5).
  private readonly user = signal<UserResponse | null>(this.readStoredUser());

  // Só leitura para fora: apenas este serviço pode mudar quem tem sessão iniciada
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => this.user() !== null);

  // login() e register() chamam a API e, com sucesso, usam este método
  saveUser(user: UserResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
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
