import {
  ChangeDetectionStrategy,
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
import { ActionModalComponent, ButtonComponent, IconComponent } from '../../../../shared';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, TendersModalComponent, ActionModalComponent, ButtonComponent, IconComponent],
  template: `
    <!-- Right Column Panel: 50% width on desktop, matching height with slider, clean official government card -->
    <div class="w-full h-full flex flex-col">
      <div class="tender-panel-card w-full h-[420px] sm:h-[430px] lg:h-[445px] xl:h-[460px] rounded-2xl flex flex-col overflow-hidden relative">
        
        <!-- PANEL HEADER (Matches mockup: Document icon, Tender Notices, Active badge, View All ->) -->
        <div class="tender-panel-header px-5 sm:px-6 border-b border-[#F1E8EC] flex items-center justify-between shrink-0 z-10">
          <div class="flex items-center gap-2.5">
            <app-icon name="document" size="md" class="text-[#7C0E44]" />
            <h2 class="text-[16px] sm:text-[17px] font-bold text-[#7C0E44] tracking-tight m-0">Tender Notices</h2>
            <!-- Live Active Indicator Badge -->
            <span class="tender-live-badge">
              <span class="tender-live-dot"></span>
              <span>Active</span>
            </span>
          </div>
          
          <!-- View All Action -->
          <button 
            appButton
            variant="outline"
            size="sm"
            type="button"
            (click)="openModal()" 
            aria-label="View all tenders in modal">
            <span>View All</span>
            <app-icon name="arrow-right" size="xs" />
          </button>
        </div>

        <!-- TENDER LIST: Clean readable rows, subtle dividers, internally scrollable -->
        <div 
          #scrollList
          class="flex-1 overflow-y-auto divide-y divide-[#F1F5F9] bg-transparent tender-custom-scroll overscroll-contain relative z-10" 
          (mouseenter)="pauseScroll()" 
          (mouseleave)="resumeScrollWithDelay()"
          (touchstart)="pauseScroll()"
          (touchend)="resumeScrollWithDelay()">
          
          @for (item of tenders; track item.id) {
            <div 
              (click)="openLoginPrompt(item)" 
              class="tender-item-row"
              tabindex="0"
              (keydown.enter)="openLoginPrompt(item)"
              (keydown.space)="openLoginPrompt(item)"
              role="button"
              [attr.aria-label]="'Tender: ' + item.title">
              
              <!-- Left Accent Indicator Bar (Glows on Hover) -->
              <div class="tender-accent-bar" aria-hidden="true"></div>

              <!-- Content Column -->
              <div class="flex-1 min-w-0 pr-1">
                <!-- Top Row: Date & Category Badge -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="tender-date-chip">
                      <app-icon name="calendar" size="xs" class="text-slate-400" />
                      <span>{{ item.date }}</span>
                    </span>
                    @if (item.isNew) {
                      <span class="tender-new-badge">
                        NEW
                      </span>
                    }
                  </div>
                  <span class="tender-category-badge">
                    {{ item.category }}
                  </span>
                </div>

                <!-- Middle Row: Tender Title -->
                <h4 class="tender-title">
                  {{ item.title }}
                </h4>

                <!-- Bottom Row: Reference Number & Login Required Indicator -->
                <div class="flex items-center justify-between gap-3 pt-1">
                  <p class="tender-ref-id" [title]="item.id">
                    {{ item.id }}
                  </p>
                  <span class="tender-login-link">
                    <app-icon name="lock" size="xs" />
                    <span>Login Required</span>
                  </span>
                </div>
              </div>

              <!-- Hover Arrow Action Indicator -->
              <div class="tender-row-arrow" aria-hidden="true">
                <app-icon name="chevron-right" size="sm" />
              </div>

            </div>
          }

        </div>

      </div>
    </div>

    <!-- Login Required Alert Modal -->
    <app-action-modal
      [isOpen]="showLoginModal()"
      title="Login required"
      description="Please login to view Active Scheme and apply."
      [showCloseButton]="true"
      maxWidthClass="max-w-sm"
      primaryLabel="OK"
      secondaryLabel=""
      (primaryAction)="closeLoginPrompt()"
      (close)="closeLoginPrompt()"
    ></app-action-modal>

    <!-- All Tenders Full Modal -->
    @if (isTendersModalOpen()) {
      <app-tenders-modal (close)="isTendersModalOpen.set(false)"></app-tenders-modal>
    }
  `,
  styles: [`
    .tender-panel-card {
      background: #FFFFFF;
      border: 1px solid rgba(226, 232, 240, 0.9);
      box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 4px 14px -2px rgba(0, 0, 0, 0.05);
      border-radius: 18px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tender-panel-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 24px 50px -10px rgba(124, 14, 68, 0.14), 0 6px 18px -2px rgba(0, 0, 0, 0.06);
    }

    .tender-panel-header {
      height: 62px;
      position: relative;
      background: #FFFFFF;
    }

    .tender-live-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(234, 88, 12, 0.09);
      border: 1px solid rgba(234, 88, 12, 0.25);
      color: #EA580C;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    .tender-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 9999px;
      background-color: #EA580C;
      box-shadow: 0 0 6px #EA580C;
      animation: tenderPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes tenderPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    .tender-item-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      background: transparent;
      cursor: pointer;
      text-align: left;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tender-item-row:hover {
      background: linear-gradient(90deg, rgba(136, 28, 67, 0.04) 0%, rgba(255, 255, 255, 0.95) 100%);
      transform: translateX(4px);
    }

    .tender-accent-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3.5px;
      background: transparent;
      transition: all 0.22s ease;
    }
    .tender-item-row:hover .tender-accent-bar {
      background: linear-gradient(180deg, #EA580C 0%, #881C43 100%);
      box-shadow: 0 0 8px rgba(136, 28, 67, 0.35);
    }

    .tender-date-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      color: #556987;
      font-weight: 500;
      background: #F1F5F9;
      padding: 1.5px 7px;
      border-radius: 5px;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-date-chip {
      background: rgba(136, 28, 67, 0.08);
      color: #881C43;
    }

    .tender-new-badge {
      font-size: 10px;
      font-weight: 700;
      color: #047857;
      background: #ECFDF5;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 1px 6px;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }

    .tender-category-badge {
      font-size: 11px;
      font-weight: 700;
      color: #7C0E44;
      background: rgba(136, 28, 67, 0.06);
      border: 1px solid rgba(136, 28, 67, 0.2);
      border-radius: 6px;
      padding: 2px 8px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-category-badge {
      background: #881C43;
      color: #FFFFFF;
      border-color: #881C43;
      box-shadow: 0 2px 6px rgba(136, 28, 67, 0.25);
    }

    .tender-title {
      font-size: 13px;
      font-weight: 600;
      color: #25212A;
      line-height: 1.45;
      margin: 4px 0 0 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s ease;
    }
    @media (min-width: 640px) {
      .tender-title {
        font-size: 13.5px;
      }
    }
    .tender-item-row:hover .tender-title {
      color: #7C0E44;
    }

    .tender-ref-id {
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      color: #64748B;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 65%;
    }

    .tender-login-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      font-weight: 600;
      color: #EA580C;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-login-link {
      color: #C2410C;
      transform: translateX(-2px);
    }

    .tender-row-arrow {
      color: #CBD5E1;
      flex-shrink: 0;
      transform: translateX(0);
      opacity: 0.4;
      transition: all 0.22s ease;
    }
    .tender-item-row:hover .tender-row-arrow {
      color: #7C0E44;
      opacity: 1;
      transform: translateX(3px);
    }

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
      border-radius: 3px;
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
  private resumeTimeout?: ReturnType<typeof setTimeout>;
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
