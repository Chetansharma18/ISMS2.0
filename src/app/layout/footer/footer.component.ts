import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="w-full bg-[#001f3f] text-white select-none border-t border-slate-700/50">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-8 lg:gap-10">
          
          <!-- Col 1: Logos & System Identity (lg:col-span-5) -->
          <div class="lg:col-span-5 flex flex-col justify-start space-y-3">
            <div class="flex items-center gap-3.5">
              <img 
                src="footer-images/emblem-white.png" 
                alt="State Emblem of India" 
                class="h-10 sm:h-11 w-auto object-contain shrink-0" 
              />
              <img 
                src="footer-images/rsldc-logo.png" 
                alt="RSLDC Logo" 
                class="h-10 sm:h-11 w-auto object-contain shrink-0 drop-shadow-sm" 
              />
              <div class="h-8 w-[1px] bg-slate-600/70 mx-1"></div>
              <div class="flex items-baseline leading-none">
                <span class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">ISMS</span>
                <span class="text-xl sm:text-2xl font-extrabold text-[#f59e0b] ml-1">2.0</span>
              </div>
            </div>

            <p class="text-xs sm:text-[12.5px] text-slate-300 leading-relaxed max-w-md">
              {{ t().footer.ismsSubtitle }}
            </p>

            <div class="text-[11px] text-slate-400/90 pt-1">
              Skill, Employment &amp; Entrepreneurship Department · Government of Rajasthan
            </div>
          </div>

          <!-- Col 2: Important Links (lg:col-span-3) -->
          <div class="lg:col-span-3 space-y-2.5">
            <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
              {{ t().footer.importantLinks }}
            </h4>
            <ul class="space-y-1.5 text-xs text-slate-300">
              <li>
                <a href="https://rajasthan.gov.in" target="_blank" rel="noopener noreferrer"
                  class="hover:text-amber-400 transition-colors inline-block py-0.5">
                  {{ t().footer.rajGovt }}
                </a>
              </li>
              <li>
                <a href="https://livelihoods.rajasthan.gov.in" target="_blank" rel="noopener noreferrer"
                  class="hover:text-amber-400 transition-colors inline-block py-0.5">
                  {{ t().footer.rsldc }}
                </a>
              </li>
              <li>
                <a href="#privacy" class="hover:text-amber-400 transition-colors inline-block py-0.5">
                  {{ t().footer.privacy }}
                </a>
              </li>
              <li>
                <a href="#terms" class="hover:text-amber-400 transition-colors inline-block py-0.5">
                  {{ t().footer.terms }}
                </a>
              </li>
            </ul>
          </div>

          <!-- Col 3: Helpline & Compliance (lg:col-span-4) -->
          <div class="lg:col-span-4 space-y-2.5">
            <h4 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
              {{ t().footer.helpline }}
            </h4>
            
            <div class="space-y-1 text-xs text-slate-300">
              <div class="flex items-center gap-2">
                <span class="text-slate-400">Toll Free:</span>
                <a href="tel:0141xxxxxxx" class="hover:text-white transition-colors font-medium">0141-xxxxxxx</a>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-400">Email:</span>
                <a href="mailto:support@isms.rajasthan.gov.in" class="hover:text-white transition-colors font-medium">support&#64;isms.rajasthan.gov.in</a>
              </div>
            </div>

            <div class="pt-2 text-[11px] text-slate-400/80 leading-relaxed border-t border-slate-700/50">
              🔒 STQC Certified · RTPP Act 2012 Compliant · Jaipur State Data Centre (Jaipur-DC-02)
            </div>
          </div>

        </div>

        <!-- Bottom Copyright & Back-to-top Bar -->
        <div class="mt-8 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 Government of Rajasthan. All rights reserved. (ISMS 2.0)
          </div>
          <button 
            type="button" 
            (click)="scrollToTop()" 
            class="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-[11.5px]">
            <span>Back to top</span>
            <span>↑</span>
          </button>
        </div>

      </div>
    </footer>
  `
})
export class FooterComponent {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
