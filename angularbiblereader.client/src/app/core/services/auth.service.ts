import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { AuthUser, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = '/api/account';
  private readonly http = inject(HttpClient);

  private readonly _currentUser = signal<AuthUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  /** Loads the current session (if any) from the server. Call once on app start. */
  loadSession(): Observable<AuthUser | null> {
    return this.http.get<AuthUser | null>(this.baseUrl + '/me').pipe(
      tap((user) => this._currentUser.set(user)),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(this.baseUrl + '/register', request)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthUser>(this.baseUrl + '/login', request)
      .pipe(tap((user) => this._currentUser.set(user)));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(this.baseUrl + '/logout', {})
      .pipe(tap(() => this._currentUser.set(null)));
  }
}

/** Extracts a user-facing message from a failed account API call, falling back to a default. */
export function accountErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse && typeof error.error?.message === 'string') {
    return error.error.message;
  }
  return fallback;
}
