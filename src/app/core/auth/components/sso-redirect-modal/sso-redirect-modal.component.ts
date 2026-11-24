import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, USER_ROLES, UserRole, RoleConfig } from '../../auth.service';
import { OtrFormService } from '../../../../features/registration/services/otr-form.service';
import { AspirantPortalService } from '../../../../features/aspirant/services/aspirant-portal.service';
import { StorageService } from '../../../services/storage.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { IconName } from '../../../../shared/components/icon/icons';

@Component({
  selector: 'app-sso-redirect-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ModalComponent, ButtonComponent, IconComponent],
  host: {
    class: 'block'
  },
  template: `
    <app-modal
      title="Select User Role"
      subtitle="Choose a role persona to sign in to the portal"
      size="lg"
      (close)="onClose()"
    >
      <div class="space-y-3">
        @for (r of roles; track r.role) {
          <div
            (click)="selectRole(r.role)"
            class="group p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-primary/60 hover:bg-slate-50/80 cursor-pointer transition-all duration-150 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs"
            role="button"
            tabindex="0"
            (keydown.enter)="selectRole(r.role)"
            (keydown.space)="selectRole(r.role); $event.preventDefault()"
          >
            <div class="flex items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
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

      <ng-container modalFooter>
        <button appButton variant="outline" size="sm" (click)="onClose()">
          <span>Cancel</span>
        </button>
      </ng-container>
    </app-modal>
  `
})
export class SsoRedirectModalComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private otrFormService = inject(OtrFormService);
  private aspirantPortal = inject(AspirantPortalService);
  private storage = inject(StorageService);

  readonly roles: RoleConfig[] = USER_ROLES;

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

  selectRole(role: UserRole): void {
    const identifier = role === 'aspirant' ? 'aspirant_user' : role;

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

    if (role === 'dept_admin') {
      this.authService.setDeptAdminOtpVerified(true);
    }

    // Authenticate user session
    this.authService.loginWithCredentials(identifier, role, null);
    this.authService.closeSsoRedirect();

    if (role === 'super_admin') {
      this.router.navigate(['/admin/eoi-configuration']);
    } else if (role === 'dept_admin') {
      this.router.navigate(['/admin/eoi-view']);
    } else if (role === 'aspirant') {
      this.storage.removeSessionItem('isms_aspirant_prompt_dismissed');
      this.router.navigate(['/training-calendar'], { queryParams: { fromLogin: 'true' } });
    } else {
      this.storage.removeSessionItem('isms_otr_prompt_dismissed');
      this.storage.removeItem('isms_eoi_prompt_shown_new_user');
      this.router.navigate(['/tenders'], { queryParams: { fromLogin: 'true' } });
    }
  }

  onClose(): void {
    this.authService.closeSsoRedirect();
  }
}
