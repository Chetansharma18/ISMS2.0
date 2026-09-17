import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { EoiStateService } from '../../../core/services/eoi-state.service';

@Component({
  selector: 'app-sso-mapping',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-[#eef5fc] to-slate-200 font-['Poppins',sans-serif] text-slate-800 antialiased p-4 sm:p-8 select-none">
      
      <!-- Wrapper aligned with Pop-up width -->
      <div class="w-full max-w-2xl mx-auto flex flex-col items-start gap-2.5">
        
        <!-- Back Button directly on the top left above the pop-up -->
        <a routerLink="/auth/login" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#002244] font-bold text-xs border border-slate-300 shadow-2xs hover:shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer group" title="Back to Login">
          <svg class="w-4 h-4 text-[#002244] transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Back</span>
        </a>

        <!-- Centered Broad Modal Popup Card -->
        <main class="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_25px_60px_rgba(0,34,68,0.14)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Card Header (#002244 with Gold Accent Line) -->
          <div class="bg-[#002244] text-white px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between border-b-[3px] border-[#f59e0b]">
            <div class="flex items-center gap-3.5">
              <!-- Emblem & Title -->
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0">
                <img src="emblem-new.png" alt="State Emblem of India" class="h-7 sm:h-8 w-auto object-contain brightness-0 invert" />
              </div>
              <div>
                <h2 class="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight">
                  SSO Digital Identity & Email Linking
                </h2>
                <p class="text-[10.5px] sm:text-[11.5px] text-slate-300 font-normal mt-0.5">
                  Integrated Scheme Management System · ISMS 2.0
                </p>
              </div>
            </div>
          </div>

        <!-- Form Body -->
        <form [formGroup]="mappingForm" (ngSubmit)="onConfirmMapping()" class="p-6 sm:p-9 space-y-5 sm:space-y-6">
          
          <!-- Fields Container -->
          <div class="space-y-4 sm:space-y-5">
            
            <!-- SSO ID (Pre-filled) -->
            <div class="space-y-1.5">
              <label class="block text-xs sm:text-sm font-bold text-[#002244]">
                Authenticated Rajasthan SSO ID
              </label>
              <div class="relative flex items-center">
                <input 
                  type="text" 
                  [value]="currentSsoId" 
                  disabled 
                  readonly 
                  class="w-full px-3.5 py-2.5 sm:py-3 text-sm bg-slate-100/90 border border-slate-300 rounded-xl font-mono font-bold text-[#002244] cursor-not-allowed select-none shadow-2xs"
                />
              </div>
              <p class="text-[11px] text-slate-500">Auto-fetched from Rajasthan SSO authentication. Non-editable.</p>
            </div>

            <!-- Official Communication Email Input -->
            <div class="space-y-1.5">
              <label class="block text-xs sm:text-sm font-bold text-[#002244]">
                Official Communication Email ID <span class="text-red-600">*</span>
              </label>
              <div class="relative flex items-center">
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="Enter official email (e.g. director@company.in)"
                  class="w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm bg-white border border-slate-300 rounded-xl focus:border-[#002244] focus:ring-2 focus:ring-[#002244]/15 focus:outline-none text-slate-900 font-medium transition-all shadow-2xs"
                />
                <div class="absolute right-3.5 text-slate-400 pointer-events-none">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
              <div *ngIf="mappingForm.get('email')?.touched && mappingForm.get('email')?.invalid" class="text-xs text-red-600 font-semibold pt-0.5">
                Please enter a valid official email address.
              </div>
            </div>

          </div>

          <!-- Action Button Row -->
          <div class="pt-3 sm:pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              [disabled]="isSubmitting"
              class="w-full sm:w-auto px-7 py-2.5 sm:py-3 bg-[#002244] hover:bg-[#001730] text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98">
              <span *ngIf="isSubmitting">Linking Email & Initializing...</span>
              <span *ngIf="!isSubmitting">Proceed to Profile Registration →</span>
            </button>
          </div>

        </form>

        </main>

      </div>

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
    private router: Router
  ) { }

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
        this.router.navigate(['/schemes']);
      }
    }, 400);
  }
}
