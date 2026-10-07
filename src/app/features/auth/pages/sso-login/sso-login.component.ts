import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserRole, USER_ROLES } from '../../../../core/auth/auth.service';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import { DeptAdminOtpModalComponent } from '../../../../core/auth/components/dept-admin-otp-modal/dept-admin-otp-modal.component';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DeptAdminOtpModalComponent],
  host: {
    class: 'block w-full min-h-full flex flex-col bg-white'
  },
  template: `
    <div class="w-full min-h-full flex flex-col justify-between bg-white text-slate-800 font-sans selection:bg-[#131862] selection:text-white">
      
      <!-- Top Notice Banner -->
      <div class="bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2 text-center shrink-0">
        <div class="max-w-8xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm md:text-[15px] font-semibold text-amber-900">
          <span>
            <strong class="font-bold">PROTOTYPE NOTICE:</strong> This is a dummy login screen for testing and demonstration purposes. It will be replaced by the official Rajasthan SSO (sso.rajasthan.gov.in) portal integration.
          </span>
        </div>
      </div>

      <!-- Main Two-Column Layout (Generous spacing between left & right, direct-on-screen right form) -->
      <main class="flex-1 w-full flex items-center justify-center px-4 sm:px-8 lg:px-16 py-4 sm:py-6">
        <div class="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-24 xl:gap-32 items-center">
          
          <!-- Left Column: Official Statistics (G2G, G2C/G2B, IDENTITIES) with enlarged typography -->
          <div class="space-y-6 lg:space-y-8">
            
            <!-- G2G APPS -->
            <div>
              <div class="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#131862] tracking-tight leading-none mb-3">
                G2G APPS
              </div>
              <div class="inline-block px-4.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-lg sm:text-xl font-bold text-slate-800 shadow-2xs">
                421
              </div>
              <div class="w-full h-px bg-slate-200 mt-6"></div>
            </div>

            <!-- G2C/ G2B APPS -->
            <div>
              <div class="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#131862] tracking-tight leading-none mb-3">
                G2C/ G2B APPS
              </div>
              <div class="inline-block px-4.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-lg sm:text-xl font-bold text-slate-800 shadow-2xs">
                263
              </div>
              <div class="w-full h-px bg-slate-200 mt-6"></div>
            </div>

            <!-- IDENTITIES -->
            <div>
              <div class="text-3xl sm:text-4xl lg:text-[44px] font-black text-[#131862] tracking-tight leading-none mb-3">
                IDENTITIES
              </div>
              <div class="inline-block px-4.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-lg sm:text-xl font-bold text-slate-800 shadow-2xs">
                34, 204, 388
              </div>
            </div>

          </div>

          <!-- Right Column: Rajasthan SSO Login Form (Direct on screen, NO CARD) -->
          <div class="w-full max-w-[460px] mx-auto lg:mx-0">
            
            <!-- Direct Title Heading -->
            <div class="pb-3 border-b-2 border-slate-200 mb-5">
              <div class="text-base sm:text-lg lg:text-xl font-black text-[#131862] uppercase tracking-wider">
                RAJASTHAN SSO LOGIN - SIGN IN
              </div>
            </div>

            <!-- Direct Form Body -->
            <form (ngSubmit)="handleLogin()" class="space-y-4">
              
              <!-- Email ID / SSOID Field (Underline style) -->
              <div>
                <label for="emailOrSsoIdInput" class="block text-sm sm:text-[14.5px] font-bold text-slate-700 mb-1">
                  SSOID / Email ID
                </label>
                <input
                  id="emailOrSsoIdInput"
                  name="emailOrSsoId"
                  type="text"
                  [(ngModel)]="emailOrSsoId"
                  placeholder="Enter SSOID or Email ID"
                  class="sso-input w-full border-b-2 border-slate-300 py-2 text-base sm:text-lg text-slate-900 focus:outline-none transition-colors bg-transparent font-medium"
                  required
                />
              </div>

              <!-- Password Field (Underline style) -->
              <div>
                <label for="passwordInput" class="block text-sm sm:text-[14.5px] font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  id="passwordInput"
                  name="password"
                  type="password"
                  [(ngModel)]="password"
                  placeholder="Enter Password"
                  class="sso-input w-full border-b-2 border-slate-300 py-2 text-base sm:text-lg text-slate-800 tracking-widest focus:outline-none transition-colors bg-transparent"
                  required
                />
              </div>

              <!-- Captcha Row (Security Verification) -->
              <div>
                <label class="block text-sm sm:text-[14.5px] font-bold text-slate-700 mb-1.5">
                  Security Verification
                </label>
                <div class="flex items-center gap-3">
                  <!-- Dotted pattern captcha display -->
                  <div
                    class="px-4 py-2 border border-slate-300 bg-slate-100 rounded-md select-none font-mono text-base sm:text-lg font-black text-slate-800 tracking-[0.25em] flex items-center justify-center min-w-[120px]"
                    style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 6px 6px;"
                    aria-label="Captcha code"
                  >
                    {{ captchaCode() }}
                  </div>

                  <!-- Captcha Input Box -->
                  <input
                    name="enteredCaptcha"
                    type="text"
                    [(ngModel)]="enteredCaptcha"
                    placeholder="Captcha"
                    class="sso-input w-32 sm:w-36 px-3 py-2 border border-slate-300 rounded-md text-sm sm:text-base font-semibold text-slate-800 focus:outline-none"
                    required
                  />

                  <!-- Refresh captcha icon -->
                  <button
                    type="button"
                    (click)="refreshCaptcha()"
                    class="p-2 text-[#131862] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title="Refresh Captcha"
                    aria-label="Refresh Captcha"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Role Selector Toolbar (Positioned below Security Verification) -->
              <div class="pt-3 border-t border-slate-200">
                <span class="block text-xs sm:text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Test Persona Role:
                </span>
                <div class="grid grid-cols-2 gap-2">
                  @for (r of availableRoles; track r.role) {
                    <button
                      type="button"
                      (click)="selectRole(r.role)"
                      class="px-3 py-2 rounded-md text-xs sm:text-sm font-bold border transition-all text-left flex items-center justify-between cursor-pointer"
                      [class.bg-[#0B3558]]="selectedRole() === r.role"
                      [class.text-white]="selectedRole() === r.role"
                      [class.border-[#0B3558]]="selectedRole() === r.role"
                      [class.bg-slate-50]="selectedRole() !== r.role"
                      [class.text-slate-700]="selectedRole() !== r.role"
                      [class.border-slate-300]="selectedRole() !== r.role"
                      [class.hover:bg-slate-100]="selectedRole() !== r.role"
                    >
                      <span class="truncate">{{ r.label }}</span>
                      @if (selectedRole() === r.role) {
                        <span class="text-xs font-bold">&check;</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Submit Button: Verify & Continue -->
              <div class="pt-2">
                <button
                  type="submit"
                  [disabled]="isLoading()"
                  class="w-full bg-[#0B3558] hover:bg-[#07233B] text-white font-bold text-sm sm:text-base py-3 px-5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  @if (isLoading()) {
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying with RajSSO...</span>
                  } @else {
                    <span>Verify &amp; Continue &rarr;</span>
                  }
                </button>
              </div>

            </form>

          </div>

        </div>
      </main>

      <!-- Bottom Spacer to keep layout balanced without scrolling -->
      <div class="shrink-0 h-2"></div>

      <!-- Department Admin 6-Digit OTP Modal -->
      <app-dept-admin-otp-modal
        [isOpen]="showDeptAdminOtp()"
        [ssoId]="emailOrSsoId"
        (verified)="onDeptAdminOtpVerified($event)"
        (cancelled)="onDeptAdminOtpCancelled()"
      ></app-dept-admin-otp-modal>

    </div>
  `,
  styles: [`
    .sso-input:focus {
      border-color: #131862 !important;
    }
  `]
})
export class SsoLoginComponent {
  private authService = inject(AuthService);
  private otrFormService = inject(OtrFormService);
  private router = inject(Router);

  readonly availableRoles = USER_ROLES;
  selectedRole = signal<UserRole>('new_user');

  emailOrSsoId = 'new_user';
  password = '••••••••••••';
  enteredCaptcha = '313198';
  captchaCode = signal<string>('3 1 3 1 9 8');
  isLoading = signal<boolean>(false);
  showDeptAdminOtp = signal<boolean>(false);

  selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.emailOrSsoId = role;
  }

  refreshCaptcha(): void {
    const d1 = Math.floor(1 + Math.random() * 9);
    const d2 = Math.floor(1 + Math.random() * 9);
    const d3 = Math.floor(1 + Math.random() * 9);
    const d4 = Math.floor(1 + Math.random() * 9);
    const d5 = Math.floor(1 + Math.random() * 9);
    const d6 = Math.floor(1 + Math.random() * 9);
    const formatted = `${d1} ${d2} ${d3} ${d4} ${d5} ${d6}`;
    this.captchaCode.set(formatted);
    this.enteredCaptcha = `${d1}${d2}${d3}${d4}${d5}${d6}`;
  }

  handleLogin(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      const identifier = this.emailOrSsoId.trim() || 'new_user';
      const role = this.selectedRole();

      if (role === 'dept_admin') {
        // Department Admin requires 6-digit OTP verification first
        this.showDeptAdminOtp.set(true);
        return;
      }

      // Seed prefilled data for existing_user or clean draft for new_user
      if (role === 'existing_user') {
        this.otrFormService.loadExistingUserData();
      } else if (role === 'new_user') {
        this.otrFormService.resetToInitialDraft();
      }

      // Authenticate user session
      this.authService.loginWithCredentials(identifier, role, null);

      // Reset the dismissed flag upon fresh login so the OTR prompt triggers
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('isms_otr_prompt_dismissed');
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('isms_eoi_prompt_shown_new_user');
      }

      if (role === 'super_admin') {
        // Super Admin navigates directly to EOI Configuration / Masters
        this.router.navigate(['/admin/eoi-configuration']);
      } else {
        // Directly show tenders with fromLogin query param
        this.router.navigate(['/tenders'], { queryParams: { fromLogin: 'true' } });
      }
    }, 600);
  }

  onDeptAdminOtpVerified(otp: string): void {
    this.showDeptAdminOtp.set(false);
    const identifier = this.emailOrSsoId.trim() || 'dept_admin';
    this.authService.loginWithCredentials(identifier, 'dept_admin', null);
    this.authService.setDeptAdminOtpVerified(true);
    this.router.navigate(['/admin/eoi-view']);
  }

  onDeptAdminOtpCancelled(): void {
    this.showDeptAdminOtp.set(false);
    this.isLoading.set(false);
  }
}
