// Espelho dos DTOs de auth do backend (confirmados com pedidos reais à API).
// Se o C# mudar, estas interfaces mudam também, para o build apanhar as diferenças.

/** Corpo do POST /api/auth/register */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Corpo do POST /api/auth/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Resposta do registo e do login. A password nunca vem na resposta (regra da API). */
export interface UserResponse {
  id: number;
  name: string;
  email: string;
}
