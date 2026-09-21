import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { SchemesSectionComponent } from './components/schemes-section/schemes-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NewsTickerComponent,
    HeroSectionComponent,
    StatsSectionComponent,
    SchemesSectionComponent,
    ServicesSectionComponent,
    AboutSectionComponent
  ],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="w-full flex flex-col">
      <!-- 1. Government Circulars & News Ticker -->
      <app-news-ticker></app-news-ticker>

      <!-- 2. Flagship Hero Banner with RSLDC Branding -->
      <app-hero-section></app-hero-section>

      <!-- 3. Key Impact & Transparent Governance Metrics -->
      <app-stats-section></app-stats-section>

      <!-- 4. Active Schemes & Open EOI Opportunities -->
      <app-schemes-section></app-schemes-section>

      <!-- 5. 4-Stage Governance Pipeline -->
      <app-services-section></app-services-section>

      <!-- 6. About RSLDC & Vocational Labs -->
      <app-about-section></app-about-section>
    </div>
  `
})
export class LandingComponent {}
