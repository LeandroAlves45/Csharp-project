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

  protected submit(registerForm: NgForm): void {
    if (registerForm.invalid) return;

    this.errorMessage.set(null);
    this.loading.set(true);

    // O registo já devolve o utilizador, por isso entra logo sem passar pelo login
    this.auth.register(this.form).subscribe({
      next: () => this.router.navigateByUrl('/cars'),
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.loading.set(false);
      },
    });
  }
}
