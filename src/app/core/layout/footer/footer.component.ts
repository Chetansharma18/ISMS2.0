import {
  Component,
  signal,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HELPLINE_GLOBAL } from '../../../shared/helpline-global';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  styles: [`
    @keyframes scroll {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(calc(-50% - 0.5rem), 0, 0);
      }
    }
    .animate-scroll {
      animation: scroll 26s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
    }
    .mask-fade {
      mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
    }
  `],
  template: `
    <footer #footerRef class="w-full bg-[#12223a] text-slate-300 font-sans border-t border-slate-700 select-none">
      
      <!-- Tier 1: Other Important Links (Optimized Marquee) -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <!-- Header -->
        <div class="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div class="h-[1px] w-8 sm:w-20 bg-gradient-to-l from-[#F59E0B] to-transparent"></div>
          <h3 class="text-lg sm:text-2xl font-bold text-white !text-white tracking-wide text-center" style="color: #ffffff !important;">Other Important Links</h3>
          <div class="h-[1px] w-8 sm:w-20 bg-gradient-to-r from-[#F59E0B] to-transparent"></div>
        </div>

        <!-- Carousel Container -->
        <div class="relative flex items-center justify-between gap-4 max-w-6xl mx-auto">
          
          <!-- Infinite Marquee Track (Hardware-Accelerated & Viewport Throttled) -->
          <div 
            class="flex-1 overflow-hidden mask-fade relative cursor-pointer"
            (mouseenter)="isHovering.set(true)"
            (mouseleave)="isHovering.set(false)"
            (touchstart)="isHovering.set(true)"
            (touchend)="isHovering.set(false)">
            
            <div 
              class="flex gap-3 sm:gap-4 w-max animate-scroll"
              [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'">
              
              <!-- Set 1 (Original) -->
              <a href="https://bis.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" loading="lazy" onerror="this.src='/footer-images/bis.png'">
              </a>
              <a href="https://acb.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>
              <a href="https://pledge.mygov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>
              <a href="https://jansoochna.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>

              <!-- Set 2 (Duplicated for Seamless Loop) -->
              <a href="https://bis.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20" aria-hidden="true">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" loading="lazy" onerror="this.src='/footer-images/bis.png'">
              </a>
              <a href="https://acb.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20" aria-hidden="true">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>
              <a href="https://pledge.mygov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20" aria-hidden="true">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>
              <a href="https://jansoochna.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[180px] sm:w-[220px] bg-white rounded-2xl h-20 sm:h-22 flex items-center justify-center p-3.5 sm:p-4 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer block border border-white/20" aria-hidden="true">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain" loading="lazy">
              </a>
            </div>
          </div>

        </div>
      </div>
      <div class="w-full h-px bg-slate-700/50"></div>

      <!-- Tier 2: Main Footer Info -->
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-10 items-start">
          
          <!-- Column 1: Branding -->
          <div class="flex flex-col items-center md:items-start text-center md:text-left">
            <div class="flex items-center gap-3 mb-3">
              <img src="/footer-images/emblem-white.png" alt="Emblem" class="h-12 sm:h-14 w-auto object-contain" loading="lazy" onerror="this.src='/Rajasthan-Sarkar.png'">
              <img src="/footer-images/rsldc-logo.png" alt="RSLDC" class="h-10 sm:h-12 w-auto object-contain" loading="lazy" onerror="this.src='/rsldc-logo.png'">
            </div>
            <h2 class="text-2xl sm:text-3xl font-black text-white !text-white mb-1 tracking-tight" style="color: #ffffff !important;">ISMS <span class="text-[#F59E0B]">2.0</span></h2>
            <p class="text-xs sm:text-sm font-bold text-white !text-white mb-1.5" style="color: #ffffff !important;">Integrated Scheme Management System</p>
            <p class="text-xs text-slate-300 !text-slate-300 leading-relaxed font-normal" style="color: #cbd5e1 !important;">
              Rajasthan Skill & Livelihoods Development Corporation<br/>
              Department of Skill, Employment and Entrepreneurship<br/>
              Government of Rajasthan
            </p>
          </div>

          <!-- Column 2: Important Links -->
          <div class="flex flex-col items-center text-center">
            <div class="w-full flex flex-col items-center">
              <h4 class="text-sm sm:text-base font-bold text-white !text-white mb-4 tracking-wide" style="color: #ffffff !important;">Important Links</h4>
              <ul class="space-y-2.5 text-xs sm:text-sm mb-4 flex flex-col items-center">
                <li><a href="https://rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" title="Redirects to Rajasthan Government site" class="text-slate-200 !text-slate-200 hover:!text-amber-400 hover:underline transition-colors" style="color: #e2e8f0 !important;">Rajasthan Government</a></li>
                <li><a href="https://livelihoods.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" title="Redirects to RSLDC Official Portal" class="text-slate-200 !text-slate-200 hover:!text-amber-400 hover:underline transition-colors" style="color: #e2e8f0 !important;">RSLDC Official Portal</a></li>
                <li><a (click)="downloadSamplePdf('Privacy_Policy.pdf', 'Privacy Policy')" class="text-slate-200 !text-slate-200 hover:!text-amber-400 hover:underline transition-colors cursor-pointer" style="color: #e2e8f0 !important;">Privacy Policy</a></li>
                <li><a (click)="downloadSamplePdf('Terms_and_Conditions.pdf', 'Terms & Conditions')" class="text-slate-200 !text-slate-200 hover:!text-amber-400 hover:underline transition-colors cursor-pointer" style="color: #e2e8f0 !important;">Terms & Conditions</a></li>
              </ul>
              
              <div class="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs sm:text-[13px] text-slate-300 font-medium pt-4 border-t border-slate-700/50 w-full mt-auto">
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-300">Total Visitors:</span>
                  <span class="text-white font-mono font-bold" style="color: #ffffff !important;">042,159</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-slate-500 hidden sm:block"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-300">Last Updated:</span>
                  <span class="text-white font-medium" style="color: #ffffff !important;">21 Sep 2026</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 3: Connect With Us -->
          <div class="flex flex-col items-center md:items-end text-center md:text-right">
            <div>
              <h4 class="text-sm sm:text-base font-bold text-white !text-white mb-3" style="color: #ffffff !important;">Connect With Us</h4>
              <div class="flex items-center justify-center md:justify-end gap-3 mb-5">
                <a [href]="helplineGlobal.social.facebook" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-amber-400 transition-colors" aria-label="Facebook">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>
                <a [href]="helplineGlobal.social.twitter" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-amber-400 transition-colors" aria-label="Twitter">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a [href]="helplineGlobal.social.linkedin" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-amber-400 transition-colors" aria-label="LinkedIn">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a [href]="helplineGlobal.social.instagram" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-amber-400 transition-colors" aria-label="Instagram">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/></svg>
                </a>
              </div>

              <h4 class="text-xs font-bold text-amber-400 !text-amber-400 uppercase tracking-wider mb-2" style="color: #fbbf24 !important;">Helpline Contacts</h4>
              <div class="space-y-2 text-xs text-slate-200">
                <div class="flex items-center justify-center md:justify-end gap-2">
                  <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-slate-200 font-semibold" style="color: #f1f5f9 !important;">{{ helplineGlobal.contacts.phone }}</span>
                </div>
                <div class="flex items-center justify-center md:justify-end gap-2">
                  <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-slate-200 font-semibold" style="color: #f1f5f9 !important;">{{ helplineGlobal.contacts.email }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Tier 3: Bottom Bar -->
      <div class="border-t border-slate-700/50 bg-[#0c1828]">
        <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div class="flex justify-center items-center text-[11px] sm:text-xs text-slate-400">
            <div class="text-center">
              &copy; 2026 Government of Rajasthan. All rights reserved (ISMS 2.0)
            </div>
          </div>
        </div>
      </div>

    </footer>
  `
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  
  helplineGlobal = HELPLINE_GLOBAL;

  @ViewChild('footerRef') footerRef?: ElementRef<HTMLElement>;

  readonly isHovering = signal(false);
  readonly isVisible = signal(false);
  readonly isTabActive = signal(true);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isVisible() && this.isTabActive() && !this.isHovering();
  };

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.footerRef?.nativeElement;
    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isVisible.set(entry.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
      this.observer.observe(el);
    }

    this.visibilityHandler = () => {
      this.isTabActive.set(!document.hidden);
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  downloadSamplePdf(fileName: string, title: string) {
    const pdfContent = `This is a sample PDF document for ${title}.\n\nISMS 2.0 Official Document.`;
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
