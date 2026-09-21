import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserPersona } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  host: {
    class: 'block min-h-screen bg-slate-50'
  },
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-[#F8FAFC] text-slate-800 font-sans">
      
      <!-- Top Government Bar (Dark Navy with Brand Orange Accent) -->
      <header class="w-full bg-[#0B1E36] text-white border-b-2 border-[#EA580C] px-4 sm:px-8 py-3">
        <div class="max-w-[1440px] mx-auto flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Government Emblem -->
            <img
              src="/footer-images/emblem-white.png"
              alt="Government Emblem"
              class="h-9 sm:h-10 w-auto object-contain select-none"
              onerror="this.src='/Rajasthan-Sarkar.png'"
            />
            <div class="border-l border-slate-700 pl-3">
              <h1 class="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                Rajasthan Single Sign On
              </h1>
              <p class="text-[11px] text-slate-300 font-normal">
                One Digital Identity for all Applications &bull; Integrated Scheme Management System (ISMS 2.0)
              </p>
            </div>
          </div>

          <!-- Return to Portal Link -->
          <a
            routerLink="/"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to ISMS 2.0</span>
          </a>
        </div>
      </header>

      <!-- Prominent Dummy / Prototype Notice Banner (Requested by User) -->
      <div class="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center shadow-2xs">
        <div class="max-w-5xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-900 shrink-0 text-[11px] font-bold">
            !
          </span>
          <span>
            <strong>PROTOTYPE NOTICE:</strong> This is a dummy login screen for testing and demonstration purposes. It will be replaced by the official Rajasthan SSO (sso.rajasthan.gov.in) portal integration.
          </span>
        </div>
      </div>

      <!-- Main Two-Column Layout (Matching User Screenshot) -->
      <main class="flex-1 max-w-[1300px] w-full mx-auto px-4 sm:px-8 py-8 sm:py-14 flex items-center">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 w-full items-start">
          
          <!-- Left Column: Official Statistics (G2G, G2C/G2B, IDENTITIES) -->
          <div class="lg:col-span-6 space-y-8 pt-2">
            
            <!-- G2G APPS -->
            <div>
              <h2 class="text-3xl font-extrabold text-[#0B1E36] tracking-tight mb-3">
                G2G APPS
              </h2>
              <div class="inline-block px-4 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                421
              </div>
              <div class="w-full h-px bg-slate-800 mt-5"></div>
            </div>

            <!-- G2C/ G2B APPS -->
            <div>
              <h2 class="text-3xl font-extrabold text-[#0B1E36] tracking-tight mb-3">
                G2C/ G2B APPS
              </h2>
              <div class="inline-block px-4 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                263
              </div>
              <div class="w-full h-px bg-slate-800 mt-5"></div>
            </div>

            <!-- IDENTITIES -->
            <div>
              <h2 class="text-3xl font-extrabold text-[#0B1E36] tracking-tight mb-3">
                IDENTITIES
              </h2>
              <div class="inline-block px-4 py-1 rounded bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 shadow-2xs">
                34, 204, 388
              </div>
            </div>

          </div>

          <!-- Right Column: Login Card & Quick Test Personas (Matching User Screenshot) -->
          <div class="lg:col-span-6">
            <div class="bg-white border border-slate-200 rounded-sm shadow-xs overflow-hidden">
              
              <!-- Card Header -->
              <div class="px-5 py-3 border-b border-slate-200 bg-slate-50/50">
                <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  RAJASTHAN SSO LOGIN - SIGN IN
                </h3>
              </div>

              <!-- Card Body -->
              <div class="p-6 sm:p-7 space-y-4">
                
                <!-- SSOID Field -->
                <div>
                  <input
                    type="text"
                    [(ngModel)]="ssoId"
                    placeholder="SSOID / Username"
                    class="w-full border-b border-slate-300 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#0B1E36] transition-colors"
                  />
                </div>

                <!-- Password Field -->
                <div>
                  <input
                    type="password"
                    [(ngModel)]="password"
                    placeholder="Password"
                    class="w-full border-b border-slate-300 py-2 text-sm text-slate-800 tracking-widest focus:outline-none focus:border-[#0B1E36] transition-colors"
                  />
                </div>

                <!-- Captcha Row (Matching Screenshot) -->
                <div class="flex items-center gap-3 pt-2">
                  <!-- Dotted pattern captcha display -->
                  <div
                    class="px-4 py-2 border border-slate-300 bg-slate-100 rounded select-none font-mono text-base font-extrabold text-slate-800 tracking-[0.3em] flex items-center justify-center min-w-[120px]"
                    style="background-image: radial-gradient(#94a3b8 1px, transparent 1px); background-size: 6px 6px;"
                  >
                    {{ captchaCode() }}
                  </div>

                  <!-- Captcha Input Box -->
                  <input
                    type="text"
                    [(ngModel)]="enteredCaptcha"
                    placeholder="Captcha"
                    class="w-28 px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#0B1E36]"
                  />

                  <!-- Audio icon -->
                  <button
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Audio Captcha"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>

                  <!-- Refresh captcha icon -->
                  <button
                    type="button"
                    (click)="refreshCaptcha()"
                    class="p-1.5 text-blue-500 hover:text-blue-700 transition-colors"
                    title="Refresh Captcha"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <!-- Submit Button: Verify & Continue -->
                <div class="pt-2">
                  <button
                    type="button"
                    (click)="handleLogin()"
                    [disabled]="isLoading()"
                    class="w-full bg-[#0B1E36] hover:bg-[#071526] text-white font-bold text-sm py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
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

                <!-- OR Divider -->
                <div class="relative flex py-2 items-center">
                  <div class="flex-grow border-t border-slate-200"></div>
                  <span class="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">OR</span>
                  <div class="flex-grow border-t border-slate-200"></div>
                </div>

                <!-- Quick Test User Personas Section (Exact Match to Screenshot) -->
                <div>
                  <div class="flex items-center justify-between text-[11px] mb-2.5">
                    <span class="font-bold text-slate-700">QUICK TEST USER PERSONAS:</span>
                    <span class="text-slate-400 font-semibold text-[10px]">CLICK TO AUTOFILL &amp; LOGIN</span>
                  </div>

                  <!-- 2x2 Grid of Personas -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    
                    <!-- 1. new_citizen_rj -->
                    <button
                      type="button"
                      (click)="selectPersona(personas[0])"
                      class="text-left p-2.5 rounded border transition-all cursor-pointer"
                      [class]="selectedPersonaId() === personas[0].id ? 'bg-blue-50/60 border-[#0B1E36]' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ personas[0].label }}</p>
                      <p class="text-[11px] font-medium text-amber-600 mt-0.5">{{ personas[0].subLabel }}</p>
                    </button>

                    <!-- 2. applicant_rj -->
                    <button
                      type="button"
                      (click)="selectPersona(personas[1])"
                      class="text-left p-2.5 rounded border transition-all cursor-pointer"
                      [class]="selectedPersonaId() === personas[1].id ? 'bg-blue-50/60 border-[#0B1E36]' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ personas[1].label }}</p>
                      <p class="text-[11px] font-medium text-blue-600 mt-0.5">{{ personas[1].subLabel }}</p>
                    </button>

                    <!-- 3. dept_admin_rj -->
                    <button
                      type="button"
                      (click)="selectPersona(personas[2])"
                      class="text-left p-2.5 rounded border transition-all cursor-pointer"
                      [class]="selectedPersonaId() === personas[2].id ? 'bg-blue-50/60 border-[#0B1E36]' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ personas[2].label }}</p>
                      <p class="text-[11px] font-medium text-teal-600 mt-0.5">{{ personas[2].subLabel }}</p>
                    </button>

                    <!-- 4. super_admin_rj -->
                    <button
                      type="button"
                      (click)="selectPersona(personas[3])"
                      class="text-left p-2.5 rounded border transition-all cursor-pointer"
                      [class]="selectedPersonaId() === personas[3].id ? 'bg-blue-50/60 border-[#0B1E36]' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'"
                    >
                      <p class="text-xs font-bold text-slate-800">{{ personas[3].label }}</p>
                      <p class="text-[11px] font-medium text-purple-600 mt-0.5">{{ personas[3].subLabel }}</p>
                    </button>

                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </main>

      <!-- Bottom Government Footer -->
      <footer class="w-full bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-400">
        <p>
          &copy; 2026 Department of Information Technology &amp; Communication (DoIT&amp;C), Government of Rajasthan.
        </p>
      </footer>

    </div>
  `
})
export class SsoLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  ssoId = 'applicant_rj';
  password = '••••••••••••';
  enteredCaptcha = '313198';
  captchaCode = signal<string>('3 1 3 1 9 8');
  selectedPersonaId = signal<string>('applicant_rj');
  isLoading = signal<boolean>(false);

  personas: UserPersona[] = [
    {
      id: 'new_citizen_rj',
      ssoId: 'new_citizen_rj',
      label: '1. new_citizen_rj',
      subLabel: 'New Applicant (OTR Form)',
      role: 'CITIZEN'
    },
    {
      id: 'applicant_rj',
      ssoId: 'applicant_rj',
      label: '2. applicant_rj',
      subLabel: 'Existing TP (Full Nav)',
      role: 'TRAINING_PARTNER'
    },
    {
      id: 'dept_admin_rj',
      ssoId: 'dept_admin_rj',
      label: '3. dept_admin_rj',
      subLabel: 'Dept. Scrutiny Admin',
      role: 'DEPT_ADMIN'
    },
    {
      id: 'super_admin_rj',
      ssoId: 'super_admin_rj',
      label: '4. super_admin_rj',
      subLabel: 'State Super Admin',
      role: 'SUPER_ADMIN'
    }
  ];

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

  selectPersona(persona: UserPersona): void {
    this.selectedPersonaId.set(persona.id);
    this.ssoId = persona.ssoId;
    this.password = '••••••••••••';
    this.enteredCaptcha = this.captchaCode().replace(/\s+/g, '');

    // Autofill and trigger login
    this.handleLogin();
  }

  handleLogin(): void {
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      const activePersona =
        this.personas.find((p) => p.id === this.selectedPersonaId()) ||
        this.personas[1];

      this.authService.login(activePersona);
    }, 600);
  }
}
