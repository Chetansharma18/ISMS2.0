import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { BackdropComponent } from '../../../../shared/components/backdrop/backdrop.component';

@Component({
  selector: 'app-sso-redirect-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoaderComponent, BackdropComponent],
  host: {
    class: 'block'
  },
  template: `
    <!-- Fullscreen Blurred Backdrop Overlay (No Cards, No Popup Box) -->
    <app-backdrop
      z="z-100"
      blur="lg"
      tone="deep"
      [hasContent]="true"
      class="flex flex-col items-center justify-center p-4 select-none font-sans"
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
    </app-backdrop>
  `
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private timerRedirect: ReturnType<typeof setTimeout> | null = null;

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
