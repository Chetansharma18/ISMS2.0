import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EoiStateService } from '../../../core/services/eoi-state.service';

export type UserRole = 'new_user' | 'existing_user' | 'dept_admin' | 'super_admin';

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
}

export const USER_ROLES: RoleConfig[] = [
  {
    role: 'new_user',
    label: 'New Applicant',
    badge: 'First Time User',
    description: 'First time applicant with incomplete OTR profile'
  },
  {
    role: 'existing_user',
    label: 'Existing Partner',
    badge: 'Registered TP/PIA',
    description: 'Registered agency with verified entity profile'
  },
  {
    role: 'dept_admin',
    label: 'Department Admin',
    badge: 'Officer Portal',
    description: 'Departmental scheme officer and scrutiny incharge'
  },
  {
    role: 'super_admin',
    label: 'Super Admin',
    badge: 'System Admin',
    description: 'State system master manager and portal controller'
  }
];
@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  host: {
    class: 'block w-full flex-1 min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-68px)] bg-white'
  },
  template: `
    <div class="w-full min-h-[calc(100vh-68px)] flex flex-col justify-between bg-white text-slate-800 font-sans selection:bg-[#131862] selection:text-white relative">
      
      <!-- Top Notice Banner -->
      <div class="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center shrink-0">
        <div class="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[13.5px] font-semibold text-amber-900">
          <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-200 text-amber-900 shrink-0 text-[10px] font-bold">
            !
          </span>
          <span>
            <strong>PROTOTYPE NOTICE:</strong> This is a dummy login screen for testing and demonstration purposes. It will be replaced by the official Rajasthan SSO (sso.rajasthan.gov.in) portal integration.
          </span>
        </div>
      </div>

      <!-- Main Two-Column Layout (Centered Perfectly in the Middle of Screen) -->
      <main class="flex-1 w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div class="max-w-[960px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          <!-- Left Column: Official Statistics (G2G, G2C/G2B, IDENTITIES) -->
          <div class="space-y-6">
            
            <!-- G2G APPS -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#131862] tracking-tight mb-2">
                G2G APPS
              </h2>
              <div class="inline-block px-3.5 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                421
              </div>
              <div class="w-full h-px bg-slate-300 mt-5"></div>
            </div>

            <!-- G2C/ G2B APPS -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#131862] tracking-tight mb-2">
                G2C/ G2B APPS
              </h2>
              <div class="inline-block px-3.5 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                263
              </div>
              <div class="w-full h-px bg-slate-300 mt-5"></div>
            </div>

            <!-- IDENTITIES -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#131862] tracking-tight mb-2">
                IDENTITIES
              </h2>
              <div class="inline-block px-3.5 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                34, 204, 388
              </div>
            </div>

          </div>

          <!-- Right Column: Rajasthan SSO Login Card -->
          <div class="w-full">
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full max-w-[450px] mx-auto lg:mx-0">
              
              <!-- Card Header -->
              <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  RAJASTHAN SSO LOGIN - SIGN IN
                </h3>
              </div>

              <!-- Card Body -->
              <form (ngSubmit)="handleLogin()" class="p-6 space-y-4">
                
                <!-- Role Selector Toolbar -->
                <div>
                  <span class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Select Test Persona Role:
                  </span>
                  <div class="grid grid-cols-2 gap-1.5">
                    @for (r of availableRoles; track r.role) {
                      <button
                        type="button"
                        (click)="selectRole(r.role)"
                        class="px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all text-left flex items-center justify-between cursor-pointer"
                        [class.bg-[#0B3558]]="selectedRole() === r.role"
                        [class.text-white]="selectedRole() === r.role"
                        [class.border-[#0B3558]]="selectedRole() === r.role"
                        [class.bg-slate-50]="selectedRole() !== r.role"
                        [class.text-slate-700]="selectedRole() !== r.role"
                        [class.border-slate-200]="selectedRole() !== r.role"
                        [class.hover:bg-slate-100]="selectedRole() !== r.role"
                      >
                        <span class="truncate">{{ r.label }}</span>
                        @if (selectedRole() === r.role) {
                          <span class="text-[10px] font-bold">&check;</span>
                        }
                      </button>
                    }
                  </div>
                </div>

                <!-- Email ID / SSOID Field (Underline style) -->
                <div>
                  <label for="emailOrSsoIdInput" class="block text-xs font-semibold text-slate-600 mb-1">
                    SSOID / Email ID
                  </label>
                  <input
                    id="emailOrSsoIdInput"
                    name="emailOrSsoId"
                    type="text"
                    [(ngModel)]="emailOrSsoId"
                    placeholder="SSOID or Email ID"
                    class="w-full border-b border-slate-300 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-[#131862] transition-colors bg-transparent font-medium"
                    required
                  />
                </div>

                <!-- Password Field (Underline style) -->
                <div>
                  <label for="passwordInput" class="block text-xs font-semibold text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    id="passwordInput"
                    name="password"
                    type="password"
                    [(ngModel)]="password"
                    placeholder="Password"
                    class="w-full border-b border-slate-300 py-1.5 text-sm text-slate-800 tracking-widest focus:outline-none focus:border-[#131862] transition-colors bg-transparent"
                    required
                  />
                </div>

                <!-- Captcha Row -->
                <div class="pt-1">
                  <label class="block text-xs font-semibold text-slate-600 mb-1">
                    Security Verification
                  </label>
                  <div class="flex items-center gap-2.5">
                    <!-- Dotted pattern captcha display -->
                    <div
                      class="px-3 py-1.5 border border-slate-300 bg-slate-100 rounded select-none font-mono text-sm sm:text-base font-extrabold text-slate-800 tracking-[0.25em] flex items-center justify-center min-w-[110px]"
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
                      class="w-28 px-2.5 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#131862]"
                      required
                    />

                    <!-- Refresh captcha icon -->
                    <button
                      type="button"
                      (click)="refreshCaptcha()"
                      class="p-1.5 text-[#131862] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Refresh Captcha"
                      aria-label="Refresh Captcha"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Submit Button: Verify & Continue -->
                <div class="pt-3">
                  <button
                    type="submit"
                    [disabled]="isLoading()"
                    class="w-full bg-[#0B3558] hover:bg-[#07233B] text-white font-bold text-sm py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
                  >
                    @if (isLoading()) {
                      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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

        </div>
      </main>

      <!-- Bottom Spacer to keep layout balanced -->
      <div class="h-6"></div>

      <!-- Post-SSO Login Choice Popup Modal (For new_user) -->
      @if (showPostLoginModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-left animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
          >
            <!-- Top Gradient Accent -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#0B3558] via-[#EA580C] to-[#0B3558]"></div>

            <!-- Success Badge -->
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-3 border border-emerald-200/60 select-none">
              <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              SSO Login Verified
            </div>

            <!-- Heading & Message -->
            <h2 class="text-xl sm:text-2xl font-black text-[#0B3558] tracking-tight">
              Welcome to ISMS 2.0 Portal
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              You are authenticated successfully as <strong>{{ emailOrSsoId }}</strong>. Please choose how you would like to proceed:
            </p>

            <!-- 2 Options Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              
              <!-- Option 1: Complete Registration -->
              <button
                type="button"
                (click)="selectOption('registration')"
                class="group text-left p-4 sm:p-5 rounded-xl border-2 border-slate-200 hover:border-[#0B3558] bg-slate-50/70 hover:bg-blue-50/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div class="w-10 h-10 rounded-lg bg-blue-100 text-[#0B3558] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#0B3558] transition-colors">
                    Complete Registration (OTR)
                  </h3>
                  <p class="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Fill or update your Training Partner / PIA profile details and submit your application.
                  </p>
                </div>
                <div class="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#0B3558] group-hover:text-[#EA580C] transition-colors">
                  <span>Open Form</span>
                  <span>&rarr;</span>
                </div>
              </button>

              <!-- Option 2: View Tenders -->
              <button
                type="button"
                (click)="selectOption('tenders')"
                class="group text-left p-4 sm:p-5 rounded-xl border-2 border-slate-200 hover:border-[#EA580C] bg-slate-50/70 hover:bg-orange-50/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div class="w-10 h-10 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 class="text-sm font-bold text-slate-900 group-hover:text-[#EA580C] transition-colors">
                    View Tenders & Schemes
                  </h3>
                  <p class="text-[11.5px] text-slate-500 mt-1.5 leading-relaxed">
                    Explore published tenders, Expressions of Interest (EOI), and active scheme notices.
                  </p>
                </div>
                <div class="mt-4 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-[#EA580C] group-hover:text-[#0B3558] transition-colors">
                  <span>View Tenders</span>
                  <span>&rarr;</span>
                </div>
              </button>

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class SsoLoginComponent {
  private authService = inject(AuthService);
  private eoiService = inject(EoiStateService);
  private router = inject(Router);

  readonly availableRoles = USER_ROLES;
  selectedRole = signal<UserRole>('new_user');

  emailOrSsoId = 'new_user';
  password = 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢';
  enteredCaptcha = '313198';
  captchaCode = signal<string>('3 1 3 1 9 8');
  isLoading = signal<boolean>(false);
  showPostLoginModal = signal<boolean>(false);

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

      if (role === 'new_user') {
        // Authenticate user session for new user
        this.eoiService.resetToNewCitizen(identifier);
        this.authService.login('new_citizen_rj').subscribe(() => {
          this.showPostLoginModal.set(true);
        });
      } else if (role === 'existing_user') {
        this.eoiService.resetToApprovedTp('A', identifier);
        this.authService.login('applicant_rj').subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      } else if (role === 'dept_admin') {
        this.eoiService.resetToDeptAdmin(identifier);
        this.authService.login('deptadmin').subscribe(() => {
          this.router.navigate(['/admin/eoi-view']);
        });
      } else if (role === 'super_admin') {
        this.eoiService.resetToSuperAdmin(identifier);
        this.authService.login('superadmin').subscribe(() => {
          this.router.navigate(['/admin']);
        });
      }
    }, 600);
  }

  selectOption(choice: 'registration' | 'tenders'): void {
    this.showPostLoginModal.set(false);
    if (choice === 'registration') {
      this.router.navigate(['/auth/register']);
    } else {
      this.router.navigate(['/schemes']);
    }
  }
}
