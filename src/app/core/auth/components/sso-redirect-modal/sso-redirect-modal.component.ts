import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-sso-redirect-modal',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  host: {
    class: 'block'
  },
  template: `
    <!-- Fullscreen Blurred Backdrop Overlay (No Cards, No Popup Box) -->
    <div
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 select-none font-sans"
      style="backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background-color: rgba(11, 23, 42, 0.55);"
      role="status"
      aria-live="polite"
      aria-label="Redirecting SSO Login Screen"
    >
      <!-- Center Content: Only Loader Spinner and Bottom Text -->
      <div class="flex flex-col items-center justify-center text-center">
        <!-- 12-Bar Radial Spinner -->
        <app-loader
          [size]="'md'"
          color="#FFFFFF"
          [centered]="false"
        ></app-loader>

        <!-- Direct Bottom Text -->
        <p class="mt-4 text-[16px] sm:text-[17px] font-semibold text-white tracking-wide drop-shadow-lg m-0 select-none">
          Redirecting to SSO Login Screen.
        </p>
      
      </div>
    </div>
  `
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private timerRedirect: any = null;

  ngOnInit(): void {
    // Smooth, clean transition directly to SSO login
    this.timerRedirect = setTimeout(() => {
      this.authService.proceedToSsoLogin();
    }, 1300);
  }

  ngOnDestroy(): void {
    if (this.timerRedirect) clearTimeout(this.timerRedirect);
  }
}
