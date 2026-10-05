import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { SchemesSectionComponent } from './components/schemes-section/schemes-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { ImportantLinksComponent } from './components/important-links/important-links.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    NewsTickerComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    ServicesSectionComponent
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
    </div>
  `
})
export class LandingComponent { }
