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
    <section class="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-200">
      <div class="max-w-[95%] mx-auto px-4 sm:px-6 lg:px-8">
        
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
            <div class="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-white/60 sm:to-transparent"></div>
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-5xl mx-auto relative z-10">
            
            <!-- Left Column: Mobile Mockup -->
            <div class="lg:col-span-5 flex justify-center">
              <div class="w-full max-w-52.5 sm:max-w-62.5 transition-transform duration-300 hover:scale-105">
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
              
              <!-- Header Title -->
              <div class="mb-6 sm:mb-8 text-center lg:text-left">
                <h2 class="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0B3558] mb-3 tracking-tight leading-tight">
                  ISMS 2.0 Mobile App
                </h2>
                <p class="text-[15px] sm:text-[16px] text-slate-600 leading-[1.75] max-w-lg mx-auto lg:mx-0 text-left">
                  An integrated, multilingual mobile application providing instantaneous access to
                  scheme notifications, biometric attendance, training center verifications, and grievances.
                </p>
              </div>

              <!-- Circular Features (Fully Responsive Grid/Flex without Overflow) -->
              <div class="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-5">
                <!-- Feature 1 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-28 h-28 sm:w-32 sm:h-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-200 cursor-pointer group">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0B3558] flex items-center justify-center mb-1 shrink-0 transition-colors duration-300 group-hover:bg-[#0B3558] group-hover:text-white">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div class="mt-1 flex flex-col items-center justify-center w-full">
                    <p class="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">For Multiple<br/>Stakeholders</p>
                  </div>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-28 h-28 sm:w-32 sm:h-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-200 cursor-pointer group">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0B3558] flex items-center justify-center mb-1 shrink-0 transition-colors duration-300 group-hover:bg-[#0B3558] group-hover:text-white">
                    <span class="font-black text-xs sm:text-sm">A / अ</span>
                  </div>
                  <div class="mt-1 flex flex-col items-center justify-center w-full">
                    <p class="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">In English &<br/>Hindi</p>
                  </div>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white rounded-2xl sm:rounded-full w-28 h-28 sm:w-32 sm:h-32 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center p-2 shrink-0 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5 hover:border-blue-200 cursor-pointer group">
                  <div class="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-blue-50 text-[#0B3558] flex items-center justify-center mb-1 shrink-0 transition-colors duration-300 group-hover:bg-[#0B3558] group-hover:text-white">
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div class="mt-1 flex flex-col items-center justify-center w-full">
                    <p class="text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">Secure & Role<br/>Based Access</p>
                  </div>
                </div>
              </div>

              <!-- App Stats (Responsive Grid without Overflow) -->
              <!-- App Stats (Downloads, Rating, Users) -->
              <!-- App Stats: Downloads, Rating, Users -->
              <div class="mt-6 sm:mt-8 grid grid-cols-3 items-center divide-x divide-slate-200 bg-white/90 p-4 sm:p-5 rounded-2xl shadow-sm ring-1 ring-slate-100 hover:ring-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-white cursor-pointer w-full max-w-sm lg:max-w-md mx-auto lg:mx-0">

                <div class="flex flex-col items-center justify-center px-3 py-2">
                  <div style="font-size: 2.6rem; line-height: 1; font-weight: 800; color: #0B3558; font-family: 'Inter', sans-serif;" class="tabular-nums">1K+</div>
                  <p class="text-[12px] sm:text-[13px] font-semibold text-slate-500 mt-2 tracking-wide">Downloads</p>
                </div>

                <div class="flex flex-col items-center justify-center px-3 py-2">
                  <div style="font-size: 2.6rem; line-height: 1; font-weight: 800; color: #0B3558; font-family: 'Inter', sans-serif;" class="tabular-nums flex items-center justify-center gap-1">
                    4.8 <span style="color: #EA580C; font-size: 1.5rem; margin-top: -2px;">★</span>
                  </div>
                  <p class="text-[12px] sm:text-[13px] font-semibold text-slate-500 mt-2 tracking-wide">User Rating</p>
                </div>

                <div class="flex flex-col items-center justify-center px-3 py-2">
                  <div style="font-size: 2.6rem; line-height: 1; font-weight: 800; color: #0B3558; font-family: 'Inter', sans-serif;" class="tabular-nums">200+</div>
                  <p class="text-[12px] sm:text-[13px] font-semibold text-slate-500 mt-2 tracking-wide">Active Users</p>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  `
})
export class ServicesSectionComponent { }
