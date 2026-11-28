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
import { isPlatformBrowser } from '@angular/common';
import { TendersModalComponent, PUBLIC_TENDERS, type PublicTenderItem } from '../tenders-modal/tenders-modal.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { ActionModalComponent } from '../../../../shared/components/action-modal/action-modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hero-tenders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TendersModalComponent, ActionModalComponent, ButtonComponent, IconComponent],
  template: `
    <!-- Right Column Panel: 540–600px desktop width, 410–430px height, clean official government card -->
    <div class="w-full max-w-135 lg:max-w-145 xl:max-w-150 mx-auto lg:ml-auto">
      <div class="w-full h-102.5 sm:h-106.25 lg:h-107.5 bg-white rounded-xl shadow-[0_10px_25px_rgba(124,14,68,0.08)] border border-[#EADCE2] flex flex-col overflow-hidden relative">
        
        <!-- PANEL HEADER (Height 58–66px, clean white background, primary burgundy text with orange accent) -->
        <div class="h-15 px-5 sm:px-6 bg-white border-b border-[#EADCE2] flex items-center justify-between shrink-0 z-10">
          <div class="flex items-center gap-2.5">
            <!-- Small Orange Accent Bar -->
            <span class="w-1 h-4.5 bg-[#EA580C] rounded-full inline-block" aria-hidden="true"></span>
            <h2 class="text-[17px] font-bold text-[#7C0E44] tracking-wide m-0">TENDER</h2>
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
            <app-icon name="chevron-right" size="sm" />
          </button>
        </div>

        <!-- TENDER LIST: Clean readable rows, subtle dividers, internally scrollable -->
        <div 
          #scrollList
          class="flex-1 overflow-y-auto divide-y divide-[#EADCE2] bg-white tender-custom-scroll overscroll-contain" 
          (mouseenter)="pauseScroll()" 
          (mouseleave)="resumeScrollWithDelay()"
          (touchstart)="pauseScroll()"
          (touchend)="resumeScrollWithDelay()">
          
          @for (item of tenders; track item.id) {
            <div 
              (click)="openLoginPrompt(item)" 
              class="p-3.5 sm:p-4 hover:bg-[#FAF2F5] transition-colors duration-150 cursor-pointer group flex flex-col gap-1.5 text-left focus:outline-none focus:bg-[#FAF2F5]"
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
                <span class="text-[11px] font-semibold text-[#7C0E44] bg-primary-light border border-border rounded px-2 py-0.5 shrink-0">
                  {{ item.category }}
                </span>
              </div>

              <!-- Middle Row: Tender Title -->
              <h4 class="text-[13px] sm:text-[13.5px] font-semibold text-[#25212A] leading-snug group-hover:text-[#7C0E44] transition-colors line-clamp-2 m-0">
                {{ item.title }}
              </h4>

              <!-- Bottom Row: Reference Number & Login Required Indicator -->
              <div class="flex items-center justify-between gap-3 pt-0.5">
                <p class="text-[11.5px] tabular-nums text-slate-500 truncate max-w-[62%]" [title]="item.id">
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
  readonly selectedTender = signal<PublicTenderItem | null>(null);
  readonly tenders: PublicTenderItem[] = PUBLIC_TENDERS;

  private animationFrameId?: number;
  private isInteracting = false;
  private resumeTimeout?: ReturnType<typeof setTimeout>;
  private isSectionVisible = true;
  private observer?: IntersectionObserver;
  private visibilityHandler?: () => void;

  openModal(): void {
    this.isTendersModalOpen.set(true);
  }

  openLoginPrompt(tender: PublicTenderItem): void {
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
