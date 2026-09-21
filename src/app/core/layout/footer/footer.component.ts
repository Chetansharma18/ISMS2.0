import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <footer class="w-full bg-[#0a1e35] text-slate-300 border-t-4 border-orange-500 font-sans">
      
      <!-- Main Footer Columns -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          <!-- Col 1: Contact Us (4 cols) -->
          <div class="lg:col-span-4 space-y-5">
            <h4 class="text-lg font-bold text-white mb-4 relative pb-2 inline-block">
              Contact Us
              <div class="absolute bottom-0 left-0 w-8 h-1 bg-orange-500"></div>
            </h4>

            <div class="flex items-center gap-3 mb-6">
              <img
                src="/Rajasthan-Sarkar.png"
                alt="Government of Rajasthan"
                class="h-14 w-auto object-contain brightness-0 invert select-none"
                onerror="this.src='/emblem-new.png'"
              />
              <div class="border-l border-slate-700 pl-3">
                <p class="text-xl font-black text-white tracking-tight leading-none">ISMS 2.0</p>
                <p class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Integrated Scheme Management System</p>
              </div>
            </div>

            <div class="space-y-4 text-sm text-slate-300">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="leading-relaxed">
                  Rajasthan Skill and Livelihoods Development Corporation (RSLDC) EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur - 302004
                </p>
              </div>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:isms-helpdesk@rajasthan.gov.in" class="hover:text-white transition-colors">isms-helpdesk&#64;rajasthan.gov.in</a>
              </div>
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>181 / 0141-2715800</span>
              </div>
            </div>
          </div>

          <!-- Spacer for layout -->
          <div class="hidden lg:block lg:col-span-2"></div>

          <!-- Col 2: Useful Links (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <h4 class="text-lg font-bold text-white mb-4 relative pb-2 inline-block">
              Useful Links
              <div class="absolute bottom-0 left-0 w-8 h-1 bg-orange-500"></div>
            </h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> About Us
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Circulars
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Departments
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Office Orders
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Quick Links (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <h4 class="text-lg font-bold text-white mb-4 relative pb-2 inline-block">
              Quick Links
              <div class="absolute bottom-0 left-0 w-8 h-1 bg-orange-500"></div>
            </h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Gallery
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Latest News
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Tenders
                </a>
              </li>
              <li>
                <a href="#" class="flex items-center gap-2 hover:text-white transition-colors group">
                  <span class="text-orange-500 group-hover:translate-x-1 transition-transform">›</span> Press Release
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      <!-- Copyright & Bottom Disclaimer -->
      <div class="border-t border-slate-700 bg-[#081728] py-5 px-4 sm:px-6 lg:px-8 text-sm text-slate-400">
        <div class="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            &copy; 2024 ISMS, Rajasthan. All Rights Reserved.
          </p>
          <div class="flex items-center gap-2">
            <span>Designed & Developed by</span>
            <img src="/doit-logo.png" alt="DOIT" class="h-6 w-auto brightness-0 invert opacity-80" onerror="this.style.display='none'">
            <span class="text-white font-semibold">RISL</span>
          </div>
        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {}
