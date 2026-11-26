import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HELPLINE_GLOBAL } from '../../../shared/helpline-global';
import { UserManualPdfService } from '../../services/user-manual-pdf.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import type { SolidIconName } from '../../../shared/components/icon/icons.solid';
import { EXTERNAL_LEGAL_URL } from '../sidebar/sidebar-nav.config';

interface PartnerBannerLink {
  href: string;
  title: string;
  ariaLabel: string;
  imgSrc: string;
  fallbackSrc?: string;
}

interface SocialMediaLink {
  href: string;
  label: string;
  icon: SolidIconName;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, ButtonComponent, IconComponent],
  host: {
    class: 'block w-full bg-[#1A020E]'
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
      animation: scroll 26s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
      transform: translate3d(0, 0, 0);
    }
    .marquee-viewport:hover .animate-scroll {
      animation-play-state: paused;
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
      color: #5E0832 !important;
      background-color: #ffffff !important;
    }
    .footer-social-btn:hover {
      color: #ffffff !important;
      background-color: #F59E0B !important;
    }
  `],
  template: `
    <footer
      class="relative w-full font-sans bg-[#2D0418] text-slate-200 border-t border-[#7C0E44]/40 select-none overflow-hidden"
      aria-label="Portal Footer"
    >
      <!-- Background Image Layer: Rajasthan Forts & Palaces Heritage Silhouette (Pure Burgundy & Rose Tones) -->
      <div class="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        <img
          src="/footer-images/FOOTER%20BACKGROUND.png"
          alt="Rajasthan Heritage Skyline"
          aria-hidden="true"
          class="w-full h-full object-cover object-bottom opacity-90"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-linear-to-b from-[#2D0418]/50 via-transparent to-[#1A020E]/65"></div>
      </div>

      <!-- Foreground Content Layer -->
      <div class="relative z-10 w-full">
        <!-- Tier 1: Other Important Links -->
        <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div class="flex items-center justify-center gap-3 sm:gap-5 mb-7 sm:mb-9">
            <div class="h-px flex-1 max-w-30 bg-linear-to-l from-[#F59E0B] to-transparent"></div>
            <h2 class="text-xl sm:text-2xl font-bold text-white tracking-wide font-sans m-0 whitespace-nowrap">
              Other Important Links
            </h2>
            <div class="h-px flex-1 max-w-30 bg-linear-to-r from-[#F59E0B] to-transparent"></div>
          </div>

          <!-- Mobile View: Balanced Two-Column Responsive Grid (< 640px) -->
          <div class="block sm:hidden max-w-sm mx-auto">
            <div class="grid grid-cols-2 gap-3">
              @for (item of partnerLinks; track item.href) {
                <a
                  [href]="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  [title]="item.title"
                  [attr.aria-label]="item.ariaLabel"
                  class="w-full bg-white rounded-2xl h-20 flex items-center justify-center p-2.5 shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/20"
                >
                  <img
                    [src]="item.imgSrc"
                    [alt]="item.title"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                    (error)="onPartnerImgError($event, item.fallbackSrc)"
                  />
                </a>
              }
            </div>
          </div>

          <!-- Desktop & Tablet View: Auto-Playing Infinite Marquee Carousel (>= 640px, no play/pause button) -->
          <div class="hidden sm:block relative max-w-6xl mx-auto">
            <div class="marquee-viewport flex-1 overflow-hidden mask-fade relative">
              <div class="flex gap-4 sm:gap-5 w-max animate-scroll py-1">
                @for (isDuplicate of [false, true]; track isDuplicate) {
                  @for (item of partnerLinks; track item.href) {
                    <a
                      [href]="item.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      [title]="item.title"
                      [attr.aria-label]="isDuplicate ? null : item.ariaLabel"
                      [attr.aria-hidden]="isDuplicate ? 'true' : null"
                      [attr.tabindex]="isDuplicate ? -1 : null"
                      class="w-45 sm:w-55 bg-white rounded-2xl h-20 sm:h-24 flex items-center justify-center p-2 sm:p-3 shrink-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border border-white/20"
                    >
                      <img
                        [src]="item.imgSrc"
                        [alt]="isDuplicate ? '' : item.title"
                        class="max-h-full max-w-full object-contain"
                        loading="lazy"
                        (error)="onPartnerImgError($event, item.fallbackSrc)"
                      />
                    </a>
                  }
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Subtle Section Divider -->
        <div class="w-full h-px bg-[#7C0E44]/40"></div>

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

              <div class="text-[1.75rem] font-black text-white tracking-tight leading-none font-sans mb-1.5">
                ISMS <span class="text-[#F59E0B]">2.0</span>
              </div>

              <div class="text-[0.875rem] font-bold text-white mb-2.5 font-sans">
                Integrated Scheme Management System
              </div>

              <div class="text-[0.8125rem] text-slate-300 leading-relaxed font-sans">
                Rajasthan Skill &amp; Livelihoods Development Corporation<br />
                Department of Skill, Employment and Entrepreneurship<br />
                Government of Rajasthan
              </div>
            </div>

            <!-- Column 2: Important Links + Dynamic Counters -->
            <div class="flex flex-col items-center w-full">
              <div class="flex flex-col items-start text-left w-fit">
                <div class="text-[0.9375rem] font-bold text-white mb-4 tracking-wider uppercase font-sans">
                  Important Links
                </div>

                <ul class="space-y-3 flex flex-col items-start list-none p-0 m-0">
                  @for (link of externalPortalLinks; track link.label) {
                    <li>
                      <a
                        [href]="link.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="footer-link text-[0.875rem] font-sans cursor-pointer"
                        [attr.aria-label]="link.ariaLabel"
                      >
                        {{ link.label }}
                      </a>
                    </li>
                  }

                  @for (legal of legalLinks; track legal.label) {
                    <li>
                      <!-- ui-guard-allow: footer links are text-like, zero padding -->
                      <a
                        appButton
                        variant="inverse"
                        [href]="externalLegalUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="footer-link h-auto px-0 text-left"
                        [attr.aria-label]="legal.ariaLabel"
                      >
                        {{ legal.label }}
                      </a>
                    </li>
                  }

                  <li>
                    <!-- ui-guard-allow: footer links are text-like, zero padding -->
                    <a
                      appButton
                      variant="inverse"
                      routerLink="/help-support"
                      class="footer-link h-auto px-0 text-left"
                      aria-label="View Help & Support"
                    >
                      Help &amp; Support
                    </a>
                  </li>
                </ul>

                <!-- Dynamic Visitor Counter & Last Updated -->
                <div class="flex flex-row flex-wrap items-center gap-4 mt-8 border-t border-[#7C0E44]/40 pt-4 w-fit max-w-full">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[0.8125rem] text-slate-400 font-sans">Total Visitors:</span>
                    <span class="text-[0.875rem] text-white font-bold font-sans tabular-nums">042,159</span>
                  </div>
                  <div class="w-1 h-1 rounded-full bg-[#AA5E7A]/60 hidden sm:block"></div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[0.8125rem] text-slate-400 font-sans">Last Updated:</span>
                    <span class="text-[0.875rem] text-white font-semibold font-sans">8 Oct 2026</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Column 3: Connect With Us & Helpline -->
            <div class="flex flex-col items-start text-left md:ml-auto w-fit">
              <div class="text-[0.9375rem] font-bold text-white mb-3.5 tracking-wider uppercase font-sans">
                Connect With Us
              </div>

              <div class="flex items-center justify-start gap-3 mb-7">
                @for (social of socialLinks; track social.label) {
                  <a
                    [href]="social.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="footer-social-btn w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer"
                    [attr.aria-label]="social.label"
                  >
                    <app-icon [name]="social.icon" solid size="md" />
                  </a>
                }
              </div>

              <div class="text-[0.9375rem] font-bold text-white mb-3.5 tracking-wider uppercase font-sans">
                Helpline
              </div>

              <div class="space-y-3">
                <a
                  [href]="'tel:' + helplineGlobal.contacts.phone"
                  class="footer-contact flex items-center gap-2.5 cursor-pointer group"
                  aria-label="Call ISMS Helpline"
                >
                  <app-icon name="phone" [stroke]="2" class="text-slate-400 group-hover:text-[#F59E0B] shrink-0 transition-colors" />
                  <span class="text-[0.875rem] font-semibold font-sans">{{ helplineGlobal.contacts.phone }}</span>
                </a>

                <a
                  [href]="'mailto:' + helplineGlobal.contacts.email"
                  class="footer-contact flex items-center gap-2.5 cursor-pointer group"
                  aria-label="Email ISMS Support"
                >
                  <app-icon name="mail" [stroke]="2" class="text-slate-400 group-hover:text-[#F59E0B] shrink-0 transition-colors" />
                  <span class="text-[0.875rem] font-semibold font-sans break-all sm:break-normal">{{ helplineGlobal.contacts.email }}</span>
                </a>
              </div>

              <div class="mt-5 w-full">
                <button
                  appButton
                  variant="inverse"
                  block
                  type="button"
                  (click)="downloadUserManual()"
                  [disabled]="isGeneratingManual()"
                  class="group h-auto p-0 text-left hover:no-underline"
                  aria-label="Download ISMS 2.0 User Manual"
                >
                  <div class="w-full flex items-center gap-3 rounded-xl border border-amber-500/30 bg-[#2D0318]/70 p-3 whitespace-normal transition-colors group-hover:border-amber-400/60 group-hover:bg-[#1A020E]">
                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="text-[0.875rem] font-bold text-white group-hover:text-amber-300 transition-colors">
                          Download User Manual
                        </span>
                        <span class="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          PDF
                        </span>
                      </div>
                      <span class="text-[0.75rem] text-slate-300 leading-tight">
                        How ISMS 2.0 works &amp; step-by-step guide
                      </span>
                    </div>
                    <app-icon name="chevron-right" [stroke]="2" class="text-slate-400 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all ml-auto shrink-0" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tier 3: Bottom Copyright Bar -->
        <div class="border-t border-[#7C0E44]/40 bg-[#1A020E]">
          <div class="max-w-360 mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="flex justify-center items-center">
              <div class="text-[0.8125rem] text-slate-400 text-center font-sans">
                &copy; 2026 Government of Rajasthan. All rights reserved (ISMS 2.0)
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private readonly userManualService = inject(UserManualPdfService);

  readonly helplineGlobal = HELPLINE_GLOBAL;
  readonly externalLegalUrl = EXTERNAL_LEGAL_URL;
  readonly isGeneratingManual = signal(false);

  protected readonly partnerLinks: readonly PartnerBannerLink[] = [
    {
      href: 'https://bis.gov.in/',
      title: 'BIS Care App',
      ariaLabel: 'Bureau of Indian Standards BIS Care App (opens in a new tab)',
      imgSrc: '/footer-images/bis-care.png',
      fallbackSrc: '/footer-images/bis.png'
    },
    {
      href: 'https://acb.rajasthan.gov.in/',
      title: 'Anti Corruption Bureau',
      ariaLabel: 'Anti Corruption Bureau Government of Rajasthan (opens in a new tab)',
      imgSrc: '/footer-images/acb.png'
    },
    {
      href: 'https://pledge.mygov.in/',
      title: 'Register for Pledge',
      ariaLabel: 'Register for Pledge MyGov Portal (opens in a new tab)',
      imgSrc: '/footer-images/pledge.jpeg'
    },
    {
      href: 'https://jansoochna.rajasthan.gov.in/',
      title: 'Jan Soochna Portal',
      ariaLabel: 'Jan Soochna Portal Government of Rajasthan (opens in a new tab)',
      imgSrc: '/footer-images/jansoochna.png'
    }
  ];

  protected readonly externalPortalLinks = [
    {
      label: 'Rajasthan Government',
      href: 'https://rajasthan.gov.in/',
      ariaLabel: 'Rajasthan Government Official Portal (opens in a new tab)'
    },
    {
      label: 'RSLDC',
      href: 'https://livelihoods.rajasthan.gov.in/',
      ariaLabel: 'RSLDC Official Portal (opens in a new tab)'
    }
  ] as const;

  protected readonly legalLinks = [
    { label: 'Privacy Policy', ariaLabel: 'View Privacy Policy (opens in a new tab)' },
    { label: 'Terms & Conditions', ariaLabel: 'View Terms & Conditions (opens in a new tab)' }
  ] as const;

  protected readonly socialLinks: readonly SocialMediaLink[] = [
    { href: this.helplineGlobal.social.youtube, label: 'YouTube', icon: 'youtube' },
    { href: this.helplineGlobal.social.twitter, label: 'Twitter', icon: 'x-twitter' },
    { href: this.helplineGlobal.social.linkedin, label: 'LinkedIn', icon: 'linkedin' },
    { href: this.helplineGlobal.social.facebook, label: 'Facebook', icon: 'facebook' }
  ];

  protected onPartnerImgError(event: Event, fallbackSrc?: string): void {
    if (!fallbackSrc) return;
    const img = event.target as HTMLImageElement | null;
    if (img && !img.src.endsWith(fallbackSrc)) {
      img.src = fallbackSrc;
    }
  }

  async downloadUserManual(): Promise<void> {
    if (this.isGeneratingManual()) return;
    this.isGeneratingManual.set(true);
    try {
      await this.userManualService.generateUserManualPdf();
    } catch (err) {
      console.error('Failed to generate user manual PDF:', err);
    } finally {
      this.isGeneratingManual.set(false);
    }
  }
}
