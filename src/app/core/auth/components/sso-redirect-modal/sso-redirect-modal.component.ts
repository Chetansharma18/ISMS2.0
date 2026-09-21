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
    <!-- Blurred Background Overlay (Active throughout) -->
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sso-redirect-title"
    >
      <!-- STEP 1: First Show ONLY The WHITE Loader on Blurred Screen -->
      @if (stage() === 'loader') {
        <div class="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200">
          <div class="loader"></div>
        </div>
      }

      <!-- STEP 2: Then Show The Modern White-Blue Redirect Message (No Logos) -->
      @if (stage() === 'message') {
        <div
          class="relative w-full max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 px-6 py-7 sm:p-8 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
        >
          <!-- Top Blue & Orange Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#0B3558] via-[#EA580C] to-[#0B3558] rounded-t-2xl"></div>

          <!-- Status Tag -->
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/70 text-[#0B3558] text-[11px] font-bold tracking-wider uppercase mb-3 select-none">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Secure Gateway
          </div>

          <!-- Modern Elegant Heading -->
          <h3 id="sso-redirect-title" class="text-lg sm:text-xl font-black text-[#0B3558] tracking-tight m-0">
            Redirecting to SSO Login
          </h3>

          <!-- Subtext -->
          <p class="text-xs sm:text-[13px] text-slate-500 mt-2 leading-relaxed m-0 max-w-[280px]">
            Please wait while we connect your session to Rajasthan Single Sign-On...
          </p>

          <!-- Smooth Progress Line -->
          <div class="w-full bg-slate-100 h-1 mt-5 rounded-full overflow-hidden">
            <div class="h-full bg-linear-to-r from-[#0B3558] to-[#EA580C] rounded-full animate-pulse"></div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .loader {
      width: 54px;
      aspect-ratio: 1;
      display: grid;
      border-radius: 50%;
      background:
        linear-gradient(0deg, rgb(255 255 255 / 50%) 30%, #0000 0 70%, rgb(255 255 255 / 100%) 0) 50%/8% 100%,
        linear-gradient(90deg, rgb(255 255 255 / 25%) 30%, #0000 0 70%, rgb(255 255 255 / 75%) 0) 50%/100% 8%;
      background-repeat: no-repeat;
      animation: l23 1s infinite steps(12);
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
    }
    .loader::before,
    .loader::after {
      content: "";
      grid-area: 1/1;
      border-radius: 50%;
      background: inherit;
      opacity: 0.915;
      transform: rotate(30deg);
    }
    .loader::after {
      opacity: 0.83;
      transform: rotate(60deg);
    }
    @keyframes l23 {
      100% {
        transform: rotate(1turn);
      }
    }
  `]
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);

  readonly stage = signal<'loader' | 'message'>('loader');

  private timerStage1: any = null;
  private timerStage2: any = null;

  ngOnInit(): void {
    // Step 1: Show only the glowing white loader on blurred background for ~850ms
    this.timerStage1 = setTimeout(() => {
      // Step 2: Show the modern white-blue redirect message card
      this.stage.set('message');

      // Step 3: Complete redirect after message is viewed (~950ms)
      this.timerStage2 = setTimeout(() => {
        this.authService.proceedToSsoLogin();
      }, 950);
    }, 850);
  }

  ngOnDestroy(): void {
    if (this.timerStage1) clearTimeout(this.timerStage1);
    if (this.timerStage2) clearTimeout(this.timerStage2);
  }
}
