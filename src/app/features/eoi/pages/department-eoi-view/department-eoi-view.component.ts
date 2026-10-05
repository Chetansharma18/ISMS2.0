import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../../shared';
import { DeptAdminOtpModalComponent } from '../../../../core/auth/components/dept-admin-otp-modal/dept-admin-otp-modal.component';

@Component({
  selector: 'app-department-eoi-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent,
    DeptAdminOtpModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      <!-- Department Admin 6-Digit OTP Verification Modal (shown if OTP not yet verified in session) -->
      <app-dept-admin-otp-modal
        [isOpen]="showOtpModal()"
        [ssoId]="currentSsoId()"
        (verified)="onOtpVerified($event)"
        (cancelled)="onOtpCancelled()"
      ></app-dept-admin-otp-modal>

      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Header via Reusable PageHeaderComponent with Rajasthan Fort Banner -->
        <app-page-header
          title="EOI Responses"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'EOI Responses' }]"
        >
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/15 text-white border border-white/20 text-xs font-normal shadow-2xs">
            <span>Published Schemes:</span>
            <span class="font-bold text-white">{{ schemes().length }}</span>
          </div>
        </app-page-header>

        <!-- Main Schemes Table via Reusable TableComponent -->
        <app-table
          [columns]="schemeColumns"
          [data]="schemes()"
          [pagination]="true"
          [pageSize]="10"
          [customTemplates]="{
            schemeTitle: schemeTitleTemplate,
            responseCount: responseCountTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <!-- Custom Scheme Title Template -->
        <ng-template #schemeTitleTemplate let-scheme>
          <div class="font-semibold text-slate-900 text-[13px] leading-snug">
            {{ scheme.schemeTitle }}
          </div>
          <div class="text-[11px] font-mono text-slate-500 mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <!-- Custom Response Count Template -->
        <ng-template #responseCountTemplate let-scheme>
          <span class="font-bold text-slate-900 text-[13px]">{{ scheme.responseCount }}</span>
          <span class="text-slate-500 text-[11px] ml-1">EOIs</span>
        </ng-template>

        <!-- Custom Action Template: Changed button text to 'View' without hover scrollbar -->
        <ng-template #actionTemplate let-scheme>
          @if (scheme.status === 'Closed') {
            <a
              [routerLink]="['/admin/responses', scheme.id]"
              class="inline-flex items-center justify-center px-4 py-1.5 rounded-md text-xs font-semibold bg-[#0B3558] hover:bg-[#07243c] text-white shadow-2xs transition-colors cursor-pointer min-w-[64px]"
            >
              <span>View</span>
            </a>
          } @else {
            <div class="relative group inline-block">
              <button
                type="button"
                disabled
                class="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-300 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed min-w-[64px]"
                title="Submissions unlock upon Date of closing"
              >
                <svg class="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>View</span>
              </button>
              <!-- Tooltip positioned right-aligned so it never causes horizontal scrollbar on hover -->
              <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[10.5px] rounded px-2.5 py-1 whitespace-nowrap z-30 shadow-md font-normal pointer-events-none">
                Submissions unlock upon Date of closing
              </div>
            </div>
          }
        </ng-template>

      </div>
    </div>
  `
})
export class DepartmentEoiViewComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private authService = inject(AuthService);
  private router = inject(Router);

  schemes = signal<Scheme[]>([]);
  showOtpModal = signal<boolean>(false);
  currentSsoId = signal<string>('dept_admin');

  readonly schemeColumns: TableColumn<Scheme>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', type: 'custom' },
    {
      key: 'category',
      label: 'Category',
      align: 'center',
      cellClass: 'whitespace-nowrap font-normal text-slate-700',
      format: (val) => {
        if (!val || val === 'NA' || val === '-') return '-';
        const cleaned = val.replace(/^Category\s+[I|V|X|0-9]+:\s*/i, '').trim();
        if (cleaned.toUpperCase() === 'RAJKVIK') return 'Rajvik';
        if (cleaned.toUpperCase() === 'SAMARTH') return 'Samarth';
        if (cleaned.toUpperCase() === 'SAKSHM' || cleaned.toUpperCase() === 'SAKSHAM') return 'Saksham';
        return cleaned || '-';
      }
    },
    { key: 'dateOfOpening', label: 'Date of Opening', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'dateOfClosing', label: 'Date of Closing', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'status', label: 'Status', align: 'center', type: 'status' },
    { key: 'responseCount', label: 'No. of Responses', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700', type: 'custom' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-24', type: 'custom' }
  ];

  ngOnInit(): void {
    // Check if user is navigating directly to dept_admin without OTP verified
    const user = this.authService.currentUser();
    if (user) {
      this.currentSsoId.set(user.ssoId || user.id);
    }
    if (!this.authService.isDeptAdminOtpVerified()) {
      this.showOtpModal.set(true);
    }

    this.eoiStateService.getSchemes().subscribe(data => {
      this.schemes.set(data);
    });
  }

  onOtpVerified(otp: string): void {
    this.authService.setDeptAdminOtpVerified(true);
    // If not logged in as dept_admin, set credentials
    if (this.authService.currentUser()?.role !== 'dept_admin') {
      this.authService.loginWithCredentials(this.currentSsoId(), 'dept_admin', null);
    }
    this.showOtpModal.set(false);
  }

  onOtpCancelled(): void {
    this.showOtpModal.set(false);
    this.router.navigate(['/sso-login']);
  }
}
