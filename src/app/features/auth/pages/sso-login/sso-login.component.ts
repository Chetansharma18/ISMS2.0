import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  host: {
    class: 'block w-full flex-1 min-h-[calc(100vh-60px)] md:min-h-[calc(100vh-68px)] bg-white'
  },
  template: `
    <div class="w-full min-h-[calc(100vh-68px)] flex flex-col justify-between bg-white text-slate-800 font-sans selection:bg-[#131862] selection:text-white">
      
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
            <div class="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden w-full max-w-[440px] mx-auto lg:mx-0">
              
              <!-- Card Header -->
              <div class="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  RAJASTHAN SSO LOGIN - SIGN IN
                </h3>
              </div>

              <!-- Card Body -->
              <form (ngSubmit)="handleLogin()" class="p-6 space-y-4">
                
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
                    class="w-full border-b border-slate-300 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-[#131862] transition-colors bg-transparent"
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
                    class="w-full bg-[#131862] hover:bg-[#0c1046] text-white font-bold text-sm py-2.5 px-4 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
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

    </div>
  `
})
export class SsoLoginComponent {
  private authService = inject(AuthService);

  emailOrSsoId = 'applicant_rj';
  password = '••••••••••••';
  enteredCaptcha = '313198';
  captchaCode = signal<string>('3 1 3 1 9 8');
  isLoading = signal<boolean>(false);

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
      const identifier = this.emailOrSsoId.trim() || 'applicant_rj';
      this.authService.loginWithCredentials(identifier);
    }, 600);
  }
}
