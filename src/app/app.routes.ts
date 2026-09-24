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
    path: 'admin/eoi-view',
    loadComponent: () =>
      import('./features/eoi/pages/department-eoi-view/department-eoi-view.component').then(
        (m) => m.DepartmentEoiViewComponent
      )
  },
  {
    path: 'admin/responses/:schemeId',
    loadComponent: () =>
      import('./features/eoi/pages/applicant-submissions/applicant-submissions.component').then(
        (m) => m.ApplicantSubmissionsComponent
      )
  },
  {
    path: 'admin/responses',
    loadComponent: () =>
      import('./features/eoi/pages/applicant-submissions/applicant-submissions.component').then(
        (m) => m.ApplicantSubmissionsComponent
      )
  },
  {
    path: 'admin/review/:applicationId',
    loadComponent: () =>
      import('./features/eoi/pages/scrutiny-desk/scrutiny-desk.component').then(
        (m) => m.ScrutinyDeskComponent
      )
  },
  {
    path: 'sdc',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sdc/components/sdc-list.component').then(
            (m) => m.SdcListComponent
          )
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/sdc/components/sdc-create.component').then(
            (m) => m.SdcCreateComponent
          )
      },
      {
        path: 'batches',
        loadComponent: () =>
          import('./features/sdc/components/batch-list.component').then(
            (m) => m.BatchListComponent
          )
      },
      {
        path: ':sdcId/batch/create',
        loadComponent: () =>
          import('./features/sdc/components/batch-form.component').then(
            (m) => m.BatchFormComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/sdc/components/sdc-detail.component').then(
            (m) => m.SdcDetailComponent
          )
      }
    ]
  },
  {
    path: 'sdcs',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sdc/components/sdc-list.component').then(
            (m) => m.SdcListComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/sdc/components/sdc-detail.component').then(
            (m) => m.SdcDetailComponent
          )
      }
    ]
  },
  {
    path: 'batches',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sdc/components/batch-list.component').then(
            (m) => m.BatchListComponent
          )
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/sdc/components/batch-form.component').then(
            (m) => m.BatchFormComponent
          )
      }
    ]
  },
  {
    path: 'tp/sanction-orders',
    loadComponent: () =>
      import('./features/sdc/components/sanction-orders.component').then(
        (m) => m.SanctionOrdersComponent
      )
  },
  {
    path: 'sanction-orders',
    redirectTo: 'tp/sanction-orders',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
