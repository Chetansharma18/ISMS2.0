// ui-guard-allow: page-frame - the login screen uses the auth layout, not the portal frame
import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole, USER_ROLES } from '../../../../core/auth/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import { AspirantPortalService } from '../../../aspirant/services/aspirant-portal.service';
import { DeptAdminOtpModalComponent } from '../../../../core/auth/components/dept-admin-otp-modal/dept-admin-otp-modal.component';
import { ButtonComponent, IconComponent, IconName } from '../../../../shared';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterModule, DeptAdminOtpModalComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full min-h-full flex flex-col bg-white'
  },
  template: `
    <div class="w-full min-h-full flex flex-col justify-between bg-white text-slate-800 font-sans">
      
      <!-- Main Content: Roles Selection Screen -->
      <main class="flex-1 w-full flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 bg-slate-50/50">
        <div class="max-w-xl w-full mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <app-icon name="user" size="lg" />
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Select User Role
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Choose a role persona to sign in and access the portal.
            </p>
          </div>

          <!-- Role Cards -->
          <div class="space-y-3">
            @for (r of availableRoles; track r.role) {
              <div
                (click)="selectAndLogin(r.role)"
                class="group p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
                [class]="selectedRole() === r.role ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-200 hover:border-primary/60 hover:bg-slate-50/80'"
                role="button"
                tabindex="0"
                (keydown.enter)="selectAndLogin(r.role)"
                (keydown.space)="selectAndLogin(r.role); $event.preventDefault()"
              >
                <div class="flex items-center gap-3.5 min-w-0">
                  <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    [class]="selectedRole() === r.role ? 'bg-primary text-white' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'"
                  >
                    <app-icon [name]="getRoleIcon(r.role)" size="md" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-slate-800 text-sm sm:text-base group-hover:text-primary transition-colors">
                        {{ r.label }}
                      </span>
                      <span class="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {{ r.badge }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {{ r.description }}
                    </p>
                  </div>
                </div>
                <div class="shrink-0 flex items-center text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                  <app-icon name="arrow-right" size="sm" />
                </div>
              </div>
            }
          </div>

          <!-- Bottom Footer Action -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-400">ISMS 2.0 Portal</span>
            <button
              appButton
              variant="primary"
              size="md"
              type="button"
              (click)="handleLogin()"
              [loading]="isLoading()"
            >
              <span>Sign in as {{ getRoleLabel(selectedRole()) }}</span>
              <app-icon name="arrow-right" size="xs" />
            </button>
          </div>

        </div>
      </main>

      <!-- Department Admin 6-Digit OTP Modal -->
      <app-dept-admin-otp-modal
        [isOpen]="showDeptAdminOtp()"
        [ssoId]="emailOrSsoId"
        (verified)="onDeptAdminOtpVerified($event)"
        (cancelled)="onDeptAdminOtpCancelled()"
      ></app-dept-admin-otp-modal>

    </div>
  `
})
export class SsoLoginComponent {
  private authService = inject(AuthService);
  private otrFormService = inject(OtrFormService);
  private aspirantPortal = inject(AspirantPortalService);
  private router = inject(Router);
  private storage = inject(StorageService);

  readonly availableRoles = USER_ROLES;
  selectedRole = signal<UserRole>('new_user');

  emailOrSsoId = 'new_user';
  isLoading = signal<boolean>(false);
  showDeptAdminOtp = signal<boolean>(false);

  getRoleIcon(role: UserRole): IconName {
    switch (role) {
      case 'new_user':
        return 'user';
      case 'existing_user':
        return 'briefcase';
      case 'dept_admin':
        return 'building';
      case 'super_admin':
        return 'shield-check';
      case 'aspirant':
        return 'academic-cap';
      default:
        return 'user';
    }
  }

  getRoleLabel(role: UserRole): string {
    return this.availableRoles.find(r => r.role === role)?.label || role;
  }

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.emailOrSsoId = role === 'aspirant' ? 'aspirant_user' : role;
  }

  selectAndLogin(role: UserRole): void {
    this.selectRole(role);
    this.executeLogin(role);
  }

  handleLogin(): void {
    const role = this.selectedRole();
    this.executeLogin(role);
  }

  private executeLogin(role: UserRole): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      const identifier = this.emailOrSsoId.trim() || (role === 'aspirant' ? 'aspirant_user' : 'new_user');

      if (role === 'dept_admin') {
        this.showDeptAdminOtp.set(true);
        return;
      }

      // Seed prefilled data for existing_user or clean draft for new_user / aspirant
      if (role === 'existing_user') {
        this.otrFormService.loadExistingUserData();
      } else if (role === 'new_user') {
        this.otrFormService.resetToInitialDraft();
      } else if (role === 'aspirant') {
        this.aspirantPortal.resetProfile();
        this.storage.removeItem('isms_aspirant_profile_complete');
        this.storage.removeItem('isms_aspirant_profile_data');
        this.storage.removeItem('isms_aspirant_expressed_interests');
        this.storage.removeSessionItem('isms_aspirant_prompt_dismissed');
      }

      // Authenticate user session
      this.authService.loginWithCredentials(identifier, role, null);

      if (role === 'super_admin') {
        this.router.navigate(['/admin/eoi-configuration']);
      } else if (role === 'aspirant') {
        this.storage.removeSessionItem('isms_aspirant_prompt_dismissed');
        this.router.navigate(['/training-calendar'], { queryParams: { fromLogin: 'true' } });
      } else {
        this.storage.removeSessionItem('isms_otr_prompt_dismissed');
        this.storage.removeItem('isms_eoi_prompt_shown_new_user');
        this.router.navigate(['/tenders'], { queryParams: { fromLogin: 'true' } });
      }
    }, 200);
  }

  onDeptAdminOtpVerified(otp: string): void {
    const identifier = this.emailOrSsoId.trim() || 'dept_admin';
    this.authService.loginWithCredentials(identifier, 'dept_admin', null);
    this.authService.setDeptAdminOtpVerified(true);
    this.router.navigate(['/admin/eoi-view']).then(() => {
      this.showDeptAdminOtp.set(false);
    });
  }

  onDeptAdminOtpCancelled(): void {
    this.showDeptAdminOtp.set(false);
    this.isLoading.set(false);
  }
}
