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

interface TenderItem {
  date: string;
  id: string;
  category: string;
  isNew: boolean;
  status: string;
  title: string;
}

@Component({
  selector: 'app-hero-tenders',
  standalone: true,
  imports: [CommonModule, RouterModule, TendersModalComponent],
  template: `
    <!-- Right Column Panel: 540–600px desktop width, 410–430px height, clean official government card -->
    <div class="w-full max-w-[540px] lg:max-w-[580px] xl:max-w-[600px] mx-auto lg:ml-auto">
      <div class="w-full h-[410px] sm:h-[425px] lg:h-[430px] bg-white rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.18)] border border-[#DCE4ED] flex flex-col overflow-hidden relative">
        
        <!-- PANEL HEADER (Height 58–66px, clean white background, dark navy text with orange accent) -->
        <div class="h-[60px] px-5 sm:px-6 bg-white border-b border-[#DCE4ED] flex items-center justify-between shrink-0 z-10">
          <div class="flex items-center gap-2.5">
            <!-- Small Orange Accent Bar -->
            <span class="w-[4px] h-[18px] bg-[#F28C28] rounded-full inline-block" aria-hidden="true"></span>
            <h2 class="text-[17px] font-bold text-[#12365A] tracking-wide m-0">TENDER</h2>
          </div>
          
          <!-- View All Action -->
          <button 
            type="button"
            (click)="openModal()" 
            class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#12365A] hover:text-[#F28C28] bg-[#F5F8FC] hover:bg-[#EAF2F6] border border-[#DCE4ED] px-3.5 py-1.5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F28C28]"
            aria-label="View all tenders in modal">
            <span>View All</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- TENDER LIST: Clean readable rows, subtle dividers, internally scrollable -->
        <div 
          #scrollList
          class="flex-1 overflow-y-auto divide-y divide-[#DCE4ED] bg-white tender-custom-scroll overscroll-contain" 
          (mouseenter)="pauseScroll()" 
          (mouseleave)="resumeScrollWithDelay()"
          (touchstart)="pauseScroll()"
          (touchend)="resumeScrollWithDelay()">
          
          @for (item of tenders; track item.id) {
            <div 
              (click)="openLoginPrompt(item)" 
              class="p-3.5 sm:p-4 hover:bg-[#F5F8FC] transition-colors duration-150 cursor-pointer group flex flex-col gap-1.5 text-left focus:outline-none focus:bg-[#F5F8FC]"
              tabindex="0"
              (keydown.enter)="openLoginPrompt(item)"
              (keydown.space)="openLoginPrompt(item)"
              role="button"
              [attr.aria-label]="'Tender: ' + item.title">
              
              <!-- Top Row: Date & Category Badge -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-[12px] sm:text-[12.5px] text-[#556987] font-medium">{{ item.date }}</span>
                  @if (item.isNew) {
                    <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded font-sans tracking-wide">
                      NEW
                    </span>
                  }
                </div>
                <span class="text-[11px] font-semibold text-[#12365A] bg-[#EAF2F6] border border-[#D9E1E7] rounded px-2 py-0.5 shrink-0">
                  {{ item.category }}
                </span>
              </div>

              <!-- Middle Row: Tender Title -->
              <h4 class="text-[13px] sm:text-[13.5px] font-semibold text-[#12365A] leading-snug group-hover:text-[#F28C28] transition-colors line-clamp-2 m-0">
                {{ item.title }}
              </h4>

              <!-- Bottom Row: Reference Number & Login Required Indicator -->
              <div class="flex items-center justify-between gap-3 pt-0.5">
                <p class="text-[11.5px] font-mono text-[#64748B] truncate max-w-[62%]" [title]="item.id">
                  {{ item.id }}
                </p>
                <span class="text-[11.5px] sm:text-[12px] font-semibold text-[#F28C28] group-hover:text-[#d9771e] shrink-0">
                  <span>Login Required</span>
                </span>
              </div>

            </div>
          }

        </div>

      </div>
    </div>

    <!-- Login Required Alert Modal -->
    @if (showLoginModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-150">
        <!-- Backdrop click closes -->
        <div class="absolute inset-0" (click)="closeLoginPrompt()"></div>

        <!-- Dialog Box -->
        <div class="relative bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-sm p-6 z-10 animate-in zoom-in-95 duration-150">
          <button
            type="button"
            (click)="closeLoginPrompt()"
            class="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>

          <div class="pr-6 pt-1">
            <p class="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed m-0">
              Please login to view Active Scheme and apply.
            </p>
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
    .tender-custom-scroll {
      scrollbar-width: thin;
      scrollbar-color: #CBD5E1 #F8FAFC;
    }
    .tender-custom-scroll::-webkit-scrollbar {
      width: 5px;
    }
    .tender-custom-scroll::-webkit-scrollbar-track {
      background: #F8FAFC;
    }
    .tender-custom-scroll::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 4px;
    }
    .tender-custom-scroll::-webkit-scrollbar-thumb:hover {
      background: #94A3B8;
    }
  `]
})
export class HeroTendersComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);

  @ViewChild('scrollList') scrollListRef?: ElementRef<HTMLElement>;

  readonly isTendersModalOpen = signal(false);
  readonly showLoginModal = signal(false);
  readonly selectedTender = signal<TenderItem | null>(null);

  private animationFrameId?: number;
  private isInteracting = false;
  private resumeTimeout?: any;
  private isSectionVisible = true;
  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  openModal(): void {
    this.isTendersModalOpen.set(true);
  }

  openLoginPrompt(tender: TenderItem): void {
    this.selectedTender.set(tender);
    this.showLoginModal.set(true);
    this.pauseScroll();
  }

  closeLoginPrompt(): void {
    this.showLoginModal.set(false);
    this.selectedTender.set(null);
    this.resumeScrollWithDelay();
  }

  proceedToLogin(): void {
    this.closeLoginPrompt();
    this.authService.triggerSsoRedirect();
  }

  pauseScroll(): void {
    this.isInteracting = true;
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }
  }

  resumeScrollWithDelay(): void {
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }
    this.resumeTimeout = setTimeout(() => {
      this.isInteracting = false;
    }, 2000);
  }

  tenders: TenderItem[] = [
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

    const el = this.scrollListRef?.nativeElement;
    if (el) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            this.isSectionVisible = entry.isIntersecting;
          });
        },
        { threshold: 0.1 }
      );
      this.observer.observe(el);

      this.startGentleAutoScroll(el);
    }

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pauseScroll();
      } else {
        this.resumeScrollWithDelay();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private startGentleAutoScroll(el: HTMLElement): void {
    let lastTime = performance.now();
    let maxScroll = Math.max(0, el.scrollHeight - el.clientHeight - 2);
    let lastRecalcTime = lastTime;
    const scrollSpeed = 0.035; // px per millisecond (approx 21px per second - gentle and readable)

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Recalculate max scroll bounds only once every 3 seconds to avoid forced reflows on every frame
      if (now - lastRecalcTime > 3000) {
        maxScroll = Math.max(0, el.scrollHeight - el.clientHeight - 2);
        lastRecalcTime = now;
      }

      if (
        this.isSectionVisible &&
        !this.isInteracting &&
        !this.showLoginModal() &&
        !this.isTendersModalOpen()
      ) {
        el.scrollTop += delta * scrollSpeed;
        // Loop back smoothly if reached bottom
        if (el.scrollTop >= maxScroll) {
          el.scrollTop = 0;
        }
      }

      this.animationFrameId = requestAnimationFrame(step);
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resumeTimeout) {
      clearTimeout(this.resumeTimeout);
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }
}
