
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getErrorMessage } from '../../core/http-error';
import { RegisterRequest } from '../../core/models/user';
import { AuthService } from '../../core/services/auth.service';
import { Alert } from '../../shared/alert/alert';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, Alert],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form: RegisterRequest = {
    name: '',
    email: '',
    password: '',
  };

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly loading = signal(false);

  // Mostrar a password ajuda a confirmar o que se escreveu; começa escondida
  protected readonly showPassword = signal(false);

  protected submit(registerForm: NgForm): void {
    if (registerForm.invalid) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    // Depois do registo, o utilizador tem de fazer login
    this.auth.register(this.form).subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
