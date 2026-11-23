import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getErrorMessage } from '../../core/http-error';
import { LoginRequest } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-login',
  // FormsModule traz o ngModel e os validadores (required, email) para o template
  imports: [FormsModule, RouterLink, Alert],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // O ngModel escreve aqui a cada tecla; o objeto já tem a forma do LoginRequest da API
  protected readonly form: LoginRequest = { email: '', password: '' };

  // Signals porque a resposta da API chega mais tarde: o ecrã atualiza-se quando mudam
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  protected submit(loginForm: NgForm): void {
    // Validação no browser: poupa um pedido; a API volta a validar (é ela que manda)
    if (loginForm.invalid) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    this.auth.login(this.form).subscribe({
      next: () => this.router.navigateByUrl('/cars'),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
