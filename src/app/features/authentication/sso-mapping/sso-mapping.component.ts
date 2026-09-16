import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { EoiStateService } from '../../../core/services/eoi-state.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sso-mapping',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-['Poppins',sans-serif] text-slate-800 antialiased">
      
      <!-- Top Brand Header Bar matching Landing Page Navbar -->
      <header class="w-full bg-[#f0f6fc] border-b border-slate-200/80 font-['Poppins',sans-serif] shadow-2xs select-none">
        <div class="max-w-[1400px] mx-auto py-2 sm:py-2.5 lg:py-3 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          <!-- Left Branding Group: Emblems + Divider + ISMS (Far Left) -->
          <div class="flex items-center gap-1.5 sm:gap-3.5 lg:gap-4 min-w-0 cursor-pointer" routerLink="/">
            <!-- Official Ashoka Lion Capital (State Emblem of India) -->
            <div class="flex-shrink-0 flex items-center justify-center">
              <img src="emblem.png" alt="State Emblem of India" class="h-9 sm:h-[52px] lg:h-[68px] w-auto object-contain select-none" />
            </div>

            <!-- Official RSLDC Circular Emblem -->
            <div class="flex-shrink-0 flex items-center justify-center">
              <img src="rsldc-logo.png" alt="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)" class="h-9 w-9 sm:h-[52px] sm:w-[52px] lg:h-[68px] lg:w-[68px] object-contain select-none drop-shadow-2xs" />
            </div>

            <!-- Thin Vertical Divider Line -->
            <div class="h-7 sm:h-10 lg:h-12 w-[1.5px] bg-slate-300 mx-0.5 sm:mx-2 lg:mx-2.5 shrink-0"></div>

            <!-- System Branding: ISMS in Navy, 2.0 in Orange/Amber -->
            <div class="flex text-left flex-col justify-center shrink-0">
              <div class="flex items-baseline leading-none">
                <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#092244] tracking-tight">ISMS</span>
                <span class="text-lg sm:text-2xl lg:text-[27px] font-extrabold text-[#f59e0b] ml-1">2.0</span>
              </div>
              <div class="hidden sm:block text-[10.5px] sm:text-[11.5px] lg:text-[12px] text-slate-600 font-medium tracking-tight mt-0.5 sm:mt-1">
                Integrated Scheme Management System
              </div>
            </div>
          </div>

          <!-- Right Header: SSO Email Linking in blue box -->
          <div class="flex items-center shrink-0">
            <div class="px-2.5 py-1 sm:px-4 sm:py-2 bg-[#002244] text-white text-[11px] sm:text-sm font-bold rounded-lg shadow-xs tracking-tight border border-[#001730] flex items-center gap-1.5 whitespace-nowrap">
              <span>SSO Email Linking</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Back Button on the far left below the header -->
      <div class="max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <a routerLink="/auth/login" class="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#092244] hover:text-amber-600 transition-colors cursor-pointer group">
          <svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Back</span>
        </a>
      </div>

      <!-- Main Clean Container -->
      <main class="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
        <div class="w-full max-w-lg bg-white rounded-xl border border-slate-200/90 shadow-md overflow-hidden">
          
          <!-- Card Header (#002244) -->
          <div class="bg-[#002244] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#f59e0b]">
            <h2 class="text-base font-bold tracking-wide">
              SSO Email Linking
            </h2>
          </div>

          <!-- Form Body -->
          <form [formGroup]="mappingForm" (ngSubmit)="onConfirmMapping()" class="p-6 sm:p-8 space-y-5">
            
            <!-- SSO ID (Pre-filled & Locked / Cannot change) -->
            <div class="space-y-1.5 font-['Poppins',sans-serif]">
              <label class="block text-xs font-semibold text-[#092244]">
                SSO ID
              </label>
              <div class="relative flex items-center">
                <input 
                  type="text" 
                  [value]="currentSsoId" 
                  disabled 
                  readonly 
                  class="w-full pl-3.5 pr-20 py-2.5 text-sm bg-slate-100/90 border border-slate-300 rounded-lg font-['Poppins',sans-serif] font-medium text-slate-800 cursor-not-allowed select-none"
                />
                <span class="absolute right-3 inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-200/80 px-2 py-0.5 rounded font-['Poppins',sans-serif]">
                  <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                  <span>Locked</span>
                </span>
              </div>
              <p class="text-[11px] text-slate-500 font-['Poppins',sans-serif]">Auto-fetched from Rajasthan SSO authentication. Non-editable.</p>
            </div>

            <!-- Single Email Input to Map by SSO ID -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-[#092244]">
                Official Communication Email ID <span class="text-red-600">*</span>
              </label>
              <input 
                type="email" 
                formControlName="email"
                placeholder="Enter official email (e.g. director@company.in)"
                class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-[#092244] focus:ring-2 focus:ring-[#092244]/15 focus:outline-none text-slate-900 transition-colors"
              />
              <div *ngIf="mappingForm.get('email')?.touched && mappingForm.get('email')?.invalid" class="text-[11px] text-red-600 font-medium">
                Please enter a valid email address.
              </div>
              <p *ngIf="!mappingForm.get('email')?.invalid" class="text-[11px] text-slate-500">
                This email will be bound to your SSO ID for all ISMS notifications & e-Signatures.
              </p>
            </div>

            <!-- Action Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                [disabled]="isSubmitting"
                class="w-full py-2.5 bg-[#002244] hover:bg-[#001730] text-white font-bold text-sm tracking-wide rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                <span *ngIf="isSubmitting">Linking Email & Initializing...</span>
                <span *ngIf="!isSubmitting">Proceed to Profile Registration →</span>
              </button>
            </div>

          </form>

        </div>
      </main>

    </div>
  `
})
export class SsoMappingComponent implements OnInit {
  mappingForm!: FormGroup;
  currentSsoId: string = 'applicant_rj';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private eoiService: EoiStateService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const profile = this.eoiService.getProfile();
    this.currentSsoId = profile.ssoId || 'applicant_rj';

    this.mappingForm = this.fb.group({
      email: [profile.personal?.email || '', [Validators.required, Validators.email]]
    });
  }

  onConfirmMapping(): void {
    if (this.mappingForm.invalid) {
      this.mappingForm.markAllAsTouched();
      return;
    }

    const email = this.mappingForm.value.email;
    this.isSubmitting = true;

    // Update profile in state service with mapped SSO ID and new email
    const current = this.eoiService.getProfile();
    this.eoiService.updateProfile({
      ssoId: this.currentSsoId,
      personal: {
        ...current.personal,
        email: email
      }
    });

    setTimeout(() => {
      this.isSubmitting = false;
      const sso = this.currentSsoId.toLowerCase();

      if (sso.includes('new') || sso.includes('citizen') || sso.includes('reg') || sso.includes('fresh')) {
        this.eoiService.resetToNewCitizen(this.currentSsoId);
        const updated = this.eoiService.getProfile();
        this.eoiService.updateProfile({
          personal: { ...updated.personal, email: email }
        });
        this.router.navigate(['/auth/register']);
      } else if (sso.includes('tp') || sso.includes('partner') || sso.includes('grade')) {
        this.eoiService.resetToApprovedTp('A', this.currentSsoId);
        const updated = this.eoiService.getProfile();
        this.eoiService.updateProfile({
          personal: { ...updated.personal, email: email }
        });
        this.router.navigate(['/eoi/dashboard']);
      } else {
        this.eoiService.resetToRegisteredApplicant(this.currentSsoId);
        const updated = this.eoiService.getProfile();
        this.eoiService.updateProfile({
          personal: { ...updated.personal, email: email }
        });
        
        // Log into ISMS 2.0 and route to the new dashboard
        this.authService.login('applicant_rj').subscribe(() => {
          this.router.navigate(['/dashboard']);
        });
      }
    }, 400);
  }
}
