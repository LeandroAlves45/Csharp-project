import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guard funcional: corre antes de o router abrir a rota e decide se deixa entrar
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  // Devolver um UrlTree (em vez de chamar router.navigate) faz o router cancelar
  // esta navegação e redirecionar numa só operação
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
