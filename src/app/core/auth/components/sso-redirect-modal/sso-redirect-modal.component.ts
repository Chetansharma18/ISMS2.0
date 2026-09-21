import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sso-redirect-title"
    >
      <div
        class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-center p-6 sm:p-7"
      >
        <!-- Top Theme Brand Accent Line -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B3558] via-[#EA580C] to-[#0B3558]"></div>

        <!-- Center Spinner with Official Emblem -->
        <div class="relative mx-auto mt-2 mb-4 w-16 h-16 flex items-center justify-center">
          <!-- Dual-color spinning border -->
          <div class="absolute inset-0 rounded-full border-3 border-slate-200 border-t-[#0B3558] border-r-[#EA580C] animate-spin"></div>
          
          <!-- Emblem Icon Container -->
          <div class="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shadow-2xs">
            <img
              src="/Rajasthan-Sarkar.png"
              alt="Government of Rajasthan Emblem"
              class="w-full h-full object-contain select-none"
              onerror="this.src='/emblem-new.png'"
            />
          </div>
        </div>

        <!-- Clear, Simple Redirect Message -->
        <h3 id="sso-redirect-title" class="text-base sm:text-lg font-extrabold text-[#0B3558] tracking-tight">
          Redirecting to SSO Login Screen...
        </h3>
        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Please wait while we connect you to the Rajasthan Single Sign-On (SSO) authentication portal.
        </p>

        <!-- Subtle Animated Activity Indicator -->
        <div class="flex items-center justify-center gap-1.5 mt-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#0B3558] animate-bounce [animation-delay:-0.3s]"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-bounce [animation-delay:-0.15s]"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-[#0B3558] animate-bounce"></span>
        </div>

      </div>
    </div>
  `
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private timerId: any = null;

  ngOnInit(): void {
    // Smooth transition delay to allow user to clearly see the redirect message
    this.timerId = setTimeout(() => {
      this.authService.proceedToSsoLogin();
    }, 1200);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}
