import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { AuthUser } from './core/models/auth.models';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let authService: {
    currentUser: ReturnType<typeof signal<AuthUser | null>>;
    loadSession: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      currentUser: signal<AuthUser | null>(null),
      loadSession: vi.fn().mockReturnValue(of(null)),
      logout: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads the session on init', () => {
    fixture.detectChanges();
    expect(authService.loadSession).toHaveBeenCalled();
  });

  it('shows sign-in/sign-up links when signed out', () => {
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('.app-bar__account a'));
    expect(links.map((el) => el.nativeElement.textContent.trim())).toEqual(['Log in', 'Sign up']);
  });

  it('shows the display name and a logout button when signed in', () => {
    authService.currentUser.set({ id: 1, email: 'person@example.com', displayName: 'Person' });
    fixture.detectChanges();

    const name = fixture.debugElement.query(By.css('.app-bar__account-name'));
    expect(name.nativeElement.textContent).toContain('Person');

    const logoutButton = fixture.debugElement.query(By.css('.app-bar__account-action'));
    expect(logoutButton).toBeTruthy();
  });

  it('calls AuthService.logout when the logout button is clicked', () => {
    authService.currentUser.set({ id: 1, email: 'person@example.com', displayName: 'Person' });
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.app-bar__account-action')).nativeElement.click();

    expect(authService.logout).toHaveBeenCalled();
  });
});
