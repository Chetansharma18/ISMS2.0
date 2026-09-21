import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-200 overflow-hidden py-10 md:py-16">
      <!-- Decorative Background Pattern -->
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0B3558_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <!-- Left Content: Headline, Details & Actions (7 Cols) -->
          <div class="lg:col-span-7 flex flex-col items-start">
            <!-- Government Authority Tag -->
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0B3558] text-xs font-semibold mb-4">
              <span class="w-2 h-2 rounded-full bg-[#EA580C]"></span>
              Government of Rajasthan &bull; RSLDC Initiative
            </div>

            <!-- Main Titles -->
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B3558] tracking-tight leading-[1.15]">
              Integrated Scheme <br />
              <span class="text-[#EA580C]">Management System</span> (ISMS 2.0)
            </h1>

            <p class="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-2xl">
              A unified digital single-window governance platform for skill development schemes, 
              training provider empanelment, candidate lifecycle management, and direct benefit disbursement 
              across Rajasthan.
            </p>

            <!-- Key Feature Badges -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 w-full max-w-xl">
              <div class="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div class="w-8 h-8 rounded bg-blue-50 text-[#0B3558] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-xs font-semibold text-slate-800">
                  Single Window <br/><span class="text-slate-500 font-normal">Accreditation</span>
                </div>
              </div>

              <div class="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div class="w-8 h-8 rounded bg-orange-50 text-[#EA580C] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="text-xs font-semibold text-slate-800">
                  Direct Benefit <br/><span class="text-slate-500 font-normal">DBT Transfer</span>
                </div>
              </div>

              <div class="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <div class="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div class="text-xs font-semibold text-slate-800">
                  Biometric Track <br/><span class="text-slate-500 font-normal">AEBAS Enabled</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#schemes"
                class="inline-flex items-center gap-2 bg-[#0B3558] hover:bg-[#07233B] text-white font-semibold px-5 py-2.5 rounded-md text-sm shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-[#0B3558]"
              >
                <span>Apply for EOI</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>

              <a
                href="#services"
                class="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-[#0B3558] border border-slate-300 font-semibold px-5 py-2.5 rounded-md text-sm shadow-2xs transition-all focus-visible:outline-2 focus-visible:outline-slate-400"
              >
                <span>Explore Schemes</span>
              </a>

              <a
                routerLink="/registration"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EA580C] hover:text-orange-700 underline underline-offset-4 px-2 py-2"
              >
                <span>OTR Registration</span>
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          <!-- Right Showcase: Official Graphic Card (5 Cols) -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-md p-6 overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
              <div class="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

              <!-- Header of card -->
              <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                <div class="flex items-center gap-3">
                  <img
                    src="/rsldc-logo.png"
                    alt="RSLDC Official Logo"
                    class="h-10 w-auto object-contain"
                    onerror="this.src='/Rajasthan-Sarkar.png'"
                  />
                  <div>
                    <h3 class="text-xs font-bold text-[#0B3558] uppercase tracking-wider">RSLDC Official</h3>
                    <p class="text-[11px] text-slate-500">Skill Development Corporation</p>
                  </div>
                </div>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Active
                </span>
              </div>

              <!-- Key Scheme Highlights in Card -->
              <div class="space-y-3 text-xs">
                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-slate-800">ELSTP Scheme (Phase IV)</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Empanelled Training Centers</p>
                  </div>
                  <span class="text-[11px] font-bold text-[#0B3558] bg-blue-50 px-2 py-0.5 rounded">Open</span>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-slate-800">PMKVY 4.0 State Component</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Youth Certification Drive</p>
                  </div>
                  <span class="text-[11px] font-bold text-[#EA580C] bg-orange-50 px-2 py-0.5 rounded">Enrolling</span>
                </div>

                <div class="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start justify-between">
                  <div>
                    <p class="font-semibold text-slate-800">Samarth Scheme</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Special Marginalized Cohorts</p>
                  </div>
                  <span class="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Verified</span>
                </div>
              </div>

              <!-- Bottom verification stamp -->
              <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  Certified State Portal
                </span>
                <span class="font-mono text-[10px] text-slate-400">Ver 2.0.4</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `
})
export class HeroSectionComponent {}
