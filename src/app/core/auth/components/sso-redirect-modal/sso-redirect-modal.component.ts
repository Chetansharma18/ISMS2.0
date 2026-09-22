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
    <!-- Calmed Backdrop Overlay -->
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sso-redirect-title"
    >
      <!-- Modern GovTech Theme Card -->
      <div
        class="relative w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-center p-6 sm:p-7 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Top Navy Theme Strip -->
        <div class="absolute top-0 left-0 right-0 h-1.5 bg-[#0B3558]"></div>

        <!-- GovTech Shield Icon -->
        <div class="w-12 h-12 rounded-full bg-blue-50 text-[#0B3558] flex items-center justify-center mb-3 mt-1 border border-blue-100/80">
          <svg class="w-6 h-6 text-[#0B3558]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <!-- Official Heading -->
        <h3 id="sso-redirect-title" class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight m-0">
          Connecting to Rajasthan SSO
        </h3>

        <!-- Subtext -->
        <p class="text-xs text-slate-500 mt-1.5 leading-relaxed m-0 max-w-[280px]">
          Redirecting your session securely to Rajasthan Single Sign-On (sso.rajasthan.gov.in)...
        </p>

        <!-- Professional GovTech Navy Progress Bar -->
        <div class="w-full bg-slate-100 h-1.5 mt-5 rounded-full overflow-hidden">
          <div class="gov-progress-bar h-full bg-[#0B3558] rounded-full"></div>
        </div>

        <!-- Official Portal Subtext -->
        <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 mt-3 select-none">
          <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Government of Rajasthan · Secure Gateway</span>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .gov-progress-bar {
      width: 45%;
      animation: govIndeterminate 1.2s infinite ease-in-out;
    }
    @keyframes govIndeterminate {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(100%);
      }
      100% {
        transform: translateX(250%);
      }
    }
  `]
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private timerRedirect: any = null;

  ngOnInit(): void {
    // Smooth, professional 1.2s transition directly into Rajasthan SSO
    this.timerRedirect = setTimeout(() => {
      this.authService.proceedToSsoLogin();
    }, 1200);
  }

  ngOnDestroy(): void {
    if (this.timerRedirect) clearTimeout(this.timerRedirect);
  }
}
