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
    class: 'block w-full bg-[#070e18]'
  },
  styles: [`
    @keyframes scroll {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(calc(-50% - 0.75rem), 0, 0);
      }
    }
    .animate-scroll {
      animation: scroll 28s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
    }
    @media (prefers-reduced-motion: reduce) {
      .animate-scroll {
        animation: none !important;
      }
    }
    .mask-fade {
      mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
    }
    .footer-link,
    .footer-link:visited,
    .footer-contact,
    .footer-contact:visited {
      color: #e2e8f0 !important;
      text-decoration: none;
    }
    .footer-link:hover,
    .footer-contact:hover {
      color: #F59E0B !important;
      text-decoration: underline;
    }
    .footer-social-btn {
      color: #12223a !important;
      background-color: #ffffff !important;
    }
    .footer-social-btn:hover {
      color: #ffffff !important;
      background-color: #F59E0B !important;
    }
  `],
  template: `
    <footer #footerRef 
      class="relative w-full font-['Inter',sans-serif] bg-[#0c1828] text-slate-300 border-t border-slate-700 select-none overflow-hidden" 
      aria-label="Portal Footer">

      <!-- Background Image Layer: Rajasthan Forts & Palaces Heritage Silhouette (FOOTER BACKGROUND.png) - Prominently Visible -->
      <div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img 
          src="/footer-images/FOOTER%20BACKGROUND.png" 
          alt="Rajasthan Heritage Skyline" 
          aria-hidden="true"
          class="w-full h-full object-cover object-bottom opacity-90"
          loading="lazy"
        />
        <!-- Soft gradient overlay keeping the skyline vividly visible while preserving text contrast -->
        <div class="absolute inset-0 bg-linear-to-b from-[#0c1828]/50 via-transparent to-[#070e18]/65"></div>
      </div>

      <!-- Foreground Content Layer -->
      <div class="relative z-10 w-full">

        <!-- Tier 1: Other Important Links -->
        <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          <!-- Section Heading with Flanking Saffron/Amber Accents -->
          <div class="flex items-center justify-center gap-3 sm:gap-5 mb-7 sm:mb-9">
            <div class="h-px flex-1 max-w-30 bg-linear-to-l from-[#F59E0B] to-transparent"></div>
            <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide font-['Inter',sans-serif] m-0 whitespace-nowrap">
              Other Important Links
            </h2>
            <div class="h-px flex-1 max-w-30 bg-linear-to-r from-[#F59E0B] to-transparent"></div>
          </div>

          <!-- Mobile View: Balanced Two-Column Responsive Grid (< 640px) -->
          <div class="block sm:hidden max-w-sm mx-auto">
            <div class="grid grid-cols-2 gap-3">
              <!-- BIS Care -->
              <a
                href="https://bis.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="BIS Care App"
                aria-label="Bureau of Indian Standards BIS Care App (opens in a new tab)"
                class="w-full bg-white rounded-2xl h-20 flex items-center justify-center p-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/20">
                <img
                  src="/footer-images/bis-care.png"
                  alt="BIS Care App"
                  class="max-h-full max-w-full object-contain"
                  loading="lazy"
                  onerror="this.src='/footer-images/bis.png'"
                />
              </a>

              <!-- ACB -->
              <a
                href="https://acb.rajasthan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="Anti Corruption Bureau"
                aria-label="Anti Corruption Bureau Government of Rajasthan (opens in a new tab)"
                class="w-full bg-white rounded-2xl h-20 flex items-center justify-center p-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/20">
                <img
                  src="/footer-images/acb.png"
                  alt="Anti Corruption Bureau"
                  class="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </a>

              <!-- Pledge -->
              <a
                href="https://pledge.mygov.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="Register for Pledge"
                aria-label="Register for Pledge MyGov Portal (opens in a new tab)"
                class="w-full bg-white rounded-2xl h-20 flex items-center justify-center p-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/20">
                <img
                  src="/footer-images/pledge.jpeg"
                  alt="Register for Pledge"
                  class="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </a>

              <!-- Jan Soochna -->
              <a
                href="https://jansoochna.rajasthan.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                title="Jan Soochna Portal"
                aria-label="Jan Soochna Portal Government of Rajasthan (opens in a new tab)"
                class="w-full bg-white rounded-2xl h-20 flex items-center justify-center p-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/20">
                <img
                  src="/footer-images/jansoochna.png"
                  alt="Jan Soochna Portal"
                  class="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </a>
            </div>
          </div>

          <!-- Desktop & Tablet View: Accessible Infinite Marquee Carousel (>= 640px) -->
          <div class="hidden sm:block relative max-w-6xl mx-auto">
            <div
              class="flex-1 overflow-hidden mask-fade relative cursor-pointer"
              (mouseenter)="isHovering.set(true)"
              (mouseleave)="isHovering.set(false)"
              (touchstart)="isHovering.set(true)"
              (touchend)="isHovering.set(false)">

              <div
                class="flex gap-4 sm:gap-5 w-max animate-scroll py-1"
                [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'">

                <!-- Set 1 (Original) -->
                <a
                  href="https://bis.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="BIS Care App"
                  aria-label="Bureau of Indian Standards BIS Care App (opens in a new tab)"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/bis-care.png"
                    alt="BIS Care App"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                    onerror="this.src='/footer-images/bis.png'"
                  />
                </a>

                <a
                  href="https://acb.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Anti Corruption Bureau"
                  aria-label="Anti Corruption Bureau Government of Rajasthan (opens in a new tab)"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/acb.png"
                    alt="Anti Corruption Bureau"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://pledge.mygov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Register for Pledge"
                  aria-label="Register for Pledge MyGov Portal (opens in a new tab)"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/pledge.jpeg"
                    alt="Register for Pledge"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://jansoochna.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Jan Soochna Portal"
                  aria-label="Jan Soochna Portal Government of Rajasthan (opens in a new tab)"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/jansoochna.png"
                    alt="Jan Soochna Portal"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>

                <!-- Set 2 (Duplicate for seamless loop) -->
                <a
                  href="https://bis.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="BIS Care App"
                  aria-hidden="true"
                  tabindex="-1"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/bis-care.png"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                    onerror="this.src='/footer-images/bis.png'"
                  />
                </a>

                <a
                  href="https://acb.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Anti Corruption Bureau"
                  aria-hidden="true"
                  tabindex="-1"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/acb.png"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://pledge.mygov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Register for Pledge"
                  aria-hidden="true"
                  tabindex="-1"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/pledge.jpeg"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>

                <a
                  href="https://jansoochna.rajasthan.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Jan Soochna Portal"
                  aria-hidden="true"
                  tabindex="-1"
                  class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20">
                  <img
                    src="/footer-images/jansoochna.png"
                    alt=""
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>

            <!-- Pause / Play Accessibility Button -->
            <div class="flex justify-center mt-3">
              <button
                type="button"
                (click)="togglePause()"
                [attr.aria-label]="isPausedManually() ? 'Resume animation' : 'Pause animation'"
                class="inline-flex items-center gap-1.5 px-3 py-1 rounded text-[12px] font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] cursor-pointer">
                @if (isPausedManually()) {
                  <svg class="w-3.5 h-3.5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <span>Resume Animation</span>
                } @else {
                  <svg class="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  <span>Pause Animation</span>
                }
              </button>
            </div>
          </div>

        </div>

        <!-- Subtle Section Divider -->
        <div class="w-full h-px bg-slate-700/50"></div>

        <!-- Tier 2: Main Footer Columns -->
        <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 sm:pt-14 sm:pb-10">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-14 items-start">

            <!-- Column 1: Branding & Identity -->
            <div class="flex flex-col items-center md:items-start text-center md:text-left">
              <div class="flex items-center gap-3.5 mb-4">
                <img
                  src="/footer-images/emblem-white.png"
                  alt="Government of Rajasthan Emblem"
                  class="h-12 sm:h-14 w-auto object-contain"
                  loading="lazy"
                  onerror="this.src='/Rajasthan-Sarkar.png'"
                />
                <img
                  src="/footer-images/rsldc-logo.png"
                  alt="RSLDC"
                  class="h-10 sm:h-12 w-auto object-contain"
                  loading="lazy"
                  onerror="this.src='/rsldc-logo.png'"
                />
              </div>

              <!-- ISMS 2.0 Brand Wordmark -->
              <div class="text-[1.75rem] font-black text-white tracking-tight leading-none font-['Inter',sans-serif] mb-1.5">
                ISMS <span class="text-[#F59E0B]">2.0</span>
              </div>

              <!-- Subtitle -->
              <div class="text-[0.875rem] font-bold text-white mb-2.5 font-['Inter',sans-serif]">
                Integrated Scheme Management System
              </div>

              <!-- Organisation Address / Department Hierarchy -->
              <div class="text-[0.8125rem] text-[#cbd5e1] leading-relaxed font-['Inter',sans-serif]">
                Rajasthan Skill &amp; Livelihoods Development Corporation<br/>
                Department of Skill, Employment and Entrepreneurship<br/>
                Government of Rajasthan
              </div>
            </div>

            <!-- Column 2: Important Links + Dynamic Counters -->
            <div class="flex flex-col items-center w-full">
              <div class="flex flex-col items-start text-left w-fit">
                
                <!-- Section Heading -->
                <div class="text-[0.9375rem] font-bold text-white mb-4 tracking-wider uppercase font-['Inter',sans-serif]">
                  Important Links
                </div>

                <!-- Clean, High-Contrast Links (No dark dots, pure crisp text) -->
                <ul class="space-y-3 flex flex-col items-start list-none p-0 m-0">
                  <li>
                    <a
                      href="https://rajasthan.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="footer-link text-[0.875rem] font-['Inter',sans-serif] cursor-pointer"
                      aria-label="Rajasthan Government Official Portal (opens in a new tab)">
                      Rajasthan Government
                    </a>
                  </li>

                  <li>
                    <a
                      href="https://livelihoods.rajasthan.gov.in/"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="footer-link text-[0.875rem] font-['Inter',sans-serif] cursor-pointer"
                      aria-label="RSLDC Official Portal (opens in a new tab)">
                      RSLDC
                    </a>
                  </li>

                  <li>
                    <button
                      type="button"
                      (click)="downloadSamplePdf('Privacy_Policy.pdf', 'Privacy Policy')"
                      class="footer-link text-[0.875rem] font-['Inter',sans-serif] cursor-pointer bg-transparent border-0 p-0 text-left"
                      aria-label="Download Privacy Policy document">
                      Privacy Policy
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      (click)="downloadSamplePdf('Terms_and_Conditions.pdf', 'Terms & Conditions')"
                      class="footer-link text-[0.875rem] font-['Inter',sans-serif] cursor-pointer bg-transparent border-0 p-0 text-left"
                      aria-label="Download Terms & Conditions document">
                      Terms &amp; Conditions
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      (click)="downloadSamplePdf('Help_and_Support.pdf', 'Help & Support')"
                      class="footer-link text-[0.875rem] font-['Inter',sans-serif] cursor-pointer bg-transparent border-0 p-0 text-left"
                      aria-label="Help & Support documentation">
                      Help &amp; Support
                    </button>
                  </li>
                </ul>

                <!-- Dynamic Visitor Counter & Last Updated -->
                <div class="flex flex-row flex-wrap items-center gap-4 mt-8 border-t border-slate-700/50 pt-4 w-fit max-w-full">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[0.8125rem] text-slate-400 font-['Inter',sans-serif]">Total Visitors:</span>
                    <span class="text-[0.875rem] text-white font-bold font-['Inter',sans-serif] tabular-nums">042,159</span>
                  </div>
                  <div class="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"></div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[0.8125rem] text-slate-400 font-['Inter',sans-serif]">Last Updated:</span>
                    <span class="text-[0.875rem] text-white font-semibold font-['Inter',sans-serif]">8 Oct 2026</span>
                  </div>
                </div>

              </div>
            </div>

            <!-- Column 3: Connect With Us & Helpline -->
            <div class="flex flex-col items-start text-left md:ml-auto w-fit">
              <!-- Connect With Us -->
              <div class="text-[0.9375rem] font-bold text-white mb-3.5 tracking-wider uppercase font-['Inter',sans-serif]">
                Connect With Us
              </div>

              <!-- Social Media Buttons -->
              <div class="flex items-center justify-start gap-3 mb-7">
                <!-- YouTube -->
                <a
                  [href]="helplineGlobal.social.youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-social-btn w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  aria-label="YouTube">
                  <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                </a>

                <!-- Twitter / X -->
                <a
                  [href]="helplineGlobal.social.twitter"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-social-btn w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  aria-label="Twitter">
                  <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>

                <!-- LinkedIn -->
                <a
                  [href]="helplineGlobal.social.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-social-btn w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  aria-label="LinkedIn">
                  <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>

                <!-- Facebook -->
                <a
                  [href]="helplineGlobal.social.facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="footer-social-btn w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                  aria-label="Facebook">
                  <svg class="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>

              <!-- Helpline Section -->
              <div class="text-[0.9375rem] font-bold text-white mb-3.5 tracking-wider uppercase font-['Inter',sans-serif]">
                Helpline
              </div>

              <div class="space-y-3">
                <!-- Telephone -->
                <a
                  [href]="'tel:' + helplineGlobal.contacts.phone"
                  class="footer-contact flex items-center gap-2.5 cursor-pointer group"
                  aria-label="Call ISMS Helpline">
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-[#F59E0B] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="text-[0.875rem] font-semibold font-['Inter',sans-serif]">{{ helplineGlobal.contacts.phone }}</span>
                </a>

                <!-- Email -->
                <a
                  [href]="'mailto:' + helplineGlobal.contacts.email"
                  class="footer-contact flex items-center gap-2.5 cursor-pointer group"
                  aria-label="Email ISMS Support">
                  <svg class="w-4 h-4 text-slate-400 group-hover:text-[#F59E0B] shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="text-[0.875rem] font-semibold font-['Inter',sans-serif] break-all sm:break-normal">{{ helplineGlobal.contacts.email }}</span>
                </a>
              </div>

            </div>

          </div>
        </div>

        <!-- Tier 3: Bottom Copyright Bar -->
        <div class="border-t border-slate-700/50 bg-[#070e18]">
          <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-center items-center">
              <div class="text-[0.8125rem] text-slate-400 text-center font-['Inter',sans-serif]">
                &copy; 2026 Government of Rajasthan. All rights reserved (ISMS 2.0)
              </div>
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
  readonly isPausedManually = signal(false);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isVisible() && this.isTabActive() && !this.isHovering() && !this.isPausedManually();
  };

  togglePause(): void {
    this.isPausedManually.update((v) => !v);
  }

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

  downloadSamplePdf(fileName: string, title: string): void {
    const pdfContent = `This is a sample PDF document for ${title}.\n\nISMS 2.0 Official Document.\nGovernment of Rajasthan / RSLDC.`;
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
