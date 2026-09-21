import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="py-12 bg-white">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Row: About Text & Image -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-12">
          
          <!-- Left Content -->
          <div class="pt-2">
            <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-6 tracking-tight font-sans">
              About ISMS 2.0
            </h2>
            <p class="text-[13px] sm:text-sm text-slate-600 leading-[1.8] mb-5">
              Integrated Scheme Management System (ISMS 2.0) is a comprehensive e-Governance 
              and Management Information System (MIS) designed to digitally transform and 
              streamline RSLDC processes. It provides a centralized, secure, and integrated platform 
              connecting youth, training providers, government departments, empaneled agencies, 
              and assessment & certification agencies.
            </p>
            <p class="text-[13px] sm:text-sm text-slate-600 leading-[1.8] mb-8">
              ISMS 2.0 enables end-to-end scheme management, workflow-based approvals, real-
              time monitoring, MIS and reporting, and data-driven decision-making, providing a unified 
              platform for efficient, transparent, and accountable delivery of skill development 
              initiatives.
            </p>
            <button class="bg-[#0B3558] hover:bg-[#07233B] text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors flex items-center gap-2">
              Know More
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          <!-- Right Image & Quote -->
          <div class="relative">
            <div class="rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <img 
                src="/students-lab.jpg" 
                alt="Students in training lab" 
                class="w-full h-auto object-cover object-center max-h-[280px]"
                onerror="this.src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1200&auto=format&fit=crop'"
              />
            </div>
            
            <!-- Quote Block -->
            <div class="bg-[#f0f6ff] rounded-xl p-5 sm:p-6 border border-[#e2efff] relative">
              <span class="absolute top-4 left-4 text-4xl text-blue-500 font-serif leading-none">“</span>
              <p class="text-[13px] sm:text-sm text-slate-700 leading-relaxed pl-6 relative z-10 font-medium">
                ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to 
                Youths, Training providers, Govt. Departments, Convergence Departments, and 
                Certification agencies for Skill Development Schemes.
              </p>
              <span class="absolute bottom-1 right-4 text-4xl text-blue-500 font-serif leading-none rotate-180">“</span>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Stats Banner -->
        <div class="bg-gradient-to-r from-[#fff5ef] to-[#fdfaf7] border border-[#fceee5] rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-4 relative overflow-hidden">
          
          <!-- Banner Graphic (Left) -->
          <div class="lg:w-2/5 flex flex-col items-start relative z-10">
            <h3 class="text-xl sm:text-2xl font-bold text-[#0B3558] leading-tight mb-1">
              Building a
            </h3>
            <h3 class="text-2xl sm:text-3xl font-black text-[#EA580C] mb-3">
              Skilled Rajasthan
            </h3>
            <div class="w-12 h-1 bg-[#F6A820] mb-2"></div>
            <!-- Absolute background image of palace for this section -->
            <img src="/palace-bg.png" alt="Palace" class="absolute -right-10 bottom-0 max-h-[140px] opacity-70 mix-blend-multiply pointer-events-none" onerror="this.style.display='none'" />
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px h-16 bg-orange-200/50 mx-4 relative z-10"></div>

          <!-- Stats (Right) -->
          <div class="lg:w-3/5 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full relative z-10">
            <!-- Stat 1 -->
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-[#fdecdb] flex items-center justify-center shrink-0 text-[#EA580C]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-black text-[#0B3558] leading-none mb-1 font-sans">16</h4>
                <p class="text-xs text-slate-600 font-medium">Official RFP Modules</p>
              </div>
            </div>

            <!-- Stat 2 -->
            <div class="flex items-center gap-4 border-l-0 sm:border-l border-orange-200/50 sm:pl-6">
              <div class="w-12 h-12 rounded-full bg-[#fdecdb] flex items-center justify-center shrink-0 text-[#EA580C]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21l9-5-9-5-9 5 9 5zm0 0L3 16l9-5" />
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-black text-[#0B3558] leading-none mb-1 font-sans">6.0L+</h4>
                <p class="text-xs text-slate-600 font-medium">Candidates</p>
              </div>
            </div>

            <!-- Stat 3 -->
            <div class="flex items-center gap-4 border-l-0 sm:border-l border-orange-200/50 sm:pl-6">
              <div class="w-12 h-12 rounded-full bg-[#fdecdb] flex items-center justify-center shrink-0 text-[#EA580C]">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-2xl font-black text-[#0B3558] leading-none mb-1 font-sans">2,670+</h4>
                <p class="text-xs text-slate-600 font-medium">Training Partners</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  `
})
export class AboutSectionComponent { }
