import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { EoiStateService } from '../../../core/services/eoi-state.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sso-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-white font-sans text-slate-800 antialiased selection:bg-[#131A4D] selection:text-white">
      
      <!-- Top Rajasthan Single Sign On Header Bar -->
      <header class="bg-gradient-to-r from-[#131A4D] via-[#18205C] to-[#1D246B] text-white px-4 sm:px-8 py-3 border-b-[3px] border-[#E67E22] shadow-md">
        <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <!-- State Logo & Branding -->
          <div class="flex items-center gap-3.5 cursor-pointer" routerLink="/">
            <div class="flex items-center justify-center flex-shrink-0">
              <img src="ashok.png" alt="Emblem of India" class="h-11 w-auto max-w-[44px] object-contain brightness-0 invert drop-shadow-xs" />
            </div>

            <div class="w-px h-9 bg-white/20 hidden sm:block"></div>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-semibold text-[#F8B471]">राजस्थान सरकार</span>
                <span class="text-[11px] text-white/80">Government of Rajasthan</span>
              </div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white leading-none">
                  Rajasthan Single Sign On
                </h1>
                <span class="text-[10px] bg-white/10 text-slate-200 border border-white/20 px-1.5 py-0.5 rounded font-mono">
                  v46.5
                </span>
              </div>
              <div class="text-xs text-slate-300 font-light mt-0.5">
                One Digital Identity for all Applications · Integrated Scheme Management System (ISMS 2.0)
              </div>
            </div>
          </div>

          <!-- Right: Language Switcher & Public Portal Link -->
          <div class="flex items-center gap-4 text-xs">
            <a routerLink="/" class="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded border border-white/20 transition-colors">
              ← Public Portal
            </a>
            <span class="text-white/30">|</span>
            <div class="flex items-center gap-1.5 font-medium">
              <span class="text-[#F8B471] font-bold cursor-pointer">English</span>
              <span class="text-white/40">|</span>
              <span class="text-slate-300 hover:text-white cursor-pointer">हिन्दी</span>
            </div>
          </div>

        </div>
      </header>

      <!-- Main Two-Column Layout -->
      <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <!-- Left Column: SSO Statistics & Services -->
          <div class="lg:col-span-7 space-y-8 pt-2">
            
            <!-- Block 1: G2G APPS -->
            <div class="space-y-3 pb-6 border-b-2 border-[#131A4D]">
              <h2 class="text-3xl sm:text-4xl font-extrabold text-[#131A4D] tracking-tight">
                G2G APPS
              </h2>
              <div class="inline-block bg-[#eef2f6] text-slate-800 text-lg font-bold px-4 py-1 rounded shadow-xs font-mono">
                421
              </div>
            </div>

            <!-- Block 2: G2C / G2B APPS -->
            <div class="space-y-3 pb-6 border-b-2 border-[#131A4D]">
              <h2 class="text-3xl sm:text-4xl font-extrabold text-[#131A4D] tracking-tight">
                G2C/ G2B APPS
              </h2>
              <div class="inline-block bg-[#eef2f6] text-slate-800 text-lg font-bold px-4 py-1 rounded shadow-xs font-mono">
                263
              </div>
            </div>

            <!-- Block 3: IDENTITIES -->
            <div class="space-y-3">
              <h2 class="text-3xl sm:text-4xl font-extrabold text-[#131A4D] tracking-tight">
                IDENTITIES
              </h2>
              <div class="inline-block bg-[#eef2f6] text-slate-800 text-lg font-bold px-4 py-1 rounded shadow-xs font-mono">
                34,204,388
              </div>
            </div>

          </div>

          <!-- Right Column: Login Card & Form -->
          <div class="lg:col-span-5 bg-white border border-slate-200 shadow-sm">
            
            <!-- Top Header: SSO Login Only -->
            <div class="border-b border-slate-200 py-3.5 px-6 bg-slate-50/70 flex items-center justify-between">
              <h2 class="text-sm font-bold text-[#131A4D] uppercase tracking-wide">
                Rajasthan SSO Login · Sign In
              </h2>
              <span class="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                v46.5
              </span>
            </div>

            <div class="p-6 sm:p-8 space-y-6">
              
              <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-5">
                
                <!-- Field 1: Digital Identity (SSOID/ Username/ Email/ Mobile) -->
                <div class="space-y-1">
                  <input 
                    type="text" 
                    formControlName="ssoId"
                    placeholder="Digital Identity (SSOID / Username / Mobile)"
                    class="w-full py-2.5 px-1 text-sm bg-transparent border-b border-slate-300 focus:border-[#131A4D] focus:outline-none placeholder-slate-400 text-slate-800 transition-colors font-['Poppins',sans-serif] font-medium"
                  />
                  <div *ngIf="loginForm.get('ssoId')?.touched && loginForm.get('ssoId')?.invalid" class="text-[11px] text-red-600 pt-0.5">
                    Please enter your SSOID / Username
                  </div>
                </div>

                <!-- Field 2: Password -->
                <div class="space-y-1">
                  <input 
                    type="password" 
                    formControlName="password"
                    placeholder="Password"
                    class="w-full py-2.5 px-1 text-sm bg-transparent border-b border-slate-300 focus:border-[#131A4D] focus:outline-none placeholder-slate-400 text-slate-800 transition-colors"
                  />
                  <div *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.invalid" class="text-[11px] text-red-600 pt-0.5">
                    Please enter your password
                  </div>
                </div>

                <!-- Field 3: Captcha Box -->
                <div class="flex items-center gap-3 pt-2">
                  <div class="relative bg-slate-100 border border-slate-300 px-3 py-1.5 flex items-center justify-center select-none overflow-hidden rounded-xs w-36 h-10">
                    <div class="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:6px_6px]"></div>
                    
                    <div class="flex items-center gap-1.5 font-bold font-mono tracking-wider text-lg text-slate-800">
                      <span *ngFor="let digit of captchaDigits; let i = index" 
                            [style.transform]="'rotate(' + getDigitRotation(i) + 'deg) scale(' + getDigitScale(i) + ')'"
                            [style.color]="getDigitColor(i)"
                            class="inline-block transition-transform duration-200">
                        {{ digit }}
                      </span>
                    </div>
                  </div>

                  <div class="flex-grow">
                    <input 
                      type="text" 
                      formControlName="captchaInput"
                      placeholder="Enter Captcha"
                      class="w-full py-1.5 px-2.5 text-xs border border-slate-300 focus:border-[#131A4D] focus:outline-none bg-white text-slate-800 font-mono"
                    />
                  </div>

                  <div class="flex items-center gap-1.5 text-slate-600">
                    <button 
                      type="button" 
                      (click)="speakCaptcha()"
                      title="Audio Captcha"
                      class="p-1 hover:text-[#131A4D] transition-colors text-sm">
                      🔊
                    </button>
                    <button 
                      type="button" 
                      (click)="refreshCaptcha()"
                      title="Refresh Captcha"
                      class="p-1 hover:text-[#131A4D] transition-colors text-base font-bold">
                      🔄
                    </button>
                  </div>
                </div>

                <div *ngIf="captchaError" class="text-[11px] text-red-600 font-medium">
                  {{ captchaError }}
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                  <button 
                    type="submit" 
                    [disabled]="isLoading"
                    class="w-full py-2.5 bg-[#131A4D] hover:bg-[#1D246B] text-white font-bold text-sm tracking-wide transition-colors shadow-xs flex items-center justify-center gap-2">
                    <span *ngIf="isLoading">Authenticating Rajasthan SSO Session...</span>
                    <span *ngIf="!isLoading">Verify & Continue →</span>
                  </button>
                </div>

              </form>

              <!-- OR Separator -->
              <div class="relative flex items-center justify-center my-4">
                <div class="border-t border-slate-300 w-full"></div>
                <span class="bg-white px-3 text-xs text-slate-500 font-semibold uppercase absolute">
                  OR
                </span>
              </div>

              <!-- Login with Meri Pehchaan -->
              <div class="text-center">
                <button 
                  type="button"
                  (click)="loginWithMeriPehchaan()"
                  class="inline-flex items-center border border-[#004b87] bg-[#004b87] text-white text-xs font-semibold px-4 py-1.5 rounded hover:bg-[#003660] transition-colors shadow-xs">
                  <span class="font-bold text-[11px] mr-1.5 uppercase">Login With</span>
                  <span class="bg-[#d9222a] text-white px-1 py-0.5 text-[10px] font-bold rounded-xs mr-1">Meri</span>
                  <span class="font-bold text-white mr-1.5">Pehchaan</span>
                  <span class="text-[9px] opacity-80 border-l border-white/40 pl-1.5">e-Pramaan</span>
                </button>
              </div>

              <!-- Quick Test Personas Picker -->
              <div class="pt-4 border-t border-dashed border-slate-200">
                <div class="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Test User Personas:</span>
                  <span class="text-[10px] font-normal text-slate-400">Click to autofill & login</span>
                </div>
                
                <div class="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button 
                    type="button"
                    (click)="fillAndSubmitPersona('citizen')"
                    class="p-2 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-700 text-left transition-colors">
                    <div class="font-bold text-slate-900">1. new_citizen_rj</div>
                    <div class="text-[9px] text-amber-700 mt-0.5">New User (OTR Skippable)</div>
                  </button>

                  <button 
                    type="button"
                    (click)="fillAndSubmitPersona('applicant')"
                    class="p-2 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 text-left transition-colors">
                    <div class="font-bold text-slate-900">2. applicant_rj</div>
                    <div class="text-[9px] text-blue-700 mt-0.5">Approved TP (SDC Flow)</div>
                  </button>

                  <button 
                    type="button"
                    (click)="fillAndSubmitPersona('dept')"
                    class="p-2 bg-slate-50 hover:bg-cyan-50 hover:border-cyan-300 border border-slate-200 text-slate-700 text-left transition-colors">
                    <div class="font-bold text-cyan-900">3. dept_admin_rj</div>
                    <div class="text-[9px] text-cyan-700 mt-0.5">Dept. Scrutiny Admin</div>
                  </button>


                  <button 
                    type="button"
                    (click)="fillAndSubmitPersona('super')"
                    class="p-2 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 text-slate-700 text-left transition-colors">
                    <div class="font-bold text-purple-900">4. super_admin_rj</div>
                    <div class="text-[9px] text-purple-700 mt-0.5">Master Control</div>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

    </div>
  `
})
export class SsoLoginComponent implements OnInit {
  loginForm!: FormGroup;
  captchaDigits: string[] = [];
  captchaCode: string = '';
  captchaError: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshCaptcha();
    this.loginForm = this.fb.group({
      ssoId: ['applicant_rj', Validators.required],
      password: ['Rajasthan@2026', Validators.required],
      captchaInput: [this.captchaCode, Validators.required]
    });
  }

  refreshCaptcha(): void {
    const digits: string[] = [];
    for (let i = 0; i < 6; i++) {
      digits.push(Math.floor(Math.random() * 10).toString());
    }
    this.captchaDigits = digits;
    this.captchaCode = digits.join('');
    this.captchaError = '';
    
    if (this.loginForm) {
      this.loginForm.patchValue({ captchaInput: this.captchaCode });
    }
  }

  getDigitRotation(index: number): number {
    const rotations = [-8, 6, -4, 8, -6, 4];
    return rotations[index % rotations.length];
  }

  getDigitScale(index: number): number {
    const scales = [1.1, 0.95, 1.15, 1.0, 1.2, 0.9];
    return scales[index % scales.length];
  }

  getDigitColor(index: number): string {
    const colors = ['#131A4D', '#1D246B', '#0f172a', '#334155', '#1e293b', '#18205C'];
    return colors[index % colors.length];
  }

  speakCaptcha(): void {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(this.captchaDigits.join(' '));
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Captcha is: ${this.captchaCode}`);
    }
  }

  fillAndSubmitPersona(type: 'citizen' | 'applicant' | 'dept' | 'super'): void {
    if (type === 'citizen') {
      this.loginForm.patchValue({ ssoId: 'new_citizen_rj', password: 'Password@123', captchaInput: this.captchaCode });
    } else if (type === 'applicant') {
      this.loginForm.patchValue({ ssoId: 'applicant_rj', password: 'Password@123', captchaInput: this.captchaCode });
    } else if (type === 'dept') {
      this.loginForm.patchValue({ ssoId: 'dept_admin_rj', password: 'Password@123', captchaInput: this.captchaCode });
    } else {
      this.loginForm.patchValue({ ssoId: 'super_admin_rj', password: 'Password@123', captchaInput: this.captchaCode });
    }
    this.onLogin();
  }

  loginWithMeriPehchaan(): void {
    this.fillAndSubmitPersona('applicant');
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const val = this.loginForm.value;
    const inputCaptcha = (val.captchaInput || '').trim();

    if (inputCaptcha !== this.captchaCode) {
      this.captchaError = 'Invalid Captcha code entered. Please try again.';
      this.refreshCaptcha();
      return;
    }

    this.isLoading = true;
    this.captchaError = '';

    setTimeout(() => {
      this.isLoading = false;
      const rawSsoId = (val.ssoId || 'applicant_rj').trim();
      const ssoLower = rawSsoId.toLowerCase();

      // New ISMS 2.0 Auth Flow (Bypass EOI legacy if using ISMS roles)
      if (ssoLower === 'tppia' || ssoLower === 'applicant_rj') {
        this.authService.login(ssoLower).subscribe(() => {
          this.eoiService.resetToApprovedTp('A', rawSsoId);
          this.router.navigate(['/dashboard']);
        });
        return;
      }

      // Legacy Branching by Role & User State
      if (ssoLower.includes('super') || ssoLower.includes('root') || ssoLower.includes('sysadmin')) {
        // Super Admin -> Dashboard
        this.authService.login('superadmin').subscribe();
        this.eoiService.resetToSuperAdmin(rawSsoId);
        this.router.navigate(['/admin']);
      } else if (ssoLower.includes('dept') || ssoLower.includes('officer') || ssoLower.includes('scrutiny')) {
        // Department Admin -> EOI View
        this.authService.login('deptadmin').subscribe();
        this.eoiService.resetToDeptAdmin(rawSsoId);
        this.router.navigate(['/admin/eoi-view']);
      } else if (ssoLower.includes('new') || ssoLower.includes('citizen') || ssoLower.includes('reg') || ssoLower.includes('fresh')) {
        // New User -> One-Time SSO ID to Email Mapping (/auth/sso-mapping)
        this.eoiService.resetToNewCitizen(rawSsoId);
        this.router.navigate(['/auth/sso-mapping']);
      } else {
        // Fallback for any other legacy roles
        this.eoiService.resetToRegisteredApplicant(rawSsoId);
        this.router.navigate(['/schemes']);
      }
    }, 500);
  }
}
