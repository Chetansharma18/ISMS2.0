import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="pt-6 sm:pt-10 pb-12 sm:pb-16 bg-white border-b border-slate-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Mobile App Showcase Card -->
        <div class="rounded-3xl border border-blue-100/80 p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-sm">
          <!-- Background Image Layer with Lazy Loading -->
          <div class="absolute inset-0 z-0">
            <img 
              src="/jar.jpg" 
              alt="Background pattern" 
              class="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/60 sm:to-transparent"></div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-5xl mx-auto relative z-10">
            
            <!-- Left Column: Mobile Mockup -->
            <div class="lg:col-span-5 flex justify-center">
              <div class="w-full max-w-[210px] sm:max-w-[250px] transition-transform duration-300 hover:scale-105">
                <img 
                  src="/mobile-app-phone.png" 
                  alt="ISMS 2.0 Mobile App on phone" 
                  class="w-full h-auto drop-shadow-2xl rounded-[2.5rem] sm:rounded-[3rem]"
                  loading="lazy"
                  onerror="this.src='https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop'"
                />
              </div>
            </div>

            <!-- Right Column: Text & Circular Features -->
            <div class="lg:col-span-7 flex flex-col justify-center">
              
              <!-- Header Pill & Title -->
              <div class="mb-6 sm:mb-8 text-center lg:text-left bg-white/85 p-5 sm:p-6 rounded-2xl border border-white/70 shadow-xs backdrop-blur-xs">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>Smart Governance</span>
                </div>
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B3558] mb-2 tracking-tight font-sans">
                  ISMS 2.0 Mobile App
                </h2>
                <p class="text-sm sm:text-base text-slate-700 font-medium leading-relaxed max-w-lg">
                  An integrated, multilingual mobile application providing instantaneous access to 
                  scheme notifications, biometric attendance, training center verifications, and grievances.
                </p>
              </div>

              <!-- Circular Features (Fully Responsive Grid/Flex without Overflow) -->
              <div class="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-5">
                <!-- Feature 1 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-[98px] h-[98px] sm:w-[124px] sm:h-[124px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all hover:shadow-md">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 shrink-0">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p class="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">For Multiple<br/>Stakeholders</p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-[98px] h-[98px] sm:w-[124px] sm:h-[124px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all hover:shadow-md">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 shrink-0">
                    <span class="font-black text-xs sm:text-sm">A / अ</span>
                  </div>
                  <p class="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-tight">In English &<br/>Hindi</p>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-[98px] h-[98px] sm:w-[124px] sm:h-[124px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all hover:shadow-md">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0B3558] flex items-center justify-center mb-1 shrink-0">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p class="text-[10px] sm:text-[11px] font-bold text-[#1f2937] leading-tight">Secure & Role<br/>Based Access</p>
                </div>
              </div>

              <!-- App Stats (Responsive Grid without Overflow) -->
              <div class="mt-6 sm:mt-8 flex flex-wrap justify-around lg:justify-start items-center gap-4 sm:gap-8 border-t border-white/60 pt-5 bg-white/80 p-4 sm:p-5 rounded-2xl shadow-2xs">
                <div class="text-center lg:text-left">
                  <p class="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B3558]">1K+</p>
                  <p class="text-[9px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Downloads</p>
                </div>
                <div class="w-px h-8 bg-slate-300"></div>
                <div class="text-center lg:text-left">
                  <p class="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B3558] flex items-center justify-center lg:justify-start gap-1">
                    4.8 <span class="text-[#EA580C] text-lg">★</span>
                  </p>
                  <p class="text-[9px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">User Rating</p>
                </div>
                <div class="w-px h-8 bg-slate-300"></div>
                <div class="text-center lg:text-left">
                  <p class="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B3558]">200+</p>
                  <p class="text-[9px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Active Users</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Help & Support Section (Clean Responsive Card) -->
        <div class="mt-10 sm:mt-14 max-w-5xl mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          
          <!-- Text Content -->
          <div class="text-center md:text-left max-w-md">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-[#EA580C] text-[11px] font-bold uppercase tracking-wider mb-2">
              Help & Support
            </span>
            <h3 class="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B3558] mb-2 tracking-tight font-sans">
              Need Assistance?
            </h3>
            <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
              Get dedicated assistance with registration, portal navigation, training center inspections, and technical inquiries.
            </p>
          </div>

          <!-- Helpdesk Contacts (Responsive Touch-Friendly Cards) -->
          <div class="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a 
              href="mailto:support@isms.rajasthan.gov.in" 
              class="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#0B3558] hover:text-[#EA580C] transition-all shadow-xs group">
              <div class="w-7 h-7 rounded-full bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="truncate">support&#64;isms.rajasthan.gov.in</span>
            </a>

            <a 
              href="tel:+919876543210" 
              class="inline-flex items-center justify-center gap-2 bg-[#0B3558] hover:bg-[#07233B] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white transition-all shadow-xs group">
              <div class="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span>+91 98765 43210</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  `
})
export class ServicesSectionComponent { }
