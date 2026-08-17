import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, accountErrorMessage } from '../../core/services/auth.service';

/** Cross-field validator: fails unless `password` and `confirmPassword` match. */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
  imports: [ReactiveFormsModule, RouterLink],
})
export class RegisterForm {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      displayName: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.control('', [Validators.required]),
    },
    { validators: passwordsMatchValidator },
  );

  onSubmit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { displayName, email, password } = this.form.getRawValue();
    this.submitting.set(true);
    this.serverError.set(null);

    this.auth.register({ displayName: displayName!, email: email!, password: password! }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.submitting.set(false);
        this.serverError.set(accountErrorMessage(error, 'Registration failed. Please try again.'));
      },
    });
  }
}
