import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  styles: [`
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-50% - 0.5rem)); }
    }
    .animate-scroll {
      animation: scroll 20s linear infinite;
    }
    .animate-scroll:hover {
      animation-play-state: paused;
    }
    .mask-fade {
      mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
    }
  `],
  template: `
    <footer class="w-full bg-[#12223a] text-slate-300 font-sans border-t border-slate-700">
      
      <!-- Tier 1: Other Important Links (Carousel-like) -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <!-- Header -->
        <div class="flex items-center justify-center gap-4 mb-10">
          <div class="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-[#F59E0B] to-transparent"></div>
          <h3 class="text-xl sm:text-2xl font-bold text-white tracking-wide">Other Important Links</h3>
          <div class="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-[#F59E0B] to-transparent"></div>
        </div>

        <!-- Carousel Container -->
        <div class="relative flex items-center justify-between gap-4 sm:gap-8 max-w-6xl mx-auto">
          
          <!-- Left Arrow -->
          <button class="w-10 h-10 rounded-full border border-slate-500 flex items-center justify-center text-slate-400 hover:text-[#12223a] hover:border-[#F59E0B] hover:bg-[#F59E0B] transition-colors shrink-0 z-10">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Infinite Marquee Track -->
          <div class="flex-1 overflow-hidden mask-fade relative">
            <div class="flex gap-4 w-max animate-scroll">
              <!-- Set 1 (Original) -->
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" onerror="this.src='/footer-images/bis.png'">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain">
              </div>

              <!-- Set 2 (Duplicated for Loop) -->
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" onerror="this.src='/footer-images/bis.png'">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain">
              </div>
              <div class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain">
              </div>
            </div>
          </div>

          <!-- Right Arrow -->
          <button class="w-10 h-10 rounded-full border border-slate-500 flex items-center justify-center text-slate-400 hover:text-[#12223a] hover:border-[#F59E0B] hover:bg-[#F59E0B] transition-colors shrink-0 z-10">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div class="w-full h-px bg-slate-700/50"></div>

      <!-- Tier 2: Main Footer Info -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 items-start">
          
          <!-- Column 1: Branding -->
          <div class="flex flex-col items-start text-left">
            <div class="flex items-center gap-3 mb-4">
              <img src="/footer-images/emblem-white.png" alt="Emblem" class="h-16 w-auto object-contain" onerror="this.src='/Rajasthan-Sarkar.png'">
              <img src="/footer-images/rsldc-logo.png" alt="RSLDC" class="h-14 w-auto object-contain" onerror="this.src='/rsldc-logo.png'">
            </div>
            <h2 class="text-3xl font-black text-white mb-2 tracking-tight">ISMS <span class="text-[#F59E0B]">2.0</span></h2>
            <p class="text-sm font-semibold text-white mb-1">Integrated Scheme Management System</p>
            <p class="text-xs text-slate-400 leading-snug">
              Rajasthan Skill & Livelihoods Development Corporation<br/>
              Department of Skill, Employment and Entrepreneurship
            </p>
          </div>

          <!-- Column 2: Important Links -->
          <div class="flex flex-col items-start lg:items-center text-left">
            <div>
              <h4 class="text-sm font-bold text-white mb-5">Important Links</h4>
              <ul class="space-y-3 text-xs text-slate-300">
                <li><a href="#" class="hover:text-white transition-colors">Rajasthan Government</a></li>
                <li><a href="#" class="hover:text-white transition-colors">RSLDC</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>

          <!-- Column 3: Connect With Us -->
          <div class="flex flex-col items-start lg:items-end text-left lg:text-right">
            <div>
              <h4 class="text-sm font-bold text-white mb-4">Connect With Us</h4>
              <div class="flex items-center gap-3 mb-8 lg:justify-end">
                <a href="#" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="#" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </a>
              </div>

              <h4 class="text-xs font-bold text-slate-400 mb-3">Helpline</h4>
              <div class="space-y-2 text-xs text-slate-300">
                <div class="flex items-center gap-2 lg:justify-end">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>0141-xxxxxxx</span>
                </div>
                <div class="flex items-center gap-2 lg:justify-end">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>support@isms.rajasthan.gov.in</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {}
