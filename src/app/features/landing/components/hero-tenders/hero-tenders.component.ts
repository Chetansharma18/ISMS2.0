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
      <div class="tender-panel-card w-full h-[430px] sm:h-[440px] lg:h-[455px] xl:h-[470px] rounded-2xl flex flex-col overflow-hidden relative">
        
        <!-- Multi-color Rajasthan Royal Top Accent Stripe -->
        <div class="tender-top-stripe" aria-hidden="true"></div>

        <!-- PANEL HEADER (Executive Royal Blue with Golden Amber Icon & Live Indicator) -->
        <div class="tender-panel-header px-4.5 sm:px-5.5 flex items-center justify-between shrink-0 z-10">
          <div class="flex items-center gap-3">
            <div class="tender-icon-box" aria-hidden="true">
              <app-icon name="document" size="md" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="tender-header-title">Tender Notices</h2>
                <!-- Live Active Indicator Badge -->
                <span class="tender-live-badge">
                  <span class="tender-live-dot"></span>
                  <span>Active</span>
                </span>
              </div>
              <p class="tender-header-subtitle">Official RSLDC e-Procurement</p>
            </div>
          </div>
          
          <!-- View All Action -->
          <button 
            appButton
            variant="inverse"
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
                      <app-icon name="calendar" size="xs" class="text-[#224599]" />
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
                <div class="flex items-center justify-between gap-3 pt-1.5">
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
                <app-icon name="arrow-right" size="xs" />
              </div>

            </div>
          }

        </div>

        <!-- PANEL FOOTER: Institutional subtle status strip -->
        <div class="tender-panel-footer px-5 border-t border-slate-100 flex items-center justify-between shrink-0 z-10">
          <div class="flex items-center gap-2 text-slate-500 font-medium text-[11px]">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Live Procurement Stream</span>
          </div>
          <span class="text-[11px] font-bold text-[#224599] cursor-pointer hover:underline" (click)="openModal()">
            10 Active Notices →
          </span>
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
      border: 1px solid rgba(226, 232, 240, 0.95);
      box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.28), 0 8px 24px -4px rgba(34, 69, 153, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
      border-radius: 20px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tender-panel-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 30px 65px -12px rgba(15, 23, 42, 0.32), 0 12px 28px -4px rgba(34, 69, 153, 0.18);
    }

    .tender-top-stripe {
      width: 100%;
      height: 3.5px;
      background: linear-gradient(90deg, #D73389 0%, #EA580C 35%, #F59E0B 70%, #224599 100%);
      flex-shrink: 0;
    }

    .tender-panel-header {
      height: 68px;
      position: relative;
      background: linear-gradient(135deg, #162F65 0%, #1E3A8A 55%, #224599 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .tender-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FDE047;
      box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .tender-header-title {
      font-size: 16.5px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.01em;
      margin: 0;
      line-height: 1.2;
    }

    .tender-header-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.75);
      margin: 2px 0 0 0;
      line-height: 1;
    }

    .tender-panel-header .btn {
      background: rgba(255, 255, 255, 0.14) !important;
      border: 1px solid rgba(255, 255, 255, 0.28) !important;
      color: #FFFFFF !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      gap: 5px !important;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.2s ease !important;
    }
    .tender-panel-header .btn:hover {
      background: rgba(255, 255, 255, 0.25) !important;
      border-color: rgba(255, 255, 255, 0.45) !important;
      color: #FFFFFF !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;
      text-decoration: none !important;
    }

    .tender-live-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 1.5px 7px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(52, 211, 153, 0.35);
      color: #6EE7B7;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .tender-live-dot {
      width: 5.5px;
      height: 5.5px;
      border-radius: 9999px;
      background-color: #34D399;
      box-shadow: 0 0 8px #34D399;
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
      padding: 12px 18px;
      background: #FFFFFF;
      cursor: pointer;
      text-align: left;
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tender-item-row:hover {
      background: linear-gradient(90deg, rgba(215, 51, 137, 0.04) 0%, rgba(34, 69, 153, 0.02) 60%, rgba(255, 255, 255, 0.98) 100%);
      transform: translateX(3px);
    }

    .tender-accent-bar {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: transparent;
      transition: all 0.22s ease;
    }
    .tender-item-row:hover .tender-accent-bar {
      background: linear-gradient(180deg, #D73389 0%, #EA580C 50%, #224599 100%);
      box-shadow: 0 0 10px rgba(215, 51, 137, 0.45);
    }

    .tender-date-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #475569;
      font-weight: 600;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 1.5px 7px;
      border-radius: 5px;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-date-chip {
      background: #EFF6FF;
      border-color: #BFDBFE;
      color: #1E40AF;
    }

    .tender-new-badge {
      font-size: 9.5px;
      font-weight: 700;
      color: #047857;
      background: #ECFDF5;
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 1px 5px;
      border-radius: 4px;
      letter-spacing: 0.03em;
    }

    .tender-category-badge {
      font-size: 10.5px;
      font-weight: 700;
      color: #D73389;
      background: linear-gradient(135deg, #FDF2F7 0%, #FCE7F3 100%);
      border: 1px solid rgba(215, 51, 137, 0.25);
      border-radius: 6px;
      padding: 2px 8px;
      flex-shrink: 0;
      letter-spacing: 0.02em;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-category-badge {
      background: #D73389;
      color: #FFFFFF;
      border-color: #D73389;
      box-shadow: 0 2px 8px rgba(215, 51, 137, 0.28);
    }

    .tender-title {
      font-size: 13px;
      font-weight: 600;
      color: #0F172A;
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
      color: #1E3A8A;
    }

    .tender-ref-id {
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      color: #64748B;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 62%;
    }

    .tender-login-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 600;
      color: #B45309;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 2px 7px;
      border-radius: 5px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }
    .tender-item-row:hover .tender-login-link {
      background: #FEF3C7;
      color: #92400E;
      border-color: #FCD34D;
      transform: translateX(-2px);
    }

    .tender-row-arrow {
      color: #94A3B8;
      flex-shrink: 0;
      transform: translateX(0);
      opacity: 0.5;
      transition: all 0.22s ease;
    }
    .tender-item-row:hover .tender-row-arrow {
      color: #224599;
      opacity: 1;
      transform: translateX(3px);
    }

    .tender-panel-footer {
      height: 38px;
      background: #F8FAFC;
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
      background-color: #CBD5E1;
      border-radius: 10px;
    }
    .tender-custom-scroll::-webkit-scrollbar-thumb:hover {
      background-color: #94A3B8;
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
