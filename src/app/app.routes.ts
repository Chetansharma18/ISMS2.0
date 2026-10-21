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
    path: 'training-calendar',
    loadComponent: () =>
      import('./features/aspirant/pages/training-calendar.component').then(
        (m) => m.TrainingCalendarComponent
      )
  },
  {
    path: 'expressed-interest',
    loadComponent: () =>
      import('./features/aspirant/pages/expressed-interest.component').then(
        (m) => m.ExpressedInterestComponent
      )
  },
  {
    path: 'grievance',
    loadComponent: () =>
      import('./features/grievance/grievance-list.component').then(
        (m) => m.GrievanceListComponent
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
    path: 'payment-history',
    loadComponent: () =>
      import('./features/payment-history/payment-history.component').then(
        (m) => m.PaymentHistoryComponent
      )
  },
  {
    path: 'history',
    redirectTo: 'payment-history',
    pathMatch: 'full'
  },
  {
    path: 'transactions',
    redirectTo: 'payment-history',
    pathMatch: 'full'
  },
  {
    path: 'ipa',
    loadComponent: () =>
      import('./features/ipa/ipa-list.component').then(
        (m) => m.IpaListComponent
      )
  },
  {
    path: 'tp/ipa',
    redirectTo: 'ipa',
    pathMatch: 'full'
  },
  {
    path: 'admin/grievance',
    loadComponent: () =>
      import('./features/admin-grievance/admin-grievance-list.component').then(
        (m) => m.AdminGrievanceListComponent
      )
  },
  {
    path: 'admin/batch-approvals',
    loadComponent: () =>
      import('./features/sdc/components/batch-approvals.component').then(
        (m) => m.BatchApprovalsComponent
      )
  },
  {
    path: 'admin/batch-detail/:id',
    loadComponent: () =>
      import('./features/sdc/components/batch-detail.component').then(
        (m) => m.BatchDetailComponent
      )
  },
  {
    path: 'admin/batches/:id',
    redirectTo: 'batches/:id'
  },
  {
    path: 'batch-approvals',
    redirectTo: 'admin/batch-approvals',
    pathMatch: 'full'
  },
  {
    path: 'admin/eoi-view',
    loadComponent: () =>
      import('./features/eoi/pages/department-eoi-view/department-eoi-view.component').then(
        (m) => m.DepartmentEoiViewComponent
      )
  },
  {
    path: 'admin/sanction-orders',
    loadComponent: () =>
      import('./features/eoi/pages/sanction-order-list/sanction-order-list.component').then(
        (m) => m.SanctionOrderListComponent
      )
  },
  {
    path: 'admin/ipa',
    loadComponent: () =>
      import('./features/eoi/pages/ipa-list/ipa-list.component').then((m) => m.IpaListComponent)
  },
  {
    path: 'admin/ipa/:schemeId',
    loadComponent: () =>
      import('./features/eoi/pages/ipa-list/ipa-approved-tps.component').then(
        (m) => m.IpaApprovedTpsComponent
      )
  },
  {
    path: 'admin/mou-draft/:schemeId',
    loadComponent: () =>
      import('./features/eoi/pages/mou/mou-draft.component').then((m) => m.MouDraftComponent)
  },
  {
    path: 'admin/eoi-sanction-editor/:schemeId',
    loadComponent: () =>
      import('./features/eoi/pages/eoi-sanction-editor/eoi-sanction-editor.component').then(
        (m) => m.EoiSanctionEditorComponent
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
    path: 'admin/ipa-editor/:schemeId/:appId',
    loadComponent: () =>
      import('./features/eoi/pages/ipa-editor/ipa-editor.component').then(
        (m) => m.IpaEditorComponent
      )
  },
  {
    path: 'admin/sanction-order/:schemeId',
    loadComponent: () =>
      import('./features/eoi/pages/sanction-order/sanction-order.component').then(
        (m) => m.SanctionOrderComponent
      )
  },
  {
    path: 'admin/sanction-order',
    loadComponent: () =>
      import('./features/eoi/pages/sanction-order/sanction-order.component').then(
        (m) => m.SanctionOrderComponent
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
    path: 'admin/camera-monitoring/batches/:sdcId',
    loadComponent: () =>
      import('./features/sdc/components/camera-batch-list.component').then(
        (m) => m.CameraBatchListComponent
      )
  },
  {
    path: 'admin/camera-monitoring/:tpId',
    loadComponent: () =>
      import('./features/sdc/components/camera-sdc-list.component').then(
        (m) => m.CameraSdcListComponent
      )
  },
  {
    path: 'admin/camera-monitoring',
    loadComponent: () =>
      import('./features/sdc/components/camera-monitoring.component').then(
        (m) => m.CameraMonitoringComponent
      )
  },
  {
    path: 'admin/eoi-configuration',
    loadComponent: () =>
      import('./features/tenders/tenders-page.component').then(
        (m) => m.TendersPageComponent
      )
  },
  {
    path: 'admin/two-step-verification',
    loadComponent: () =>
      import('./features/two-step-verification/two-step-verification.component').then(
        (m) => m.TwoStepVerificationComponent
      )
  },
  {
    path: 'admin/dynamic-form-builder',
    loadComponent: () =>
      import('./features/dynamic-form-builder/dynamic-form-builder.component').then(
        (m) => m.DynamicFormBuilderComponent
      )
  },
  {
    path: 'dynamic-form-builder',
    redirectTo: 'admin/dynamic-form-builder',
    pathMatch: 'full'
  },
  {
    path: 'admin/master/eoi-category',
    loadComponent: () =>
      import('./features/admin-master/eoi-category-master.component').then(
        (m) => m.EoiCategoryMasterComponent
      )
  },
  {
    path: 'admin/master/scheme',
    loadComponent: () =>
      import('./features/admin-master/scheme-master.component').then(
        (m) => m.SchemeMasterComponent
      )
  },
  {
    path: 'admin/master/scheme-category',
    loadComponent: () =>
      import('./features/admin-master/scheme-category-master.component').then(
        (m) => m.SchemeCategoryMasterComponent
      )
  },
  {
    path: 'admin/master/sector',
    loadComponent: () =>
      import('./features/admin-master/sector-master.component').then(
        (m) => m.SectorMasterComponent
      )
  },
  {
    path: 'admin/master/course',
    loadComponent: () =>
      import('./features/admin-master/course-master.component').then(
        (m) => m.CourseMasterComponent
      )
  },
  {
    path: 'admin/master/permission',
    loadComponent: () =>
      import('./features/admin-master/permission-master.component').then(
        (m) => m.PermissionMasterComponent
      )
  },
  {
    path: 'admin/master/user-role',
    loadComponent: () =>
      import('./features/admin-master/user-role-master.component').then(
        (m) => m.UserRoleMasterComponent
      )
  },
  {
    path: 'admin/master/district-block',
    loadComponent: () =>
      import('./features/admin-master/district-block-master.component').then(
        (m) => m.DistrictBlockMasterComponent
      )
  },
  {
    path: 'admin/master/designation',
    loadComponent: () =>
      import('./features/admin-master/designation-master.component').then(
        (m) => m.DesignationMasterComponent
      )
  },
  {
    path: 'admin/master/doc',
    loadComponent: () =>
      import('./features/admin-master/doc-master.component').then(
        (m) => m.DocMasterComponent
      )
  },
  {
    path: 'admin/master/remark',
    loadComponent: () =>
      import('./features/admin-master/remark-master.component').then(
        (m) => m.RemarkMasterComponent
      )
  },
  {
    path: 'admin/master/grading',
    loadComponent: () =>
      import('./features/admin-master/grading-master.component').then(
        (m) => m.GradingMasterComponent
      )
  },
  {
    path: 'admin/user-management',
    loadComponent: () =>
      import('./features/user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      )
  },
  {
    path: 'admin/master/:type',
    loadComponent: () =>
      import('./features/tenders/tenders-page.component').then(
        (m) => m.TendersPageComponent
      )
  },
  {
    path: 'admin/master',
    loadComponent: () =>
      import('./features/admin-master/eoi-category-master.component').then(
        (m) => m.EoiCategoryMasterComponent
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
        path: 'create',
        loadComponent: () =>
          import('./features/sdc/components/sdc-create.component').then(
            (m) => m.SdcCreateComponent
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
      },
      {
        path: ':id/edit',
        // The same form as Create Batch, filled with the batch being edited.
        loadComponent: () =>
          import('./features/sdc/components/batch-form.component').then(
            (m) => m.BatchFormComponent
          )
      },
      {
        path: ':batchId/map-aspirant',
        loadComponent: () =>
          import('./features/sdc/components/aspirant-mapping.component').then(
            (m) => m.AspirantMappingComponent
          )
      },
      {
        path: 'map-aspirant',
        loadComponent: () =>
          import('./features/sdc/components/aspirant-mapping.component').then(
            (m) => m.AspirantMappingComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/sdc/components/batch-detail.component').then(
            (m) => m.BatchDetailComponent
          )
      }
    ]
  },
  {
    path: 'tp/sanction-orders',
    // Same table as the department's; the training partner can only view released orders.
    data: { viewOnly: true },
    loadComponent: () =>
      import('./features/eoi/pages/sanction-order-list/sanction-order-list.component').then(
        (m) => m.SanctionOrderListComponent
      )
  },
  {
    path: 'sanction-orders',
    redirectTo: 'tp/sanction-orders',
    pathMatch: 'full'
  },
  {
    path: 'aspirants',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/sdc/components/aspirant-list.component').then(
            (m) => m.AspirantListComponent
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./features/sdc/components/aspirant-detail.component').then(
            (m) => m.AspirantDetailComponent
          )
      }
    ]
  },
  {
    path: 'tp/aspirants',
    redirectTo: 'aspirants',
    pathMatch: 'full'
  },
  {
    // Attendance of the aspirants of approved batches: biometric and offline marking, reports, analytics, notifications.
    path: 'attendance',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/attendance/attendance-list.component').then(
            (m) => m.AttendanceListComponent
          )
      },
      {
        path: ':batchId',
        loadComponent: () =>
          import('./features/attendance/attendance-batch.component').then(
            (m) => m.AttendanceBatchComponent
          )
      }
    ]
  },
  {
    // User Management of the training partner: the Center Heads, faculty and Attender Users it created.
    path: 'tp/users',
    loadComponent: () =>
      import('./features/sdc/components/tp-user-list.component').then(
        (m) => m.TpUserListComponent
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
