import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroTendersComponent } from '../hero-tenders/hero-tenders.component';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, HeroTendersComponent],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] flex items-center bg-slate-900 overflow-hidden">
      
      <!-- Full-bleed Background Image with Performance Optimization -->
      <img 
        src="/raj.png" 
        alt="Skill Development Building" 
        class="absolute inset-0 w-full h-full object-cover object-center transform scale-105 select-none pointer-events-none"
        fetchpriority="high"
      />
      
      <!-- High-Readability Gradient Overlay -->
      <div class="absolute inset-0 bg-linear-to-r from-[#07233B]/95 via-[#0B3558]/90 to-[#0B3558]/50 sm:to-[#0B3558]/30"></div>
      <div class="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-black/30 pointer-events-none"></div>

      <div class="max-w-[95%] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        <!-- Hero Content (Left) -->
        <div class="lg:col-span-6 xl:col-span-6 text-left">
          
          <h1 class="landing-hero-title mb-6 tracking-tight">
            <span class="inline-block">Integrated Scheme</span> <br class="hidden sm:inline" />
            <span class="inline-block">Management System</span>
          </h1>

          <p class="landing-hero-desc text-white">
            A unified, transparent digital ecosystem empowering skill development schemes, training operations, biometric verification, assessments, certifications, and sustainable placements across Rajasthan.
          </p>

        </div>

        <!-- Tenders Sidebar (Right) - Modularized in Separate Component File -->
        <div class="lg:col-span-6 xl:col-span-6 w-full flex justify-center lg:justify-end">
          <app-hero-tenders class="w-full"></app-hero-tenders>
        </div>

      </div>
    </section>
  `
})
export class HeroSectionComponent {}
