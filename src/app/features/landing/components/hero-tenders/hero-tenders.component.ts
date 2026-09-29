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
import { RouterModule } from '@angular/router';
import { TendersModalComponent } from '../tenders-modal/tenders-modal.component';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-hero-tenders',
  standalone: true,
  imports: [CommonModule, RouterModule, TendersModalComponent],
  template: `
    <!-- Expanded Width Container with Perfect Fixed Height -->
    <div #tendersContainer class="w-full max-w-[520px] sm:max-w-[550px] lg:max-w-[580px] mx-auto lg:ml-auto relative">
      <div class="w-full h-[480px] sm:h-[520px] lg:h-[540px] bg-white rounded-2xl shadow-2xl border border-white/60 flex flex-col overflow-hidden relative z-20">
        
        <!-- Header -->
        <div class="bg-primary px-5 sm:px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm border-b border-[#07233B]" style="background-color: var(--color-primary, #174A6E);">
          <div class="flex items-center gap-2.5 text-white font-bold tracking-wide text-sm sm:text-base">
            <span>TENDER</span>
          </div>
          <button 
            type="button"
            (click)="isTendersModalOpen.set(true)" 
            class="bg-[#F6A820] hover:bg-[#d89218] text-slate-950 text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer focus:outline-none shadow-xs"
            aria-label="View all tenders in modal">
            View All &gt;
          </button>
        </div>

        <!-- Tenders List (Hardware-Accelerated Infinite Vertical Marquee) -->
        <div 
          class="flex-1 overflow-hidden relative cursor-pointer" 
          (mouseenter)="isHoveringTenders.set(true)" 
          (mouseleave)="isHoveringTenders.set(false)"
          (touchstart)="isHoveringTenders.set(true)"
          (touchend)="isHoveringTenders.set(false)">
          
          <div 
            class="absolute w-full animate-marquee-vertical" 
            [style.animation-play-state]="shouldAnimate() ? 'running' : 'paused'">
            
            <!-- Loop 1 -->
            <div class="flex flex-col gap-2.5 p-3">
              @for (item of tenders; track item.id) {
                <div 
                  (click)="openLoginPrompt(item)" 
                  class="relative p-3.5 sm:p-4 bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-xl hover:shadow-lg hover:border-blue-400 hover:bg-blue-50/70 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                  @if (item.isNew) {
                    <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-xl" />
                  }
                  <div class="flex justify-between items-center mb-1.5">
                    <span class="text-[10.5px] sm:text-[11.5px] text-slate-500 font-medium">{{ item.date }}</span>
                    <span class="text-[10px] font-semibold text-[#174A6E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                  </div>
                  <h4 class="text-xs sm:text-[13.5px] font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-blue-700 group-hover:underline group-hover:underline-offset-2 transition-all line-clamp-2">
                    {{ item.title }}
                  </h4>
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] text-slate-400 font-mono truncate max-w-[70%]">{{ item.id }}</p>
                    <span class="text-[11px] font-semibold text-amber-700 group-hover:text-amber-800 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login Required
                    </span>
                  </div>
                </div>
              }
            </div>
            
            <!-- Loop 2 (Duplicate for Seamless Scroll) -->
            <div class="flex flex-col gap-2.5 p-3 mt-2.5" aria-hidden="true">
              @for (item of tenders; track item.id + '-dup') {
                <div 
                  (click)="openLoginPrompt(item)" 
                  class="relative p-3.5 sm:p-4 bg-white border border-[#0B3558]/20 shadow-[0_0_15px_rgba(11,53,88,0.08)] rounded-xl hover:shadow-lg hover:border-blue-400 hover:bg-blue-50/70 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                  @if (item.isNew) {
                    <img src="/new.png" alt="New Tender" class="absolute -top-1.5 -left-1.5 w-11 h-11 object-cover z-10 pointer-events-none drop-shadow-sm rounded-tl-xl" />
                  }
                  <div class="flex justify-between items-center mb-1.5">
                    <span class="text-[10.5px] sm:text-[11.5px] text-slate-500 font-medium">{{ item.date }}</span>
                    <span class="text-[10px] font-semibold text-[#174A6E] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">{{ item.category }}</span>
                  </div>
                  <h4 class="text-xs sm:text-[13.5px] font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-blue-700 group-hover:underline group-hover:underline-offset-2 transition-all line-clamp-2">
                    {{ item.title }}
                  </h4>
                  <div class="flex items-center justify-between">
                    <p class="text-[10px] text-slate-400 font-mono truncate max-w-[70%]">{{ item.id }}</p>
                    <span class="text-[11px] font-semibold text-amber-700 group-hover:text-amber-800 flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Login Required
                    </span>
                  </div>
                </div>
              }
            </div>

          </div>

        </div>

      </div>
    </div>

    <!-- Login Required Alert Modal -->
    @if (showLoginModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <!-- Backdrop click closes -->
        <div class="absolute inset-0" (click)="closeLoginPrompt()"></div>

        <!-- Dialog Box -->
        <div class="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
          
          <!-- Icon & Heading -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <div class="flex-1">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                Login Required
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Please log in with your Rajasthan Single Sign-On (SSO) account to access tender notices, scheme information, and application forms.
              </p>
            </div>
          </div>

          <!-- Selected Tender Summary -->
          @if (selectedTender()) {
            <div class="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-left">
              <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#174A6E]/10 text-[#174A6E] mb-1">
                {{ selectedTender().category }}
              </span>
              <p class="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                {{ selectedTender().title }}
              </p>
              <p class="text-[10px] text-slate-400 font-mono mt-1">
                {{ selectedTender().id }}
              </p>
            </div>
          }

          <!-- Actions -->
          <div class="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="closeLoginPrompt()"
              class="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              (click)="proceedToLogin()"
              class="inline-flex items-center gap-2 bg-[#174A6E] hover:bg-[#123B59] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
            >
              <span>Login to Continue</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    }

    <!-- All Tenders Full Modal -->
    @if (isTendersModalOpen()) {
      <app-tenders-modal (close)="isTendersModalOpen.set(false)"></app-tenders-modal>
    }
  `,
  styles: [`
    @keyframes marquee-vertical {
      0% {
        transform: translate3d(0, 0, 0);
      }
      100% {
        transform: translate3d(0, -50%, 0);
      }
    }
    .animate-marquee-vertical {
      animation: marquee-vertical 28s linear infinite;
      will-change: transform;
      backface-visibility: hidden;
    }
  `]
})
export class HeroTendersComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  @ViewChild('tendersContainer') tendersContainerRef?: ElementRef<HTMLElement>;

  readonly isTendersModalOpen = signal(false);
  readonly showLoginModal = signal(false);
  readonly selectedTender = signal<any | null>(null);

  openLoginPrompt(tender: any): void {
    this.selectedTender.set(tender);
    this.showLoginModal.set(true);
  }

  closeLoginPrompt(): void {
    this.showLoginModal.set(false);
    this.selectedTender.set(null);
  }

  proceedToLogin(): void {
    this.closeLoginPrompt();
    this.authService.triggerSsoRedirect();
  }

  readonly isHoveringTenders = signal(false);
  readonly isSectionVisible = signal(true);
  readonly isTabActive = signal(true);

  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  readonly shouldAnimate = () => {
    return this.isSectionVisible() && this.isTabActive() && !this.isHoveringTenders() && !this.showLoginModal();
  };

  tenders = [
    {
      date: '23/01/2026',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      category: 'MMKVY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '17/02/2026',
      id: 'RSLDC/EOI/MNSKSY/2025-26/01',
      category: 'MNSKSY',
      isNew: true,
      status: 'Open',
      title: 'Expression of Interest (EOI) MNSKSY in RSLDC.'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/MMKVY Cat I II III/2024-25/01',
      category: 'MMKVY',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
    },
    {
      date: '26/09/2024',
      id: 'RSLDC/EOI/IMSHAKTI/2024-25/01',
      category: 'IM_Shakti',
      isNew: false,
      status: 'Closed',
      title: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme'
    },
    {
      date: '02/05/2023',
      id: 'RSLDC/EOI2023-24/Cat-III/RAJKVik RTD',
      category: 'RAJKVIKRTD',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK)' scheme of RSLDC"
    },
    {
      date: '05/07/2023',
      id: 'RSLDC/MMYKY2/EoI23-24/01',
      category: 'MMYKY',
      isNew: false,
      status: 'Closed',
      title: 'EoI for MMYKY 2.O for RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAMARTH',
      category: 'SAMARTH',
      isNew: false,
      status: 'Closed',
      title: 'EoI for submission of proposal to undertake the project under MMKVY(Cat-III: SAMARTH) scheme of RSLDC'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1-RAJKVIK General',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.'
    },
    {
      date: '18/04/2023',
      id: 'RSLDC/EoI/2023-24/1/MMKVYSAKSHM',
      category: 'SAKSHM',
      isNew: false,
      status: 'Closed',
      title: 'Eol for submission of proposal to undertake the project under MMKVY(Cat-II: SAKSHM) scheme of RSLDC'
    },
    {
      date: '08/07/2022',
      id: 'RSLDC/EOI/2022-23/1MMKVYRTD',
      category: 'RAJKVIK',
      isNew: false,
      status: 'Closed',
      title: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan"
    }
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.tendersContainerRef?.nativeElement;
    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isSectionVisible.set(entry.isIntersecting);
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
}
