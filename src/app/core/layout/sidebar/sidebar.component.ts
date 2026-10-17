import { ChangeDetectionStrategy, Component, inject, computed, signal, Output, EventEmitter, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../auth/auth.service';
import { PermissionService } from '../../permissions/permission.service';
import { AspirantPortalService } from '../../../features/aspirant/services/aspirant-portal.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import {
  ADMIN_TOOL_NAV,
  ASPIRANT_NAV,
  DEFAULT_MATCH,
  DEPT_ADMIN_NAV,
  EOI_CONFIGURATION_NAV,
  EXACT_MATCH,
  EXISTING_USER_NAV,
  MASTER_ICON,
  MASTER_NAV,
  NEW_USER_NAV,
  USER_MANAGEMENT_ICON,
  USER_MANAGEMENT_NAV
} from './sidebar-nav.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ButtonComponent, IconComponent],
  host: {
    class: 'block shrink-0 h-full'
  },
  template: `
    <!-- Premium Sidebar -->
    <aside
      class="shrink-0 bg-white border-r border-slate-200 h-full flex flex-col justify-between select-none overflow-y-auto font-sans w-57 max-w-full"
      (click)="onNavClick($event)"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Top: Brand + Nav -->
      <div class="flex flex-col">
        
        <!-- Mobile Sidebar Close Header (Visible only < md) -->
        <div class="md:hidden flex items-center justify-between px-3.5 py-3 border-b border-slate-200 bg-[#F5F8FA]">
          <div class="flex items-center gap-2">
            <span class="font-bold text-sm text-[#12365A]">ISMS 2.0</span>
            <span class="text-[11px] text-slate-500 font-medium">Menu</span>
          </div>
          <button
            appButton
            variant="ghost"
            size="sm"
            iconOnly
            (click)="closeMobileNav.emit()"
            aria-label="Close navigation menu"
            title="Close menu"
          >
            <app-icon name="close" />
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5 py-3" aria-label="Main Navigation">
          @if (isAspirant()) {
            @for (item of aspirantNav; track item.key) {
              <ng-container *ngTemplateOutlet="navLink; context: { $implicit: item, pending: item.key === 'profile' && isAspirantProfilePending() }" />
            }
          } @else if (isSuperAdmin()) {
            <ng-container *ngTemplateOutlet="navLink; context: { $implicit: eoiConfigurationNav }" />

            @for (item of adminToolNav; track item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="bg-primary-light text-brand font-medium border border-border"
                [routerLinkActiveOptions]="defaultMatch"
                class="flex items-center gap-2.5 px-3 py-2 rounded-sm text-[13px] leading-5 text-text-secondary hover:bg-surface-muted hover:text-brand transition-all cursor-pointer group"
              >
                <app-icon [name]="item.icon" class="text-text-muted group-hover:text-brand transition-colors" />
                <span class="tracking-tight">{{ item.label }}</span>
              </a>
            }

            <ng-container *ngTemplateOutlet="navSection; context: { $implicit: masterSection }" />
            <ng-container *ngTemplateOutlet="navSection; context: { $implicit: userManagementSection }" />
          } @else if (isDeptAdmin()) {
            @for (item of deptAdminNav; track item.key) {
              <ng-container *ngTemplateOutlet="navLink; context: { $implicit: item }" />
            }
          } @else if (isExistingUser()) {
            @for (item of existingUserNav; track item.key) {
              <ng-container *ngTemplateOutlet="navLink; context: { $implicit: item, pending: item.key === 'profile' && isProfilePending() }" />
            }
          } @else {
            @for (item of newUserNav; track item.key) {
              <ng-container *ngTemplateOutlet="navLink; context: { $implicit: item, pending: item.key === 'profile' && isProfilePending() }" />
            }
          }

        </nav>
      </div>

    </aside>

    <!-- One link: icon, label and (for Profile) the "Pending" badge -->
    <ng-template #navLink let-item let-pending="pending">
      <a
        [routerLink]="item.link"
        [class.bg-primary-light]="isActive(item.key)"
        [class.text-brand]="isActive(item.key)"
        [class.font-medium]="isActive(item.key)"
        [class.border]="isActive(item.key)"
        [class.border-border]="isActive(item.key)"
        [class.text-text-secondary]="!isActive(item.key)"
        class="flex items-center justify-between px-3 py-2 rounded-sm text-[13px] leading-5 hover:bg-surface-muted hover:text-brand transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-2.5">
          <app-icon
            [name]="item.icon"
            [stroke]="item.stroke ?? 1.75"
            class="group-hover:text-brand transition-colors"
            [class.text-brand]="isActive(item.key)"
            [class.text-text-muted]="!isActive(item.key)"
          />
          <span class="tracking-tight" [class.font-medium]="item.bold">{{ item.label }}</span>
        </div>
        @if (pending) {
          <span class="px-2 py-0.5 rounded-full text-[11px] leading-tight shrink-0 inline-flex items-center gap-1.5 transition-all select-none bg-amber-50 text-[#C2410C] border border-amber-300 font-semibold shadow-2xs">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-600 shrink-0 animate-pulse"></span>
            Pending
          </span>
        }
      </a>
    </ng-template>

    <!-- A collapsible section (Master, User Management) -->
    <ng-template #navSection let-section>
      <div class="flex flex-col">
        <!-- ui-guard-allow: a section header is a navigation row, not a button -->
        <button
          appButton
          variant="ghost"
          block
          type="button"
          (click)="section.toggle()"
          class="justify-between h-auto px-3 py-2 rounded-sm text-[13px] leading-5 text-text-secondary hover:bg-surface-muted hover:text-brand group"
        >
          <div class="flex items-center gap-2.5">
            <app-icon [name]="section.icon" class="text-text-muted group-hover:text-brand transition-colors" />
            <span class="tracking-tight font-medium">{{ section.label }}</span>
          </div>
          <app-icon
            name="chevron-down"
            size="sm"
            [stroke]="2"
            class="text-slate-400 group-hover:text-brand transition-transform duration-200"
            [ngClass]="{'transform rotate-180': section.open()}"
          />
        </button>

        @if (section.open()) {
          <div class="flex flex-col gap-0.5 pl-7 pr-1 pt-1 pb-1 transition-all duration-300">
            @for (sub of section.items; track sub.label) {
              <a
                [routerLink]="sub.link"
                [queryParams]="sub.query"
                routerLinkActive="bg-primary-light text-brand font-semibold"
                [routerLinkActiveOptions]="sub.query ? exactMatch : defaultMatch"
                class="px-2.5 py-1.5 rounded text-[12px] text-slate-600 hover:bg-surface-muted hover:text-brand transition-colors flex items-center gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                <span class="truncate">{{ sub.label }}</span>
              </a>
            }
          </div>
        }
      </div>
    </ng-template>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  private permissions = inject(PermissionService);
  private aspirantPortal = inject(AspirantPortalService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly currentUser = this.authService.currentUser;

  readonly isAspirant = computed(() => this.currentUser()?.role === 'aspirant' || this.permissions.hasRole('aspirant'));
  readonly isAspirantProfilePending = computed(() => {
    if (this.aspirantPortal.isProfileComplete()) return false;
    if (this.currentUser()?.isProfileComplete === true) return false;
    return true;
  });

  readonly isExistingUser = computed(() => this.permissions.hasRole('existing_user'));
  readonly isDeptAdmin = computed(() => this.permissions.hasRole('dept_admin'));
  readonly isSuperAdmin = computed(() => this.permissions.hasRole('super_admin'));

  readonly isProfilePending = computed(() => {
    if (this.aspirantPortal.isProfileComplete()) return false;
    if (this.currentUser()?.isProfileComplete === true) return false;
    return this.permissions.hasRole('new_user') || this.currentUser()?.isProfileComplete === false;
  });

  readonly isMasterOpen = signal<boolean>(true);
  readonly isUserManagementOpen = signal<boolean>(true);

  // Links of each role come from sidebar-nav.config.ts.
  protected readonly aspirantNav = ASPIRANT_NAV;
  protected readonly deptAdminNav = DEPT_ADMIN_NAV;
  protected readonly existingUserNav = EXISTING_USER_NAV;
  protected readonly newUserNav = NEW_USER_NAV;
  protected readonly eoiConfigurationNav = EOI_CONFIGURATION_NAV;
  protected readonly adminToolNav = ADMIN_TOOL_NAV;
  protected readonly exactMatch = EXACT_MATCH;
  protected readonly defaultMatch = DEFAULT_MATCH;

  protected readonly masterSection = {
    label: 'Master',
    icon: MASTER_ICON,
    items: MASTER_NAV,
    open: this.isMasterOpen,
    toggle: () => this.toggleMaster()
  };

  protected readonly userManagementSection = {
    label: 'User Management',
    icon: USER_MANAGEMENT_ICON,
    items: USER_MANAGEMENT_NAV,
    open: this.isUserManagementOpen,
    toggle: () => this.toggleUserManagement()
  };

  readonly currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e: NavigationEnd) => {
        this.currentUrl.set(e.urlAfterRedirects || e.url);
      });
  }

  private cleanUrl(): string {
    const raw = this.currentUrl() || this.router.url || '';
    return raw.split('?')[0].split('#')[0];
  }

  readonly activeKey = computed<string>(() => {
    const url = this.cleanUrl();

    // 0. Aspirant Portal routes
    if (url === '/training-calendar' || url.startsWith('/training-calendar')) {
      return 'training-calendar';
    }
    if (url === '/expressed-interest' || url.startsWith('/expressed-interest')) {
      return 'expressed-interest';
    }

    // 1. Profile / Registration / OTR / Dashboard
    if (
      url === '/profile' ||
      url.startsWith('/profile/') ||
      url === '/registration' ||
      url.startsWith('/registration/') ||
      url === '/otr' ||
      url.startsWith('/otr/') ||
      url === '/dashboard'
    ) {
      return 'profile';
    }

    // 2. Active Schemes / EOI Scheme form
    if (
      url === '/scheme-form' ||
      url.startsWith('/scheme-form/') ||
      url === '/tenders' ||
      url.startsWith('/tenders/') ||
      url.startsWith('/eoi')
    ) {
      return 'active-schemes';
    }

    // 3. Tender Status
    if (url === '/tender-status' || url.startsWith('/tender-status/')) {
      return 'tender-status';
    }

    // IPA (department admin): list, approved TPs and the IPA editor
    if (url.startsWith('/admin/ipa')) {
      return 'dept-ipa';
    }

    // MoU draft opens from the Sanction Order list, so keep that item highlighted
    if (url.startsWith('/admin/mou-draft')) {
      return 'dept-sanction-orders';
    }

    // 4. Sanction Order
    if (url.includes('sanction-order')) {
      return this.isDeptAdmin() ? 'dept-sanction-orders' : 'sanction-order';
    }

    // 5. IPA
    if (url === '/ipa' || url.startsWith('/ipa/') || url === '/tp/ipa' || url.startsWith('/tp/ipa/')) {
      return 'ipa';
    }

    // 6. SDC Management / Approvals
    if (url.startsWith('/sdc')) {
      return this.isDeptAdmin() ? 'dept-sdc' : 'sdc-management';
    }

    // 7. Batch Management / Approvals
    if (url.startsWith('/batches') || url.includes('batch-approval') || url.includes('batch-detail')) {
      return this.isDeptAdmin() ? 'dept-batch-approvals' : 'batch-management';
    }

    // 8. Aspirants Management
    if (url.startsWith('/aspirants') || url.startsWith('/tp/aspirants')) {
      return 'aspirants-management';
    }

    // 9. Grievance
    if (url.includes('grievance')) {
      return this.isDeptAdmin() ? 'dept-grievance' : 'grievance';
    }

    // 10. Payment History
    if (
      url === '/payment-history' ||
      url.startsWith('/payment-history/') ||
      url.startsWith('/history') ||
      url.startsWith('/transactions')
    ) {
      return 'payment-history';
    }

    // 10. Super Admin routes
    if (url.startsWith('/admin/eoi-configuration')) {
      return 'admin-eoi-configuration';
    }
    if (url.startsWith('/admin/master/eoi-category')) {
      return 'admin-master-eoi-category';
    }
    if (url.startsWith('/admin/master/scheme')) {
      return 'admin-master-scheme';
    }
    if (url.startsWith('/admin/master/sector')) {
      return 'admin-master-sector';
    }
    if (url.startsWith('/admin/master/course')) {
      return 'admin-master-course';
    }
    if (url.startsWith('/admin/master/district-block')) {
      return 'admin-master-district-block';
    }
    if (url.startsWith('/admin/master/designation')) {
      return 'admin-master-designation';
    }
    if (url.startsWith('/admin/master/permission')) {
      return 'admin-master-permission';
    }
    if (url.startsWith('/admin/master/user-role')) {
      return 'admin-master-user-role';
    }
    if (url.startsWith('/admin/two-step-verification')) {
      return 'admin-two-step-verification';
    }
    if (url.startsWith('/admin/dynamic-form-builder')) {
      return 'admin-dynamic-form-builder';
    }
    // Remaining master pages (doc, remark, grading ...) highlight themselves via routerLinkActive,
    // so they must not fall through to the "EOI Configuration" default below.
    if (url.startsWith('/admin/master')) {
      return 'admin-master';
    }
    if (url.startsWith('/admin/user-management')) {
      return 'admin-user-management';
    }

    // 11. Dept Admin routes
    if (url.startsWith('/admin/eoi-view') || url.startsWith('/admin/responses') || url.startsWith('/admin/review')) {
      return 'dept-eoi-view';
    }
    if (url.startsWith('/admin/camera-monitoring')) {
      return 'dept-camera-monitoring';
    }

    // GUARANTEED FALLBACK: At least one sidebar item is ALWAYS active at all times!
    if (this.isSuperAdmin()) {
      return 'admin-eoi-configuration';
    }
    if (this.isDeptAdmin()) {
      return 'dept-eoi-view';
    }
    if (this.isAspirant()) {
      return 'training-calendar';
    }
    return 'active-schemes';
  });

  isActive(key: string): boolean {
    return this.activeKey() === key;
  }

  readonly isProfileActive = computed(() => this.isActive('profile'));

  @Output() linkClicked = new EventEmitter<void>();
  @Output() closeMobileNav = new EventEmitter<void>();

  toggleMaster(): void {
    this.isMasterOpen.update((v: boolean) => !v);
  }

  toggleUserManagement(): void {
    this.isUserManagementOpen.update((v: boolean) => !v);
  }

  onNavClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      this.linkClicked.emit();
    }
  }
}
