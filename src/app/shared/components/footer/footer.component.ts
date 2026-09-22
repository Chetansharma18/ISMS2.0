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

          <!-- Infinite Marquee Track -->
          <div class="flex-1 overflow-hidden mask-fade relative">
            <div class="flex gap-4 w-max animate-scroll">
              <!-- Set 1 (Original) -->
              <a href="https://bis.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" onerror="this.src='/footer-images/bis.png'">
              </a>
              <a href="https://acb.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain">
              </a>
              <a href="https://pledge.mygov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain">
              </a>
              <a href="https://jansoochna.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain">
              </a>

              <!-- Set 2 (Duplicated for Loop) -->
              <a href="https://bis.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/bis-care.png" alt="BIS Care App" class="max-h-full max-w-full object-contain" onerror="this.src='/footer-images/bis.png'">
              </a>
              <a href="https://acb.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/acb.png" alt="Anti Corruption Bureau" class="max-h-full max-w-full object-contain">
              </a>
              <a href="https://pledge.mygov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/pledge.jpeg" alt="Register for Pledge" class="max-h-full max-w-full object-contain">
              </a>
              <a href="https://jansoochna.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="w-[200px] sm:w-[250px] bg-white rounded-xl h-28 flex items-center justify-center p-4 shrink-0 hover:shadow-lg transition-shadow cursor-pointer block">
                <img src="/footer-images/jansoochna.png" alt="Jan Soochna Portal" class="max-h-full max-w-full object-contain">
              </a>
            </div>
          </div>

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
              Rajasthan Skill &amp; Livelihoods Development Corporation<br/>
              Department of Skill, Employment and Entrepreneurship<br/>
              Government of Rajasthan
            </p>
          </div>

          <!-- Column 2: Important Links -->
          <div class="flex flex-col items-center text-center">
            <div class="w-full flex flex-col items-center">
              <h4 class="text-sm font-bold text-white mb-5">Important Links</h4>
              <ul class="space-y-3 text-xs text-slate-300 mb-8 flex flex-col items-center">
                <li><a href="https://rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Rajasthan Government</a></li>
                <li><a href="https://livelihoods.rajasthan.gov.in/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">RSLDC</a></li>
                <li><a (click)="downloadSamplePdf('Privacy_Policy.pdf', 'Privacy Policy')" class="hover:text-white transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a (click)="downloadSamplePdf('Terms_and_Conditions.pdf', 'Terms & Conditions')" class="hover:text-white transition-colors cursor-pointer">Terms &amp; Conditions</a></li>
              </ul>
              
              <div class="flex flex-row justify-center items-center gap-3 sm:gap-4 text-[13px] text-slate-300 font-bold pt-4 border-t border-slate-700/50 w-full mt-auto whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <span>Total Visitors:</span>
                  <span class="text-white">042,159</span>
                </div>
                <div class="w-1 h-1 rounded-full bg-slate-500 hidden sm:block"></div>
                <div class="flex items-center gap-1.5">
                  <span>Last Updated:</span>
                  <span class="text-white">21 Sep 2026</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 3: Connect With Us -->
          <div class="flex flex-col items-start lg:items-end text-left lg:text-right">
            <div>
              <h4 class="text-sm font-bold text-white mb-4">Connect With Us</h4>
              <div class="flex items-center gap-3 mb-8 lg:justify-end">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#12223a] hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="white"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" stroke-width="2"/></svg>
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
                  <span>support&#64;isms.rajasthan.gov.in</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Tier 3: Bottom Bar -->
      <div class="border-t border-slate-700/50 bg-[#0c1828]">
        <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-center items-center text-xs text-slate-400">
            <div class="text-center">
              &copy; 2026 Government of Rajasthan. All rights reserved (ISMS 2.0)
            </div>
          </div>
        </div>
      </div>

    </footer>
  `
})
export class FooterComponent {
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
