import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ServiceStep {
  step: string;
  title: string;
  description: string;
  badge: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="pt-4 pb-12 bg-white border-b border-slate-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="rounded-3xl border border-blue-100 p-8 sm:p-12 relative overflow-hidden">
          <!-- Background Image Layer -->
          <div class="absolute inset-0 z-0">
            <img src="/jar.jpg" alt="" class="w-full h-full object-cover" />
          </div>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto relative z-10">
            
            <!-- Left Column: Mobile Mockup -->
            <div class="flex justify-center relative z-10">
              <div class="w-full max-w-[260px]">
                <img 
                  src="/mobile-app-phone.png" 
                  alt="ISMS 2.0 Mobile App on phone" 
                  class="w-full h-auto drop-shadow-2xl rounded-[3rem]"
                  onerror="this.src='https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop'"
                />
              </div>
            </div>

            <!-- Right Column: Text & Circular Features -->
            <div class="flex flex-col justify-center">
              <div class="mb-10 text-center lg:text-left bg-gradient-to-r from-white/90 via-white/70 to-transparent p-6 rounded-2xl backdrop-blur-sm max-w-xl shadow-[0_4px_20px_rgba(255,255,255,0.5)]">
                <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 drop-shadow-sm">Mobile Application</h4>
                <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-3 tracking-tight font-sans drop-shadow-sm">
                  ISMS 2.0 Mobile App
                </h2>
                <p class="text-[13px] sm:text-sm text-slate-800 font-medium leading-relaxed drop-shadow-sm">
                  An integrated mobile application to enable access to key ISMS 
                  2.0 services for all stakeholders.
                </p>
              </div>

              <!-- Circular Features -->
              <div class="flex justify-center lg:justify-start gap-4 sm:gap-6 mt-4">
                <!-- Feature 1 -->
                <div class="bg-white rounded-full w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center p-2 sm:p-3 shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f4f8fc] text-blue-500 flex items-center justify-center mb-1 sm:mb-2 shrink-0">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p class="text-[11px] sm:text-[12px] font-bold text-slate-700 leading-tight">For multiple<br/>stakeholders</p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white rounded-full w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center p-2 sm:p-3 shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f4f8fc] text-blue-500 flex items-center justify-center mb-1 sm:mb-2 shrink-0">
                    <span class="font-bold text-sm">A/अ</span>
                  </div>
                  <p class="text-[11px] sm:text-[12px] font-bold text-slate-700 leading-tight">In English &<br/>Hindi</p>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white rounded-full w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center text-center p-2 sm:p-3 shrink-0">
                  <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f4f8fc] text-[#0B3558] flex items-center justify-center mb-1 sm:mb-2 shrink-0">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p class="text-[11px] sm:text-[12px] font-bold text-[#1f2937] leading-tight">Secure & role<br/>based access</p>
                </div>
              </div>

              <!-- App Stats -->
              <div class="mt-8 flex flex-wrap justify-center lg:justify-start items-center gap-8 border-t border-white/50 pt-6 bg-gradient-to-r from-white/90 via-white/60 to-transparent p-6 rounded-2xl backdrop-blur-sm shadow-[0_4px_20px_rgba(255,255,255,0.3)]">
                <div class="text-center lg:text-left">
                  <p class="text-2xl sm:text-3xl font-black text-[#0B3558] drop-shadow-sm">1K+</p>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest mt-1 drop-shadow-sm">Downloads</p>
                </div>
                <div class="hidden sm:block w-px h-10 bg-slate-300"></div>
                <div class="text-center lg:text-left">
                  <p class="text-2xl sm:text-3xl font-black text-[#0B3558] drop-shadow-sm">4.8 <span class="text-[#EA580C] text-xl">★</span></p>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest mt-1 drop-shadow-sm">User Rating</p>
                </div>
                <div class="hidden sm:block w-px h-10 bg-slate-300"></div>
                <div class="text-center lg:text-left">
                  <p class="text-2xl sm:text-3xl font-black text-[#0B3558] drop-shadow-sm">200+</p>
                  <p class="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-widest mt-1 drop-shadow-sm">Active Users</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Help & Support Section (Below Mobile App Box) -->
        <div class="mt-16 mb-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4 sm:px-0">
          
          <!-- Text Content -->
          <div class="text-center md:text-left max-w-md">
            <h4 class="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-2">Help & Support</h4>
            <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-3 tracking-tight font-sans">
              Need Assistance?
            </h2>
            <p class="text-[13px] sm:text-sm text-slate-600 leading-relaxed">
              Get help with registration, training, assessment, placements, 
              payments and other services.
            </p>
          </div>

          <!-- Helpdesk Support Area -->
          <div class="w-full md:w-auto flex justify-center md:justify-end">
            <div class="flex items-center gap-5 text-left w-full sm:w-auto">
              <div class="w-14 h-14 rounded-full bg-[#f4f8fc] text-[#0B3558] flex items-center justify-center shrink-0">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p class="text-[17px] sm:text-[19px] font-black text-[#0B3558] leading-tight mb-1.5">Helpdesk Support</p>
                <p class="text-[13px] sm:text-[14px] text-slate-500 mb-2">For any queries or support related to ISMS 2.0</p>
                <div class="flex flex-row flex-nowrap whitespace-nowrap items-center gap-4 mt-1 overflow-x-auto">
                  <a href="mailto:support@isms.rajasthan.gov.in" class="text-[13px] sm:text-[14px] font-bold text-[#EA580C] hover:text-[#0B3558] transition-colors flex items-center gap-1.5 w-fit">
                    <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@isms.rajasthan.gov.in
                  </a>
                  <div class="w-px h-3 bg-slate-300 hidden sm:block"></div>
                  <a href="tel:+919876543210" class="text-[13px] sm:text-[14px] font-bold text-[#EA580C] hover:text-[#0B3558] transition-colors flex items-center gap-1.5 w-fit">
                    <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    +91 98765 43210
                  </a>
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
