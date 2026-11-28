// ui-guard-allow: page-frame - the public landing page has its own full-width sections
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { FooterComponent } from '../../core/layout/footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NewsTickerComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ServicesSectionComponent,
    FooterComponent
  ],
  styleUrls: ['./landing.component.css'],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="w-full flex flex-col flex-1">
      <!-- 1. Government Circulars & News Ticker (Single Source of Truth) -->
      <app-news-ticker></app-news-ticker>

      <!-- 2. Flagship Hero Banner with RSLDC Branding -->
      <app-hero-section></app-hero-section>

      <!-- 3. About ISMS 2.0 & Stats -->
      <app-about-section></app-about-section>

      <!-- 4. Mobile App & Support -->
      <app-services-section></app-services-section>

      <!-- 5. Portal Footer (Rendered exclusively with the landing page) -->
      <app-footer class="shrink-0"></app-footer>
    </div>
  `
})
export class LandingComponent { }
