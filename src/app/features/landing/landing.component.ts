import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { SchemesSectionComponent } from './components/schemes-section/schemes-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { ImportantLinksComponent } from './components/important-links/important-links.component';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { FooterComponent } from '../../core/layout/footer/footer.component';
import { AuthService } from '../../core/auth/auth.service';
import { inject } from '@angular/core';
import { SsoRedirectModalComponent } from '../../core/auth/components/sso-redirect-modal/sso-redirect-modal.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NewsTickerComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ServicesSectionComponent,
    HeaderComponent,
    FooterComponent,
    SsoRedirectModalComponent
  ],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="w-full flex flex-col min-h-screen">
      @if (authService.isRedirecting()) {
        <app-sso-redirect-modal></app-sso-redirect-modal>
      }

      <app-header (loginClicked)="onLoginClick()"></app-header>
      
      <!-- 1. Government Circulars & News Ticker -->
      <app-news-ticker></app-news-ticker>

      <!-- 2. Flagship Hero Banner with RSLDC Branding -->
      <app-hero-section></app-hero-section>

      <!-- 3. Key Impact & Transparent Governance Metrics -->
      <!-- <app-stats-section></app-stats-section> -->

      <!-- 4. About ISMS 2.0 & Stats -->
      <app-about-section></app-about-section>

      <!-- 5. Active Schemes & Open EOI Opportunities -->
      <!-- <app-schemes-section></app-schemes-section> -->

      <!-- 6. Mobile App & Support -->
      <app-services-section></app-services-section>

      <!-- 7. Important Links -->
      <!-- <app-important-links></app-important-links> -->
      
      <app-footer></app-footer>
    </div>
  `
})
export class LandingComponent {
  authService = inject(AuthService);

  onLoginClick(): void {
    this.authService.triggerSsoRedirect();
  }
}
