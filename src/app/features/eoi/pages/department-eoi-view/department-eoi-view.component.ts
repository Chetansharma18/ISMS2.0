import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AssignedRole, UserRole } from '../../../../core/auth/auth.service';
import { HttpService } from '../../../../core/http/http.service';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { ApiError } from '../../../../core/http/api-error';
import { EoiResponsesRow, filterResponsesRows, responsesRowsFrom } from './department-eoi-view.util';
import { PermissionService } from '../../../../core/permissions/permission.service';
import {
  ButtonComponent,
  IconComponent,
  ListPageComponent,
  TableColumn
} from '../../../../shared';
import { DeptAdminOtpModalComponent } from '../../../../core/auth/components/dept-admin-otp-modal/dept-admin-otp-modal.component';

@Component({
  selector: 'app-department-eoi-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    IconComponent,
    ListPageComponent,
    DeptAdminOtpModalComponent
  ],
  template: `
    <app-list-page
      title="EOI Responses"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'EOI Responses' }]"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Scheme, Ref No, Category..."
      [columns]="schemeColumns"
      [data]="filteredSchemes()"
      [pagination]="true"
      [pageSize]="10"
      [emptyMessage]="loading() ? 'Loading EOIs...' : searchQuery() ? 'No EOIs match your search query.' : 'No EOIs to review. EOIs appear here once you are on their committee.'"
      [customTemplates]="{
        schemeTitle: schemeTitleTemplate,
        responseCount: responseCountTemplate,
        action: actionTemplate
      }"
    >
        <!-- Department Admin 6-Digit OTP Verification Modal (shown if OTP not yet verified in session) -->
        <app-dept-admin-otp-modal
          [isOpen]="showOtpModal()"
          [ssoId]="currentSsoId()"
          (verified)="onOtpVerified($event)"
          (cancelled)="onOtpCancelled()"
        ></app-dept-admin-otp-modal>

        <!-- Custom Scheme Title Template -->
        <ng-template #schemeTitleTemplate let-scheme>
          <div class="font-normal text-slate-800 text-[13px] leading-snug">
            {{ scheme.schemeTitle }}
          </div>
          <div class="text-[11px] tabular-nums text-slate-500 mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <!-- Custom Response Count Template -->
        <ng-template #responseCountTemplate let-scheme>
          <span class="font-normal text-slate-800 text-[13px]">{{ scheme.responseCount }}</span>
          <span class="text-slate-500 text-[11px] ml-1">EOIs</span>
        </ng-template>

        @if (loadError()) {
          <p beforeTable class="m-0 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700" role="alert">{{ loadError() }}</p>
        }

        <!-- Custom Action Template: Icon-only with tooltips. The backend decides when submissions unlock. -->
        <ng-template #actionTemplate let-scheme>
          @if (!scheme.isLocked) {
            <a
              appButton
              variant="ghost"
              size="sm"
              iconOnly
              [routerLink]="['/admin/responses', scheme.id]"
              title="View Submissions"
              aria-label="View Submissions"
            >
              <app-icon name="eye" size="sm" />
            </a>
          } @else {
            <div class="relative group inline-block">
              <button
                appButton
                variant="ghost"
                size="sm"
                iconOnly
                disabled
                [title]="scheme.lockReason"
                [attr.aria-label]="scheme.lockReason"
              >
                <app-icon name="lock" size="sm" [stroke]="2" class="text-slate-400" />
              </button>
              <!-- Tooltip positioned right-aligned so it never causes horizontal scrollbar on hover -->
              <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[10.5px] rounded px-2.5 py-1 whitespace-nowrap z-30 shadow-md font-normal pointer-events-none">
                {{ scheme.lockReason }}
              </div>
            </div>
          }
        </ng-template>

    </app-list-page>
  `
})
export class DepartmentEoiViewComponent implements OnInit {
  private http = inject(HttpService);
  private authService = inject(AuthService);
  private permissions = inject(PermissionService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** EOIs the signed-in user may review (committee seat or EoiResponses permission), from GET /api/eoi/responses. */
  readonly schemes = signal<EoiResponsesRow[]>([]);
  readonly loading = signal<boolean>(false);
  readonly loadError = signal<string>('');
  readonly searchQuery = signal<string>('');
  showOtpModal = signal<boolean>(false);
  currentSsoId = signal<string>('dept_admin');

  readonly filteredSchemes = computed(() => filterResponsesRows(this.schemes(), this.searchQuery()));

  readonly schemeColumns: TableColumn<EoiResponsesRow>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-14' },
    { key: 'schemeTitle', label: 'EOI Ref No. & Scheme Name', type: 'custom' },
    { key: 'category', label: 'Category', align: 'center', cellClass: 'font-normal text-slate-700' },
    { key: 'dateOfOpening', label: 'Date of Publishing', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
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

    this.loadSchemes();
  }

  private loadSchemes(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.http
      .call<unknown>(API_ENDPOINTS.EOI_RESPONSES.LIST, { params: { page: 1, pageSize: 100 }, flags: { skipErrorToast: true } })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          this.schemes.set(responsesRowsFrom(res));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.schemes.set([]);
          this.loading.set(false);
          this.loadError.set(error instanceof ApiError ? error.message : 'The EOIs could not be loaded. Please try again.');
        }
      });
  }

  onOtpVerified(otp: string): void {
    this.authService.setDeptAdminOtpVerified(true);
    if (!this.permissions.hasRole('dept_admin')) {
      if (this.authService.canSwitchRole()) {
        // User already holds the department role - just make it the active one
        this.authService.switchActiveRole('dept_admin', false);
      } else {
        this.authService.loginWithCredentials(this.currentSsoId(), 'dept_admin', null);
      }
    }
    this.showOtpModal.set(false);
  }

  onOtpCancelled(): void {
    this.showOtpModal.set(false);
    // Back to the home page; its Login button opens RajSSO (or the persona picker with mock sign-in).
    this.router.navigate(['/']);
  }

  roleDropdownOpen = signal<boolean>(false);
  readonly assignedRoles = this.authService.assignedRoles;
  readonly canSwitchRole = this.authService.canSwitchRole;
  readonly activeRoleLabel = this.authService.activeRoleLabel;

  isActiveRole(roleId: string): boolean {
    return this.permissions.hasRole(roleId as UserRole);
  }

  toggleRoleDropdown(): void {
    this.roleDropdownOpen.update(v => !v);
  }

  onSelectRole(roleId: AssignedRole['id']): void {
    this.roleDropdownOpen.set(false);
    this.authService.switchActiveRole(roleId);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#dept-role-dropdown-container')) {
      this.roleDropdownOpen.set(false);
    }
  }
}
