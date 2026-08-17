import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/bible-reader/bible-reader').then((m) => m.BibleReader),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register-form/register-form').then((m) => m.RegisterForm),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login-form/login-form').then((m) => m.LoginForm),
  },
];
