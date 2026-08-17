import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthUser } from '../models/auth.models';
import { AuthService, accountErrorMessage } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user: AuthUser = { id: 1, email: 'person@example.com', displayName: 'Person' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts with no current user', () => {
    expect(service.currentUser()).toBeNull();
  });

  it('loadSession sets currentUser on success', () => {
    service.loadSession().subscribe();

    const req = httpMock.expectOne('/api/account/me');
    expect(req.request.method).toBe('GET');
    req.flush(user);

    expect(service.currentUser()).toEqual(user);
  });

  it('loadSession sets currentUser to null on a 204 (no session)', () => {
    service.loadSession().subscribe((result) => expect(result).toBeNull());

    const req = httpMock.expectOne('/api/account/me');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(service.currentUser()).toBeNull();
  });

  it('loadSession recovers to a null currentUser when the request errors', () => {
    service.loadSession().subscribe((result) => expect(result).toBeNull());

    const req = httpMock.expectOne('/api/account/me');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(service.currentUser()).toBeNull();
  });

  it('register sets currentUser and posts the request body', () => {
    service.register({ email: user.email, displayName: user.displayName, password: 'password123' }).subscribe();

    const req = httpMock.expectOne('/api/account/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: user.email,
      displayName: user.displayName,
      password: 'password123',
    });
    req.flush(user);

    expect(service.currentUser()).toEqual(user);
  });

  it('login sets currentUser on success', () => {
    service.login({ email: user.email, password: 'password123' }).subscribe();

    const req = httpMock.expectOne('/api/account/login');
    expect(req.request.method).toBe('POST');
    req.flush(user);

    expect(service.currentUser()).toEqual(user);
  });

  it('login leaves currentUser unset on failure', () => {
    service.login({ email: user.email, password: 'wrong' }).subscribe({
      error: () => {},
    });

    const req = httpMock.expectOne('/api/account/login');
    req.flush({ message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.currentUser()).toBeNull();
  });

  it('logout clears currentUser', () => {
    service.loadSession().subscribe();
    httpMock.expectOne('/api/account/me').flush(user);
    expect(service.currentUser()).toEqual(user);

    service.logout().subscribe();
    const req = httpMock.expectOne('/api/account/logout');
    expect(req.request.method).toBe('POST');
    req.flush(null);

    expect(service.currentUser()).toBeNull();
  });
});

describe('accountErrorMessage', () => {
  it('extracts the server-provided message', () => {
    const error = new HttpErrorResponse({ error: { message: 'Nope' }, status: 401 });
    expect(accountErrorMessage(error, 'fallback')).toBe('Nope');
  });

  it('falls back when the error has no message field', () => {
    const error = new HttpErrorResponse({ error: {}, status: 500 });
    expect(accountErrorMessage(error, 'fallback')).toBe('fallback');
  });

  it('falls back for non-HTTP errors', () => {
    expect(accountErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
