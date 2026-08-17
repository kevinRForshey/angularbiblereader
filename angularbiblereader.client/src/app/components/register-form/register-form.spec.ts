import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RegisterForm } from './register-form';

describe('RegisterForm', () => {
  let fixture: ComponentFixture<RegisterForm>;
  let component: RegisterForm;
  let authService: { register: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = { register: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterForm],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function fillForm(values: {
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }): void {
    component.form.patchValue(values);
  }

  it('starts invalid with empty fields', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('is invalid with a malformed email', () => {
    fillForm({ displayName: 'Person', email: 'not-an-email', password: 'password123', confirmPassword: 'password123' });
    expect(component.form.controls.email.hasError('email')).toBe(true);
  });

  it('is invalid when the password is shorter than 8 characters', () => {
    fillForm({ displayName: 'Person', email: 'person@example.com', password: 'short', confirmPassword: 'short' });
    expect(component.form.controls.password.hasError('minlength')).toBe(true);
  });

  it('is invalid when password and confirmPassword do not match', () => {
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });
    expect(component.form.hasError('passwordsMismatch')).toBe(true);
  });

  it('is valid with matching, well-formed fields', () => {
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.form.valid).toBe(true);
  });

  it('does not call AuthService.register when the form is invalid', () => {
    component.onSubmit();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('registers and navigates home on success', () => {
    authService.register.mockReturnValue(of({ id: 1, email: 'person@example.com', displayName: 'Person' }));
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component.submitting()).toBe(false);
  });

  it('shows the server error message on failure and does not navigate', () => {
    authService.register.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { message: 'An account with that email already exists.' },
            status: 409,
          }),
      ),
    );
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();

    expect(component.serverError()).toBe('An account with that email already exists.');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.submitting()).toBe(false);
  });

  function renderedErrors(): string[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.auth-form__error'),
    ).map((el) => el.textContent ?? '');
  }

  it('shows required-field errors after submitting an empty form', () => {
    component.onSubmit();
    fixture.detectChanges();

    const errors = renderedErrors();
    expect(errors.some((e) => e.includes('Display name is required.'))).toBe(true);
    expect(errors.some((e) => e.includes('Email is required.'))).toBe(true);
    expect(errors.some((e) => e.includes('Password is required.'))).toBe(true);
  });

  it('shows an email-format error for a malformed address', () => {
    fillForm({ displayName: 'Person', email: 'not-an-email', password: 'password123', confirmPassword: 'password123' });
    component.onSubmit();
    fixture.detectChanges();

    expect(renderedErrors().some((e) => e.includes('Enter a valid email address.'))).toBe(true);
  });

  it('shows a minlength error for a short password', () => {
    fillForm({ displayName: 'Person', email: 'person@example.com', password: 'short', confirmPassword: 'short' });
    component.onSubmit();
    fixture.detectChanges();

    expect(renderedErrors().some((e) => e.includes('Password must be at least 8 characters.'))).toBe(true);
  });

  it('shows a mismatch error when confirmPassword differs', () => {
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });
    component.onSubmit();
    fixture.detectChanges();

    expect(renderedErrors().some((e) => e.includes('Passwords do not match.'))).toBe(true);
  });

  it('renders the server error in the template', () => {
    authService.register.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Boom' }, status: 500 })),
    );
    fillForm({
      displayName: 'Person',
      email: 'person@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    component.onSubmit();
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.auth-form__error--server'));
    expect(errorEl.nativeElement.textContent).toContain('Boom');
  });
});
