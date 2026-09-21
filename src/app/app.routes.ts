import { Routes } from '@angular/router';
import { AuthenticatedLayoutComponent } from './layout/authenticated-layout/authenticated-layout.component';
import { roleGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  // Screen 1: Portal Landing (Chetan's Component)
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'schemes',
    loadComponent: () => import('./features/eoi/schemes/scheme-listing.component').then(m => m.SchemeListingComponent)
  },
  
  // Forms Module (Redirect to Unified TP-PIA Registration)
  {
    path: 'forms',
    redirectTo: 'auth/register',
    pathMatch: 'full'
  },
  {
    path: 'forms/tp-pia-registration',
    redirectTo: 'auth/register',
    pathMatch: 'full'
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
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },
  // Screen 4: Scheme Details / Application Form
  {
    path: 'eoi/apply/:id',
    loadComponent: () => import('./features/eoi/application-wizard/application-wizard.component').then(m => m.ApplicationWizardComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 5: EMD Fee Payment
  {
    path: 'eoi/payment/:id',
    loadComponent: () => import('./features/eoi/emd-payment/emd-payment.component').then(m => m.EmdPaymentComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 6: Preview & Submit
  {
    path: 'eoi/preview/:id',
    loadComponent: () => import('./features/eoi/preview-submit/preview-submit.component').then(m => m.PreviewSubmitComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 7: Acknowledgement Receipt
  {
    path: 'eoi/acknowledgement/:id',
    loadComponent: () => import('./features/eoi/receipts/acknowledgement-receipt.component').then(m => m.AcknowledgementReceiptComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 8: Application Status Tracker (Admin Scrutiny)
  {
    path: 'eoi/tracker/:id',
    loadComponent: () => import('./features/eoi/status-tracker/status-tracker.component').then(m => m.StatusTrackerComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
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
    loadComponent: () => import('./features/eoi/outcome/outcome-approved.component').then(m => m.OutcomeApprovedComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 9b: Outcome — Rejected (EMD Refund Status)
  {
    path: 'eoi/outcome-rejected/:id',
    loadComponent: () => import('./features/eoi/outcome/outcome-rejected.component').then(m => m.OutcomeRejectedComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },

  // Screen 10: TP Dashboard (Post-Approval)
  {
    path: 'eoi/dashboard',
    loadComponent: () => import('./features/eoi/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },
  {
    path: 'eoi/tender-status',
    loadComponent: () => import('./features/eoi/my-applications/my-applications.component').then(m => m.MyApplicationsComponent),
    canActivate: [roleGuard],
    data: { roles: ['TP_PIA', 'citizen'] }
  },
  {
    path: 'eoi/my-applications',
    redirectTo: 'eoi/tender-status',
    pathMatch: 'full'
  },

  // Screen 14: Department User (Admin) — EOI View
  {
    path: 'admin/eoi-view',
    loadComponent: () => import('./features/admin/dept-eoi-view/dept-eoi-view.component').then(m => m.DeptEoiViewComponent),
    canActivate: [roleGuard],
    data: { roles: ['DEPARTMENT_ADMIN', 'SUPER_ADMIN'] }
  },

  // Screen 15: Department User (Admin) — Responses List
  {
    path: 'admin/responses/:schemeId',
    loadComponent: () => import('./features/admin/responses-list/responses-list.component').then(m => m.ResponsesListComponent),
    canActivate: [roleGuard],
    data: { roles: ['DEPARTMENT_ADMIN', 'SUPER_ADMIN'] }
  },
  {
    path: 'admin/responses',
    loadComponent: () => import('./features/admin/responses-list/responses-list.component').then(m => m.ResponsesListComponent),
    canActivate: [roleGuard],
    data: { roles: ['DEPARTMENT_ADMIN', 'SUPER_ADMIN'] }
  },

  // Screen 16: Department User (Admin) — Detailed Profile Review Desk
  {
    path: 'admin/review/:applicationId',
    loadComponent: () => import('./features/admin/profile-review/profile-review.component').then(m => m.ProfileReviewComponent),
    canActivate: [roleGuard],
    data: { roles: ['DEPARTMENT_ADMIN', 'SUPER_ADMIN'] }
  },

  // Screen 17: Super Admin — Masters (CRUD)
  {
    path: 'admin/masters',
    loadComponent: () => import('./features/admin/super-admin/masters/masters.component').then(m => m.MastersComponent),
    canActivate: [roleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },

  // Screen 18: Super Admin — Configure EOI (Dynamic Form Builder)
  {
    path: 'admin/configure-eoi',
    loadComponent: () => import('./features/admin/super-admin/configure-eoi/configure-eoi.component').then(m => m.ConfigureEoiComponent),
    canActivate: [roleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },

  // Screen 19: Super Admin — Manage Users
  {
    path: 'admin/manage-users',
    loadComponent: () => import('./features/admin/super-admin/manage-users/manage-users.component').then(m => m.ManageUsersComponent),
    canActivate: [roleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },

  // Current Working Feature: Super Admin Panel
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [roleGuard],
    data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'] }
  },

  // ==========================================
  // ISMS 2.0 NEW WORKFLOW ROUTES
  // ==========================================
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [roleGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      
      // ================= DEPARTMENT MODULE =================
      {
        path: 'department/tenders',
        loadComponent: () => import('./features/department/tender-management/tender-list.component').then(m => m.TenderListComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'] }
      },
      {
        path: 'department/sanction-orders',
        loadComponent: () => import('./features/department/sanction-orders/sanction-order-list.component').then(m => m.SanctionOrderListComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'] }
      },
      {
        path: 'department/sanction-orders/create',
        loadComponent: () => import('./features/department/sanction-orders/sanction-order-create.component').then(m => m.SanctionOrderCreateComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN'] }
      },
      
      // ================= AUDITOR MODULE =================
      {
        path: 'auditor/dashboard',
        loadComponent: () => import('./features/auditor/auditor-dashboard.component').then(m => m.AuditorDashboardComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'AUDITOR'] }
      },
      {
        path: 'auditor/tps',
        loadComponent: () => import('./features/auditor/auditor-tp-list.component').then(m => m.AuditorTpListComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'AUDITOR'] }
      },
      {
        path: 'auditor/tps/:id',
        loadComponent: () => import('./features/auditor/auditor-tp-detail.component').then(m => m.AuditorTpDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'AUDITOR'] }
      },
      {
        path: 'auditor/inspection/:id',
        loadComponent: () => import('./features/auditor/inspection.component').then(m => m.InspectionComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'AUDITOR'] }
      },

      // ================= TP MODULE =================
      {
        path: 'tp/sanction-orders',
        loadComponent: () => import('./features/tp-pia/sanction-orders/tp-sanction-order-list.component').then(m => m.TpSanctionOrderListComponent),
        data: { roles: ['TP_PIA'] }
      },
      
      // ================= TRAINEE MODULE =================
      {
        path: 'trainees',
        loadComponent: () => import('./features/trainees/pages/trainee-list/trainee-list.component').then(m => m.TraineeListComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'TP_PIA'] }
      },
      {
        path: 'trainees/register',
        loadComponent: () => import('./features/trainees/pages/trainee-form/trainee-form.component').then(m => m.TraineeFormComponent),
        data: { roles: ['TP_PIA'] }
      },
      {
        path: 'trainees/assign',
        loadComponent: () => import('./features/trainees/pages/assign-batch/assign-batch.component').then(m => m.AssignBatchComponent),
        data: { roles: ['TP_PIA'] }
      },
      {
        path: 'trainees/unmap',
        loadComponent: () => import('./features/trainees/pages/unmap-batch/unmap-batch.component').then(m => m.UnmapBatchComponent),
        data: { roles: ['TP_PIA'] }
      },

      // ================= ATTENDANCE MODULE =================
      {
        path: 'attendance/users',
        loadComponent: () => import('./features/attendance/pages/attendance-user-list/attendance-user-list.component').then(m => m.AttendanceUserListComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'TP_PIA'] }
      },
      {
        path: 'attendance/capture',
        loadComponent: () => import('./features/attendance/pages/attendance-capture/attendance-capture.component').then(m => m.AttendanceCaptureComponent),
        data: { roles: ['TP_PIA'] }
      },

      // ================= SDC MODULE =================
      {
        path: 'sdcs',
        loadComponent: () => import('./features/sdc/pages/sdc-list/sdc-list.component').then(m => m.SdcListComponent),
        data: { roles: ['TP_PIA'] }
      },
      {
        path: 'sdcs/create',
        loadComponent: () => import('./features/sdc/pages/sdc-create/sdc-create.component').then(m => m.SdcCreateComponent),
        data: { roles: ['TP_PIA'] }
      },
      {
        path: 'sdcs/:id',
        loadComponent: () => import('./features/sdc/pages/sdc-detail/sdc-detail.component').then(m => m.SdcDetailComponent),
        data: { roles: ['SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'TP_PIA', 'INSPECTOR', 'APPROVAL_AUTHORITY', 'AUDITOR'] }
      },
      {
        path: 'batches',
        loadComponent: () => import('./features/batches/pages/batch-list/batch-list.component').then(m => m.BatchListComponent),
        data: { roles: ['TP_PIA'] }
      },
      {
        path: 'batches/create',
        loadComponent: () => import('./features/batches/pages/batch-create/batch-create.component').then(m => m.BatchCreateComponent),
        data: { roles: ['TP_PIA'] }
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
