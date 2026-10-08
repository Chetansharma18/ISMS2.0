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
    <!-- Section 5: ISMS 2.0 Mobile Application -->
    <section class="relative w-full py-12 sm:py-16 md:py-20 xl:py-24 border-b border-[#DCE5EE] overflow-hidden" aria-labelledby="mobile-app-heading">
      
      <!-- Panoramic Rajasthan Landscape Heritage Background Layer -->
      <div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img 
          src="/service-background.png" 
          alt="Rajasthan Heritage Landscape & Lake Palace" 
          aria-hidden="true"
          class="w-full h-full object-cover object-bottom"
          loading="lazy"
          onerror="this.src='/Service%20background.png'"
        />
        <!-- Soft translucent light overlay ensuring high text readability while showcasing the heritage architecture -->
        <div class="absolute inset-0 bg-white/80 sm:bg-transparent sm:bg-linear-to-r sm:from-white/35 sm:via-white/72 sm:to-white/35"></div>
      </div>

      <!-- Centered Content Container: Max Width 1400–1440px with Responsive Padding (20px Mobile) -->
      <div class="relative z-10 w-full max-w-350 xl:max-w-360 mx-auto px-5 sm:px-8 xl:px-12 box-border">
        
        <!-- Two-Column Layout: Phone (~38%) on Left, Content (~62%) on Right on Desktop, Stacked on Mobile -->
        <div class="flex flex-col lg:grid lg:grid-cols-[38fr_62fr] items-center gap-10 sm:gap-12 lg:gap-14 xl:gap-16 w-full">
          
          <!-- Column 1: Phone Mockup (First on Mobile, Left on Desktop, Centered Vertically) -->
          <div class="w-full flex items-center justify-center order-1 lg:justify-end">
            <img 
              src="/mobile-app-phone.png" 
              alt="ISMS 2.0 Mobile Application Mockup" 
              class="w-full max-w-52.5 sm:max-w-60 md:max-w-65 lg:max-w-70 xl:max-w-72.5 h-auto object-contain drop-shadow-[0_16px_36px_rgba(11,36,64,0.18)] select-none pointer-events-none transition-transform duration-300 hover:scale-[1.01]"
              loading="lazy"
              onerror="this.src='/hero-bg.png'"
            />
          </div>

          <!-- Column 2: Content Area (Second on Mobile, Right on Desktop) -->
          <div class="w-full flex flex-col justify-center text-left order-2">
            
            <!-- Heading & Short Orange Underline -->
            <div class="mb-4 sm:mb-5">
              <h2 id="mobile-app-heading" class="font-['Inter',sans-serif] text-[28px] sm:text-[32px] lg:text-[36px] font-bold leading-[1.2] text-[#12365A] tracking-tight m-0">
                ISMS <span class="text-[#F28C28]">2.0</span> Mobile Application
              </h2>

              <!-- Small Orange Underline: Width 42px, Height 3px, #F28C28, Radius 2px -->
              <div class="w-10.5 h-0.75 bg-[#F28C28] rounded-xs mt-2.5 mb-4" aria-hidden="true"></div>
            </div>

            <!-- Existing Description: Exact text preserved, Inter 16px/15px, Left-aligned, Line-height 1.6, Color #344256 -->
            <p class="font-['Inter',sans-serif] text-[15px] sm:text-[16px] font-normal leading-[1.6] text-[#344256] max-w-155 m-0 mb-6 sm:mb-7 text-left">
              An integrated, multilingual mobile application providing instantaneous access to scheme notifications, biometric attendance, training center verifications, and grievances.
            </p>

            <!-- Three Feature Highlights: Horizontal Compact Items (40-44px icon, #EEF5FB bg, #12365A text) -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 mb-6 sm:mb-8 max-w-155">
              
              <!-- Feature 1: For Multiple Stakeholders -->
              <div class="flex items-center gap-3 bg-white/95 border border-[#123B5D]/10 rounded-[10px] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(18,54,90,0.04)]">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#12365A] shrink-0">
                  <svg class="w-5 h-5 text-[#12365A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span class="font-['Inter',sans-serif] text-[14px] sm:text-[14.5px] font-semibold text-[#12365A] leading-snug">
                  For Multiple Stakeholders
                </span>
              </div>

              <!-- Feature 2: In English & Hindi -->
              <div class="flex items-center gap-3 bg-white/95 border border-[#123B5D]/10 rounded-[10px] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(18,54,90,0.04)]">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#12365A] shrink-0 font-bold text-[13px] font-['Inter',sans-serif]">
                  A / अ
                </div>
                <span class="font-['Inter',sans-serif] text-[14px] sm:text-[14.5px] font-semibold text-[#12365A] leading-snug">
                  In English &amp; Hindi
                </span>
              </div>

              <!-- Feature 3: Secure & Role Based Access -->
              <div class="flex items-center gap-3 bg-white/95 border border-[#123B5D]/10 rounded-[10px] px-3.5 py-2.5 shadow-[0_2px_8px_rgba(18,54,90,0.04)]">
                <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#EEF5FB] flex items-center justify-center text-[#12365A] shrink-0">
                  <svg class="w-5 h-5 text-[#12365A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span class="font-['Inter',sans-serif] text-[14px] sm:text-[14.5px] font-semibold text-[#12365A] leading-snug">
                  Secure &amp; Role Based Access
                </span>
              </div>

            </div>

            <!-- Statistics Panel: One Clean White Panel (3 equal columns with dividers) -->
            <div class="w-full max-w-155 bg-white/96 border border-[#E1E7EE] rounded-xl shadow-[0_8px_24px_rgba(15,40,70,0.08)] p-4 sm:p-5 lg:p-6 box-border">
              <div class="grid grid-cols-3 divide-x divide-[#E1E7EE] text-center">
                
                <!-- Stat 1: 1K+ Downloads -->
                <div class="px-1.5 sm:px-4 flex flex-col items-center justify-center">
                  <div class="font-['Inter',sans-serif] text-[22px] sm:text-[32px] lg:text-[40px] font-bold text-[#12365A] leading-none tabular-nums tracking-tight">
                    1K+
                  </div>
                  <div class="font-['Inter',sans-serif] text-[11px] sm:text-[14px] lg:text-[15px] font-normal text-[#52647A] mt-1.5 sm:mt-2">
                    Downloads
                  </div>
                </div>

                <!-- Stat 2: 4.8 User Rating (with Orange Star) -->
                <div class="px-1.5 sm:px-4 flex flex-col items-center justify-center">
                  <div class="font-['Inter',sans-serif] text-[22px] sm:text-[32px] lg:text-[40px] font-bold text-[#12365A] leading-none tabular-nums tracking-tight flex items-center justify-center gap-0.5 sm:gap-1">
                    <span>4.8</span>
                    <span class="text-[#F28C28] text-[16px] sm:text-[22px] lg:text-[26px] leading-none -mt-0.5" aria-hidden="true">★</span>
                  </div>
                  <div class="font-['Inter',sans-serif] text-[11px] sm:text-[14px] lg:text-[15px] font-normal text-[#52647A] mt-1.5 sm:mt-2">
                    User Rating
                  </div>
                </div>

                <!-- Stat 3: 200+ Active Users -->
                <div class="px-1.5 sm:px-4 flex flex-col items-center justify-center">
                  <div class="font-['Inter',sans-serif] text-[22px] sm:text-[32px] lg:text-[40px] font-bold text-[#12365A] leading-none tabular-nums tracking-tight">
                    200+
                  </div>
                  <div class="font-['Inter',sans-serif] text-[11px] sm:text-[14px] lg:text-[15px] font-normal text-[#52647A] mt-1.5 sm:mt-2">
                    Active Users
                  </div>
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
