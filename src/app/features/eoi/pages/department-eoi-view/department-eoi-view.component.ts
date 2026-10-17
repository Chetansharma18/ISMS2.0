import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { AuthService, AssignedRole, UserRole } from '../../../../core/auth/auth.service';
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
      searchPlaceholder="Search Scheme Name, Ref No, Category..."
      [columns]="schemeColumns"
      [data]="filteredSchemes()"
      [pagination]="true"
      [pageSize]="10"
      emptyMessage="No schemes match your search query."
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
          <div class="text-[11px] font-mono text-slate-500 mt-0.5">
            Ref: {{ scheme.refNo }}
          </div>
        </ng-template>

        <!-- Custom Response Count Template -->
        <ng-template #responseCountTemplate let-scheme>
          <span class="font-normal text-slate-800 text-[13px]">{{ scheme.responseCount }}</span>
          <span class="text-slate-500 text-[11px] ml-1">EOIs</span>
        </ng-template>

        <!-- Custom Action Template: Changed button text to 'View' with guaranteed white text -->
        <ng-template #actionTemplate let-scheme>
          @if (scheme.status === 'Closed') {
            <a appButton size="sm" [routerLink]="['/admin/responses', scheme.id]">
              <span>View</span>
            </a>
          } @else {
            <div class="relative group inline-block">
              <button appButton variant="outline" size="sm" disabled title="Submissions unlock upon Date of closing">
                <app-icon name="lock" size="xs" [stroke]="2" class="text-slate-400" />
                <span>View</span>
              </button>
              <!-- Tooltip positioned right-aligned so it never causes horizontal scrollbar on hover -->
              <div class="absolute bottom-full right-0 mb-1.5 hidden group-hover:block bg-slate-800 text-white text-[10.5px] rounded px-2.5 py-1 whitespace-nowrap z-30 shadow-md font-normal pointer-events-none">
                Submissions unlock upon Date of closing
              </div>
            </div>
          }
        </ng-template>

    </app-list-page>
  `
})
export class DepartmentEoiViewComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private authService = inject(AuthService);
  private permissions = inject(PermissionService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  schemes = signal<Scheme[]>([]);
  readonly searchQuery = signal<string>('');
  showOtpModal = signal<boolean>(false);
  currentSsoId = signal<string>('dept_admin');

  readonly filteredSchemes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.schemes();
    return this.schemes().filter(s =>
      (s.schemeTitle && s.schemeTitle.toLowerCase().includes(q)) ||
      (s.refNo && s.refNo.toLowerCase().includes(q)) ||
      (s.category && s.category.toLowerCase().includes(q)) ||
      (s.status && s.status.toLowerCase().includes(q))
    );
  });

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

    this.eoiStateService.getSchemes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.schemes.set(data);
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
    this.router.navigate(['/sso-login']);
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
