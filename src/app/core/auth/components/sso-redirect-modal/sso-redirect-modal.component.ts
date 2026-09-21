import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sso-redirect-modal',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block'
  },
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sso-redirect-title"
    >
      <div
        class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-center p-6 sm:p-8"
      >
        <!-- Top Theme Brand Ribbon -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B3558] via-[#EA580C] to-[#0B3558]"></div>

        <!-- Rajasthan Emblem with Soft Ambient Glow -->
        <div class="relative mx-auto mt-2 mb-4 w-20 h-20 flex items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-orange-100/60 blur-md animate-pulse"></div>
          <div class="relative w-16 h-16 rounded-full bg-slate-50 border border-slate-200 shadow-2xs flex items-center justify-center p-2">
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan Emblem"
              class="w-full h-full object-contain select-none"
              onerror="this.src='/emblem-new.png'"
            />
          </div>
        </div>

        <!-- Title & Subtitle -->
        <h3 id="sso-redirect-title" class="text-xl font-extrabold text-[#0B3558] tracking-tight">
          Redirecting to Raj-SSO
        </h3>
        <p class="text-xs font-bold text-[#EA580C] mt-0.5 tracking-wide">
          Rajasthan Single Sign-On Portal
        </p>

        <p class="text-xs text-slate-500 mt-2.5 leading-relaxed px-3">
          Securing your connection to <strong class="text-slate-800">sso.rajasthan.gov.in</strong> for unified citizen and partner authentication.
        </p>

        <!-- Dynamic Animated Progress Bar & State -->
        <div class="mt-6 mb-2">
          <div class="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5 px-1">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#EA580C] animate-ping"></span>
              Establishing secure handshake...
            </span>
            <span class="font-mono text-slate-700 font-bold">{{ progress() }}%</span>
          </div>

          <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              class="h-full bg-gradient-to-r from-[#0B3558] to-[#EA580C] transition-all duration-100 ease-out rounded-full"
              [style.width.%]="progress()"
            ></div>
          </div>
        </div>

        <!-- Security & Compliance Badges -->
        <div class="flex items-center justify-center gap-3 mt-4 text-[11px] text-slate-500">
          <span class="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-medium">
            <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
            </svg>
            256-Bit SSL Encrypted
          </span>
          <span class="text-slate-300">&bull;</span>
          <span class="text-slate-500">DoIT&C Compliant</span>
        </div>

        <!-- Action Controls -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 rounded-md border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-slate-400 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            (click)="onProceedNow()"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#0B3558] hover:bg-[#07233B] text-white text-xs font-semibold shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-[#0B3558] cursor-pointer"
          >
            <span>Proceed Now</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  `
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);

  progress = signal<number>(0);
  private timerId: any = null;

  ngOnInit(): void {
    const intervalMs = 35;
    const step = 2.5;

    this.timerId = setInterval(() => {
      this.progress.update(prev => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(this.timerId);
          setTimeout(() => {
            this.authService.proceedToSsoLogin();
          }, 150);
          return 100;
        }
        return next;
      });
    }, intervalMs);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  onCancel(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.authService.closeSsoRedirect();
  }

  onProceedNow(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.authService.proceedToSsoLogin();
  }
}
