import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-sso-redirect-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoaderComponent],
  host: {
    class: 'block'
  },
  template: `<app-loader mode="fullscreen" messageKey="signingIn" />`
})
export class SsoRedirectModalComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private timerRedirect: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.timerRedirect = setTimeout(() => {
      this.authService.proceedToSsoLogin();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerRedirect) clearTimeout(this.timerRedirect);
  }
}
