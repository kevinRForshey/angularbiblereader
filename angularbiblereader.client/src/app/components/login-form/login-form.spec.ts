import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;
  let component: LoginForm;
  let authService: { login: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = { login: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('starts invalid with empty fields', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('is invalid with a malformed email', () => {
    component.form.patchValue({ email: 'not-an-email', password: 'password123' });
    expect(component.form.controls.email.hasError('email')).toBe(true);
  });

  it('is valid with an email and a non-empty password', () => {
    component.form.patchValue({ email: 'person@example.com', password: 'password123' });
    expect(component.form.valid).toBe(true);
  });

  it('does not call AuthService.login when the form is invalid', () => {
    component.onSubmit();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('logs in and navigates home on success', () => {
    authService.login.mockReturnValue(of({ id: 1, email: 'person@example.com', displayName: 'Person' }));
    component.form.patchValue({ email: 'person@example.com', password: 'password123' });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ email: 'person@example.com', password: 'password123' });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component.submitting()).toBe(false);
  });

  it('shows "invalid credentials" style server error and does not navigate', () => {
    authService.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Invalid email or password.' }, status: 401 })),
    );
    component.form.patchValue({ email: 'person@example.com', password: 'wrong' });

    component.onSubmit();

    expect(component.serverError()).toBe('Invalid email or password.');
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
    expect(errors.some((e) => e.includes('Email is required.'))).toBe(true);
    expect(errors.some((e) => e.includes('Password is required.'))).toBe(true);
  });

  it('shows an email-format error for a malformed address', () => {
    component.form.patchValue({ email: 'not-an-email', password: 'password123' });
    component.onSubmit();
    fixture.detectChanges();

    expect(renderedErrors().some((e) => e.includes('Enter a valid email address.'))).toBe(true);
  });

  it('renders the server error in the template', () => {
    authService.login.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { message: 'Boom' }, status: 500 })),
    );
    component.form.patchValue({ email: 'person@example.com', password: 'wrong' });

    component.onSubmit();
    fixture.detectChanges();

    const errorEl = fixture.debugElement.query(By.css('.auth-form__error--server'));
    expect(errorEl.nativeElement.textContent).toContain('Boom');
  });
});
