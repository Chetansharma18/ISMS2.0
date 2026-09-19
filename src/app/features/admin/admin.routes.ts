import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';
import { adminAuthGuard } from './core/guards/admin-auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [adminAuthGuard],
    children: [
      { path: '', redirectTo: 'masters/schemes', pathMatch: 'full' },
      
      // 1. EOI Dashboard (Moved from root)

      // 2. Masters - Schemes
      {
        path: 'masters/schemes',
        loadComponent: () => import('./masters/schemes/scheme-list.component').then(m => m.SchemeListComponent)
      },
      {
        path: 'masters/schemes/create',
        loadComponent: () => import('./masters/schemes/scheme-form.component').then(m => m.SchemeFormComponent)
      },
      {
        path: 'masters/schemes/edit/:id',
        loadComponent: () => import('./masters/schemes/scheme-form.component').then(m => m.SchemeFormComponent)
      },

      // Generic Masters
      {
        path: 'masters/scheme-categories',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'scheme-categories' }
      },
      {
        path: 'masters/eoi-categories',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'eoi-categories' }
      },
      {
        path: 'masters/departments',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'departments' }
      },
      {
        path: 'masters/organization-types',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'organization-types' }
      },
      {
        path: 'masters/user-types',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'user-types' }
      },
      {
        path: 'masters/designations',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'designations' }
      },
      {
        path: 'masters/states',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'states' }
      },
      {
        path: 'masters/districts',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'districts' }
      },
      {
        path: 'masters/blocks',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'blocks' }
      },
      {
        path: 'masters/document-types',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'document-types' }
      },
      {
        path: 'masters/transactions',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'transactions' }
      },
      {
        path: 'masters/fees',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'fees' }
      },
      {
        path: 'masters/roles',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'roles' }
      },
      {
        path: 'masters/access-levels',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'access-levels' }
      },
      {
        path: 'masters/application-status',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'application-status' }
      },
      {
        path: 'masters/committee-roles',
        loadComponent: () => import('./masters/generic-master.component').then(m => m.GenericMasterComponent),
        data: { type: 'committee-roles' }
      },

      // 3. EOI Management
      {
        path: 'eoi/dashboard',
        loadComponent: () => import('./eoi/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'eoi',
        loadComponent: () => import('./eoi/eoi-list/eoi-list.component').then(m => m.EoiListComponent)
      },
      {
        path: 'eoi/create',
        loadComponent: () => import('./eoi/eoi-create/eoi-create.component').then(m => m.EoiCreateComponent)
      },
      {
        path: 'eoi/edit/:id',
        loadComponent: () => import('./eoi/eoi-create/eoi-create.component').then(m => m.EoiCreateComponent)
      },
      {
        path: 'eoi/:id/details',
        loadComponent: () => import('./eoi/eoi-details/eoi-details.component').then(m => m.EoiDetailsComponent)
      },
      {
        path: 'eoi/:id/form-builder',
        loadComponent: () => import('./eoi/form-builder/form-builder.component').then(m => m.FormBuilderComponent)
      },
      {
        path: 'eoi/:id/preview',
        loadComponent: () => import('./eoi/eoi-preview/eoi-preview.component').then(m => m.EoiPreviewComponent)
      },
      {
        path: 'eoi/:id/reschedule',
        loadComponent: () => import('./eoi/reschedule/reschedule.component').then(m => m.RescheduleComponent)
      },
      {
        path: 'eoi/:id/amendments',
        loadComponent: () => import('./eoi/amendments/amendments.component').then(m => m.AmendmentsComponent)
      },
      {
        path: 'eoi/:id/history',
        loadComponent: () => import('./eoi/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'eoi/committee-assign',
        loadComponent: () => import('./eoi/committee-assignment/committee-assignment.component').then(m => m.CommitteeAssignmentComponent)
      },
      {
        path: 'eoi/:id/committee',
        loadComponent: () => import('./eoi/committee-assignment/committee-assignment.component').then(m => m.CommitteeAssignmentComponent)
      },
      {
        path: 'eoi/:id/responses',
        loadComponent: () => import('./eoi/responses/responses.component').then(m => m.ResponsesComponent)
      },
      {
        path: 'eoi/:eoiId/responses/:applicationId',
        loadComponent: () => import('./eoi/responses/response-details.component').then(m => m.ResponseDetailsComponent)
      },

      // 4. Committees
      {
        path: 'committees',
        loadComponent: () => import('./committees/committee-list/committee-list.component').then(m => m.CommitteeListComponent)
      },
      {
        path: 'committees/create',
        loadComponent: () => import('./committees/committee-list/committee-list.component').then(m => m.CommitteeListComponent)
      },

      // 5. Users & SSO
      {
        path: 'users',
        loadComponent: () => import('./users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'users/create',
        loadComponent: () => import('./users/user-create/user-create.component').then(m => m.UserCreateComponent)
      },

      // 6. Applications
      {
        path: 'applications',
        loadComponent: () => import('./applications/applications.component').then(m => m.ApplicationsComponent)
      },

      // 7. Reports
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
      },

      // 8. Audit Logs
      {
        path: 'audit-logs',
        loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent)
      },

      // 9. Settings
      {
        path: 'settings',
        loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent)
      }
    ]
  }
];
