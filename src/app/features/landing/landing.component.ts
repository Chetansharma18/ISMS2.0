import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsTickerComponent } from './components/news-ticker/news-ticker.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

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
    FooterComponent
  ],
  host: {
    class: 'block w-full'
  },
  template: `
    <div class="w-full flex flex-col min-h-screen">
      <!-- Global Header -->
      <app-header></app-header>

      <main class="flex-grow">
        <!-- 1. Government Circulars & News Ticker -->
        <app-news-ticker></app-news-ticker>

        <!-- 2. Flagship Hero Banner with RSLDC Branding -->
        <app-hero-section></app-hero-section>

        <!-- 3. About ISMS 2.0 -->
        <app-about-section></app-about-section>

        <!-- 4. Mobile App & Support -->
        <app-services-section></app-services-section>
      </main>

      <!-- Global Footer -->
      <app-footer></app-footer>
    </div>
  `
})
export class LandingComponent { }
