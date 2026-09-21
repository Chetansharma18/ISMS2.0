import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      )
  },
  {
    path: 'sso-login',
    loadComponent: () =>
      import('./features/auth/pages/sso-login/sso-login.component').then(
        (m) => m.SsoLoginComponent
      )
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/eoi/pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
