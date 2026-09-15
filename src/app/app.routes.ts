import { Routes } from '@angular/router';

export const routes: Routes = [
  // Screen 1: Portal Landing (Krtika's Component)
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'schemes',
    loadComponent: () => import('./features/eoi/schemes/scheme-listing.component').then(m => m.SchemeListingComponent)
  },
  
  // Forms Module (Nikhil's TP-PIA Registration)
  {
    path: 'forms',
    loadChildren: () => import('./features/forms/forms.routes').then(m => m.FORMS_ROUTES)
  },

  // Screen 0: SSO Login Portal
  {
    path: 'auth/login',
    loadComponent: () => import('./features/authentication/sso-login/sso-login.component').then(m => m.SsoLoginComponent)
  },
  {
    path: 'auth/sso-mapping',
    loadComponent: () => import('./features/authentication/sso-mapping/sso-mapping.component').then(m => m.SsoMappingComponent)
  },

  // Screen 2: One-Time Registration
  {
    path: 'auth/register',
    loadComponent: () => import('./features/authentication/registration/registration-shell.component').then(m => m.RegistrationShellComponent)
  },
  {
    path: 'auth/registration',
    loadComponent: () => import('./features/authentication/registration/registration-shell.component').then(m => m.RegistrationShellComponent)
  },

  // Screen 3: Saved Master Profile
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  // Screen 4: Scheme Details / Application Form
  {
    path: 'eoi/apply/:id',
    loadComponent: () => import('./features/eoi/application-wizard/application-wizard.component').then(m => m.ApplicationWizardComponent)
  },

  // Screen 5: EMD Fee Payment
  {
    path: 'eoi/payment/:id',
    loadComponent: () => import('./features/eoi/emd-payment/emd-payment.component').then(m => m.EmdPaymentComponent)
  },

  // Screen 6: Preview & Submit
  {
    path: 'eoi/preview/:id',
    loadComponent: () => import('./features/eoi/preview-submit/preview-submit.component').then(m => m.PreviewSubmitComponent)
  },

  // Screen 7: Acknowledgement Receipt
  {
    path: 'eoi/acknowledgement/:id',
    loadComponent: () => import('./features/eoi/receipts/acknowledgement-receipt.component').then(m => m.AcknowledgementReceiptComponent)
  },

  // Screen 8: Application Status Tracker (Admin Scrutiny)
  {
    path: 'eoi/tracker/:id',
    loadComponent: () => import('./features/eoi/status-tracker/status-tracker.component').then(m => m.StatusTrackerComponent)
  },
  {
    path: 'eoi/tracker',
    redirectTo: 'eoi/tracker/ISMS-EOI-2026-9871',
    pathMatch: 'full'
  },
  {
    path: 'eoi/status',
    redirectTo: 'eoi/tracker/ISMS-EOI-2026-9871',
    pathMatch: 'full'
  },

  // Screen 9a: Outcome — Approved (TP Certificate & Grade)
  {
    path: 'eoi/outcome-approved/:id',
    loadComponent: () => import('./features/eoi/outcome/outcome-approved.component').then(m => m.OutcomeApprovedComponent)
  },

  // Screen 9b: Outcome — Rejected (EMD Refund Status)
  {
    path: 'eoi/outcome-rejected/:id',
    loadComponent: () => import('./features/eoi/outcome/outcome-rejected.component').then(m => m.OutcomeRejectedComponent)
  },

  // Screen 10: TP Dashboard (Post-Approval)
  {
    path: 'eoi/dashboard',
    loadComponent: () => import('./features/eoi/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'eoi/my-applications',
    loadComponent: () => import('./features/eoi/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },

  // Screen 14: Department User (Admin) — EOI View
  {
    path: 'admin/eoi-view',
    loadComponent: () => import('./features/admin/dept-eoi-view/dept-eoi-view.component').then(m => m.DeptEoiViewComponent)
  },

  // Screen 15: Department User (Admin) — Responses List
  {
    path: 'admin/responses/:schemeId',
    loadComponent: () => import('./features/admin/responses-list/responses-list.component').then(m => m.ResponsesListComponent)
  },
  {
    path: 'admin/responses',
    loadComponent: () => import('./features/admin/responses-list/responses-list.component').then(m => m.ResponsesListComponent)
  },

  // Screen 16: Department User (Admin) — Detailed Profile Review Desk
  {
    path: 'admin/review/:applicationId',
    loadComponent: () => import('./features/admin/profile-review/profile-review.component').then(m => m.ProfileReviewComponent)
  },

  // Screen 17: Super Admin — Masters (CRUD)
  {
    path: 'admin/masters',
    loadComponent: () => import('./features/admin/super-admin/masters/masters.component').then(m => m.MastersComponent)
  },

  // Screen 18: Super Admin — Configure EOI (Dynamic Form Builder)
  {
    path: 'admin/configure-eoi',
    loadComponent: () => import('./features/admin/super-admin/configure-eoi/configure-eoi.component').then(m => m.ConfigureEoiComponent)
  },

  // Screen 19: Super Admin — Manage Users
  {
    path: 'admin/manage-users',
    loadComponent: () => import('./features/admin/super-admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent)
  },

  // Current Working Feature: Super Admin Panel
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
