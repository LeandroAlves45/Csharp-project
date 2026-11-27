import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { Cars } from './pages/cars/cars';
import { Login } from './pages/login/login';
import { MyReservations } from './pages/my-reservations/my-reservations';
import { Register } from './pages/register/register';

// O router lê esta lista de cima para baixo e usa a primeira rota que bate certo
export const routes: Routes = [
  // pathMatch 'full': só redireciona quando o caminho é exatamente vazio
  { path: '', pathMatch: 'full', redirectTo: 'cars' },

  // Públicas (sem autenticação)
  { path: 'login', component: Login, title: 'Entrar | AutoRent' },
  { path: 'register', component: Register, title: 'Criar Conta | AutoRent' },

  // Só com login: o authGuard manda para /login quem não tem sessão
  { path: 'cars', component: Cars, canActivate: [authGuard], title: 'Carros | AutoRent' },
  {
    path: 'my-reservations',
    component: MyReservations,
    canActivate: [authGuard],
    title: 'As minhas Reservas | AutoRent',
  },

  // Qualquer outro caminho (URL inexistente) volta à página dos carros
  { path: '**', redirectTo: 'cars' },
];
