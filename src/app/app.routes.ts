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
    redirectTo: 'registration',
    pathMatch: 'full'
  },
  {
    path: 'registration',
    loadComponent: () =>
      import('./features/registration/registration-shell.component').then(
        (m) => m.RegistrationShellComponent
      )
  },
  {
    path: 'otr',
    redirectTo: 'registration'
  },
  {
    path: 'scheme-form',
    loadComponent: () =>
      import('./features/eoi/components/scheme-form/scheme-form.component').then(
        (m) => m.SchemeFormComponent
      )
  },
  {
    path: 'tenders',
    loadComponent: () =>
      import('./features/tenders/tenders-page.component').then(
        (m) => m.TendersPageComponent
      )
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile-page.component').then(
        (m) => m.ProfilePageComponent
      )
  },
  {
    path: 'tender-status',
    loadComponent: () =>
      import('./features/tenders/tender-status.component').then(
        (m) => m.TenderStatusComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
