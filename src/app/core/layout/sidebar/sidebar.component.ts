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
  HELP_SUPPORT_NAV,
  MASTER_ICON,
  MASTER_NAV,
  NavItem,
  NEW_USER_NAV,
  PRIVACY_POLICY_NAV,
  TERMS_AND_CONDITIONS_NAV,
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
      class="relative shrink-0 text-white border-r border-[#4A0626] h-full flex flex-col select-none overflow-hidden font-sans w-57 max-w-full"
      style="background: linear-gradient(180deg, #5E0832 0%, #7C0E44 50%, #4A0626 100%);"
      (click)="onNavClick($event)"
      aria-label="Portal Navigation Sidebar"
    >
      <!-- Mobile Sidebar Close Header (Visible only < md) -->
      <div class="md:hidden shrink-0 flex items-center justify-between px-3.5 py-3 border-b border-white/10 bg-black/10 z-20">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm text-white">ISMS <span class="text-[#F2DACE]">2.0</span></span>
          <span class="text-[11px] text-white/70 font-medium">Menu</span>
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

      <!-- Scrollable Nav Container: menu scrolls smoothly behind the fixed bottom fort -->
      <div class="flex-1 min-h-0 overflow-y-auto flex flex-col relative z-0">
        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-2.5 py-3 pb-32" aria-label="Main Navigation">
          @if (isAspirant()) {
            @for (item of aspirantNav; track item.key) {
              <ng-container *ngTemplateOutlet="navLink; context: { $implicit: item, pending: item.key === 'profile' && isAspirantProfilePending() }" />
            }
          } @else if (isSuperAdmin()) {
            <ng-container *ngTemplateOutlet="navLink; context: { $implicit: eoiConfigurationNav }" />

            @for (item of adminToolNav; track item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="!bg-[#F2DACE] !text-[#7C0E44] font-bold shadow-xs active-link"
                #adminRla="routerLinkActive"
                [routerLinkActiveOptions]="defaultMatch"
                [style.color]="adminRla.isActive ? '#7C0E44' : '#FFFFFF'"
                class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] leading-5 text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
              >
                <app-icon
                  [name]="item.icon"
                  [class.!text-[#7C0E44]]="adminRla.isActive"
                  [class.text-white/80]="!adminRla.isActive"
                  [class.group-hover:text-white]="!adminRla.isActive"
                  [style.color]="adminRla.isActive ? '#7C0E44' : '#FFFFFF'"
                />
                <span
                  class="tracking-tight"
                  [class.!text-[#7C0E44]]="adminRla.isActive"
                  [style.color]="adminRla.isActive ? '#7C0E44' : '#FFFFFF'"
                >{{ item.label }}</span>
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

      <!-- Bottom: Fixed Rajasthan Fort Heritage Illustration with Smooth Gradient Mask -->
      <div
        class="pointer-events-none absolute bottom-0 left-0 right-0 z-10 w-full flex flex-col justify-end items-center overflow-hidden"
        style="height: 120px; background: linear-gradient(to top, rgba(74, 6, 38, 1) 0%, rgba(74, 6, 38, 0.96) 40%, rgba(74, 6, 38, 0.7) 70%, rgba(74, 6, 38, 0) 100%);"
      >
        <img
          src="/sidebar-fort-transparent.png?v=3"
          alt="Rajasthan Heritage"
          class="w-full h-28 object-bottom select-none opacity-90"
        />
      </div>

    </aside>

    <!-- One link: icon, label and (for Profile) the "Pending" badge -->
    <ng-template #navLink let-item let-pending="pending">
      <a
        [routerLink]="item.link"
        [class.!bg-[#F2DACE]]="isActive(item.key)"
        [class.!text-[#7C0E44]]="isActive(item.key)"
        [class.font-bold]="isActive(item.key)"
        [class.shadow-xs]="isActive(item.key)"
        [class.active-link]="isActive(item.key)"
        [style.color]="isActive(item.key) ? '#7C0E44' : '#FFFFFF'"
        class="flex items-center justify-between px-3 py-2 rounded-lg text-[13px] leading-5 text-white/90 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <app-icon
            [name]="item.icon"
            [stroke]="item.stroke ?? 1.75"
            class="transition-colors"
            [class.!text-[#7C0E44]]="isActive(item.key)"
            [class.text-white/80]="!isActive(item.key)"
            [class.group-hover:text-white]="!isActive(item.key)"
            [style.color]="isActive(item.key) ? '#7C0E44' : '#FFFFFF'"
          />
          <span
            class="tracking-tight min-w-0"
            [class.font-medium]="item.bold"
            [class.!text-[#7C0E44]]="isActive(item.key)"
            [style.color]="isActive(item.key) ? '#7C0E44' : '#FFFFFF'"
          >{{ item.label }}</span>
        </div>
        @if (pending) {
          <span
            class="px-2 py-0.5 rounded-full text-[11px] leading-tight shrink-0 inline-flex items-center gap-1.5 transition-all select-none font-semibold shadow-2xs"
            [class.bg-white/90]="isActive(item.key)"
            [class.text-[#B85B18]]="isActive(item.key)"
            [class.border]="isActive(item.key)"
            [class.border-[#B85B18]/30]="isActive(item.key)"
            [class.bg-white/20]="!isActive(item.key)"
            [class.text-white]="!isActive(item.key)"
            [class.border-white/30]="!isActive(item.key)"
          >
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
          class="justify-between h-auto px-3 py-2 rounded-lg text-[13px] leading-5 text-white/90 hover:bg-white/10 hover:text-white group"
        >
          <div class="flex items-center gap-2.5">
            <app-icon [name]="section.icon" class="text-white/80 group-hover:text-white transition-colors" />
            <span class="tracking-tight font-medium text-white">{{ section.label }}</span>
          </div>
          <app-icon
            name="chevron-down"
            size="sm"
            [stroke]="2"
            class="text-white/60 group-hover:text-white transition-transform duration-200"
            [ngClass]="{'transform rotate-180': section.open()}"
          />
        </button>

        @if (section.open()) {
          <div class="flex flex-col gap-0.5 pl-6 pr-1 pt-1 pb-1 transition-all duration-300">
            @for (sub of section.items; track sub.label) {
              <a
                [routerLink]="sub.link"
                [queryParams]="sub.query"
                routerLinkActive="!bg-[#F2DACE] !text-[#7C0E44] font-bold shadow-xs active-link"
                #subRla="routerLinkActive"
                [routerLinkActiveOptions]="sub.query ? exactMatch : defaultMatch"
                [style.color]="subRla.isActive ? '#7C0E44' : '#FFFFFF'"
                class="px-2.5 py-1.5 rounded-md text-[12px] text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full shrink-0" [ngClass]="subRla.isActive ? 'bg-[#7C0E44]' : 'bg-white/50'"></span>
                <span class="truncate" [class.!text-[#7C0E44]]="subRla.isActive" [style.color]="subRla.isActive ? '#7C0E44' : '#FFFFFF'">{{ sub.label }}</span>
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

  readonly currentUrl = signal<string>(
    this.router.url && this.router.url !== '/'
      ? this.router.url
      : (typeof window !== 'undefined' && window.location?.pathname && window.location.pathname !== '/'
          ? window.location.pathname
          : (this.router.url || ''))
  );

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
    const browserPath = typeof window !== 'undefined' ? window.location?.pathname : '';
    const raw = this.currentUrl() || this.router.url || browserPath || '';
    return raw.split('?')[0].split('#')[0];
  }

  readonly activeContextItem = computed<NavItem | null>(() => {
    const key = this.activeKey();
    if (key === 'terms-and-conditions') {
      return TERMS_AND_CONDITIONS_NAV;
    }
    if (key === 'help-support') {
      return HELP_SUPPORT_NAV;
    }
    if (key === 'privacy-policy') {
      return PRIVACY_POLICY_NAV;
    }
    return null;
  });

  readonly activeKey = computed<string>(() => {
    const url = this.cleanUrl();

    // Legal & Support routes
    if (url === '/terms-and-conditions' || url.startsWith('/terms-and-conditions/')) {
      return 'terms-and-conditions';
    }
    if (url === '/help-support' || url.startsWith('/help-support/')) {
      return 'help-support';
    }
    if (url === '/privacy-policy' || url.startsWith('/privacy-policy/')) {
      return 'privacy-policy';
    }

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
      if (this.isSuperAdmin() && this.currentUrl().includes('dynamic-form-builder')) {
        return 'admin-dynamic-form-builder';
      }
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
      if (this.isSuperAdmin() && this.currentUrl().includes('dynamic-form-builder')) {
        return 'admin-dynamic-form-builder';
      }
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

    // MoU Management (department admin): list, upload and MoU draft
    if (url.startsWith('/admin/mou') || url.startsWith('/mou')) {
      return 'dept-mou';
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

    // 8a. Attendance
    if (url.startsWith('/attendance')) {
      return 'attendance';
    }

    // 8b. User Management of the training partner
    if (url.startsWith('/tp/users')) {
      return 'tp-users';
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
