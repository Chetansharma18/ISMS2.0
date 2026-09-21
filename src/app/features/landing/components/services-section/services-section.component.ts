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
    <section class="py-12 bg-white border-b border-slate-200">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="bg-[#f4f8fc] rounded-3xl border border-blue-100 p-8 sm:p-12">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            
            <!-- Left Column: Text -->
            <div class="flex flex-col justify-center space-y-12">
              <div>
                <h4 class="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Mobile Application</h4>
                <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-3 tracking-tight font-sans">
                  ISMS 2.0 Mobile App
                </h2>
                <p class="text-[13px] sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                  An integrated mobile application to enable access to key ISMS 
                  2.0 services for all stakeholders.
                </p>
              </div>

              <div>
                <h4 class="text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-2">Help & Support</h4>
                <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-3 tracking-tight font-sans">
                  Need Assistance?
                </h2>
                <p class="text-[13px] sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                  Get help with registration, training, assessment, placements, 
                  payments and other services.
                </p>
              </div>
            </div>

            <!-- Center Column: Mobile Mockup -->
            <div class="flex justify-center relative z-10">
              <div class="w-full max-w-[260px]">
                <img 
                  src="/mobile-mockup.png" 
                  alt="ISMS 2.0 Mobile App on phone" 
                  class="w-full h-auto drop-shadow-2xl rounded-[3rem]"
                  onerror="this.src='https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=600&auto=format&fit=crop'"
                />
              </div>
            </div>

            <!-- Right Column: Features -->
            <div class="flex flex-col gap-4 relative z-10 w-full max-w-sm mx-auto lg:max-w-none">
              
              <div class="grid grid-cols-2 gap-4">
                <!-- Feature 1 -->
                <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-[140px]">
                  <div class="w-12 h-12 rounded-full bg-[#f4f8fc] text-blue-500 flex items-center justify-center mb-3">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p class="text-[11px] sm:text-[13px] font-semibold text-slate-700 leading-tight">For multiple stakeholders</p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center h-[140px]">
                  <div class="w-12 h-12 rounded-full bg-[#f4f8fc] text-blue-500 flex items-center justify-center mb-3">
                    <span class="font-bold text-sm">A/अ</span>
                  </div>
                  <p class="text-[11px] sm:text-[13px] font-semibold text-slate-700 leading-tight">In English & Hindi</p>
                </div>
              </div>

              <!-- Feature 3 -->
              <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-[#f4f8fc] text-blue-500 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p class="text-[12px] sm:text-[14px] font-semibold text-slate-700 leading-tight">Secure and role-based<br/>access</p>
              </div>

              <!-- Feature 4 -->
              <div class="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-[#f4f8fc] text-[#0B3558] flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[13px] sm:text-[15px] font-black text-[#0B3558] leading-tight mb-0.5">Helpdesk Support</p>
                  <p class="text-[11px] sm:text-[13px] text-slate-500">For any queries or support related to ISMS 2.0</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ServicesSectionComponent {}
