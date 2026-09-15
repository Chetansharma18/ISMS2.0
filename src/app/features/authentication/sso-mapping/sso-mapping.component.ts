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
    <div class="min-h-screen flex flex-col bg-[#F4F7F9] font-sans text-slate-800 antialiased">
      
      <!-- Top Rajasthan SSO Header Bar -->
      <header class="bg-gradient-to-r from-[#131A4D] via-[#18205C] to-[#1D246B] text-white px-4 sm:px-8 py-3 border-b-[3px] border-[#E67E22] shadow-md">
        <div class="max-w-5xl mx-auto flex justify-between items-center">
          
          <!-- State Logo & Branding -->
          <div class="flex items-center gap-3.5 cursor-pointer" routerLink="/">
            <div class="flex items-center justify-center flex-shrink-0">
              <img src="ashok.png" alt="Emblem of India" class="h-10 w-auto max-w-[40px] object-contain brightness-0 invert drop-shadow-xs" />
            </div>
            <div class="w-px h-8 bg-white/20 hidden sm:block"></div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-semibold text-[#F8B471]">राजस्थान सरकार</span>
                <span class="text-[11px] text-white/80">Government of Rajasthan</span>
              </div>
              <h1 class="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                Rajasthan Single Sign On (SSO)
              </h1>
              <div class="text-[10px] text-slate-300 font-light">
                ISMS 2.0 Account & SSO ID Mapping Desk
              </div>
            </div>
          </div>

          <a routerLink="/auth/login" class="text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded border border-white/20 transition-colors">
            ← Switch SSO ID
          </a>

        </div>
      </header>

      <!-- Main Clean Container -->
      <main class="flex-grow flex items-center justify-center px-4 py-12">
        <div class="w-full max-w-lg bg-white border border-slate-200 shadow-md">
          
          <!-- Government Window Header (#131A4D) -->
          <div class="bg-[#131A4D] text-white px-6 py-3.5 flex items-center justify-between border-b-2 border-[#E67E22]">
            <h2 class="text-base font-bold tracking-wide">
              One-Time SSO ID to Email Mapping
            </h2>
            <span class="text-xs text-blue-200 font-mono">
              New Applicant
            </span>
          </div>

          <!-- Simple Form Body -->
          <form [formGroup]="mappingForm" (ngSubmit)="onConfirmMapping()" class="p-6 sm:p-8 space-y-5">
            
            <!-- SSO ID (Pre-filled & Locked / Cannot change) -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-[#131A4D]">
                Rajasthan SSO ID
              </label>
              <div class="relative">
                <input 
                  type="text" 
                  [value]="currentSsoId" 
                  disabled 
                  readonly 
                  class="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-300 font-mono font-bold text-[#131A4D] cursor-not-allowed select-none"
                />
                <span class="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">🔒 Locked</span>
              </div>
              <p class="text-[10px] text-slate-500">Auto-fetched from Rajasthan SSO authentication. Non-editable.</p>
            </div>

            <!-- Single Email Input to Map by SSO ID -->
            <div class="space-y-1">
              <label class="block text-xs font-bold text-[#131A4D]">
                Official Communication Email ID <span class="text-red-600">*</span>
              </label>
              <input 
                type="email" 
                formControlName="email"
                placeholder="Enter official email (e.g. director@company.in)"
                class="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-[#131A4D] focus:ring-1 focus:ring-[#131A4D] focus:outline-none text-slate-900 transition-colors"
              />
              <div *ngIf="mappingForm.get('email')?.touched && mappingForm.get('email')?.invalid" class="text-[11px] text-red-600 font-medium">
                Please enter a valid email address.
              </div>
              <p *ngIf="!mappingForm.get('email')?.invalid" class="text-[10px] text-slate-500">
                This email will be bound to your SSO ID for all ISMS notifications & e-Signatures.
              </p>
            </div>

            <!-- Action Submit Button -->
            <div class="pt-2">
              <button 
                type="submit" 
                [disabled]="isSubmitting"
                class="w-full py-2.5 bg-[#131A4D] hover:bg-[#1D246B] text-white font-bold text-sm tracking-wide transition-colors shadow-xs flex items-center justify-center gap-2">
                <span *ngIf="isSubmitting">Mapping Email & Initializing...</span>
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
        this.router.navigate(['/schemes']);
      }
    }, 400);
  }
}
