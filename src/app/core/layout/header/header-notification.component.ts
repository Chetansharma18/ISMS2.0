import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { PortalNotificationService } from '../../services/portal-notification.service';
import { PortalNotification } from '../../models/portal-notification.model';

@Component({
  selector: 'app-header-notification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ClickOutsideDirective],
  host: {
    class: 'relative block'
  },
  template: `
    <div class="relative inline-block text-left" (appClickOutside)="closeDropdown()">
      <!-- Notification Bell Trigger -->
      <button
        type="button"
        id="portal-notification-bell-btn"
        (click)="toggleDropdown()"
        class="relative inline-flex items-center justify-center w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full border transition-all cursor-pointer select-none focus:outline-hidden focus:ring-2 focus:ring-[#12365A]/25"
        [ngClass]="isOpen() 
          ? 'bg-[#EAF2F6] border-[#12365A]/40 text-[#12365A]' 
          : 'bg-white hover:bg-[#F5F8FA] border-[#DCE4ED] hover:border-slate-300 text-slate-600 hover:text-[#12365A] shadow-2xs'"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="true"
        aria-label="Notifications"
        [title]="unreadCount() > 0 ? (unreadCount() + ' unread notifications') : 'Notifications'"
      >
        <!-- Bell Icon -->
        <svg
          class="w-4 h-4 sm:w-[18px] sm:h-[18px]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        <!-- Unread Count Badge -->
        @if (unreadCount() > 0) {
          <span
            class="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9.5px] font-bold text-white bg-[#F28C28] rounded-full shadow-xs ring-2 ring-white"
            aria-hidden="true"
          >
            {{ unreadCount() > 9 ? '9+' : unreadCount() }}

            @if (hasNewArrivals()) {
              <span class="absolute inset-0 rounded-full bg-[#F28C28] animate-ping opacity-70"></span>
            }
          </span>
        }
      </button>

      <!-- Dropdown Popover -->
      @if (isOpen()) {
        <div
          class="absolute right-0 sm:right-0 top-full mt-2 w-[320px] xs:w-[360px] sm:w-[380px] max-w-[calc(100vw-24px)] bg-white border border-[#DCE4ED] rounded-xl shadow-xl z-[120] overflow-hidden flex flex-col font-['Inter',sans-serif] animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="Notifications"
        >
          <!-- Header: Simple title and Mark all read -->
          <div class="px-4 py-3 bg-[#F8FAFC] border-b border-[#DCE4ED] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs sm:text-sm font-bold text-[#12365A]">Notifications</span>
              @if (unreadCount() > 0) {
                <span class="text-[10px] font-bold px-1.5 py-0.2 bg-[#F28C28]/15 text-[#B85800] rounded-full">
                  {{ unreadCount() }} New
                </span>
              }
            </div>

            @if (unreadCount() > 0) {
              <button
                type="button"
                (click)="markAllAsRead()"
                class="text-[11px] font-medium text-[#12365A] hover:underline cursor-pointer border-0 bg-transparent p-0"
              >
                Mark all read
              </button>
            }
          </div>

          <!-- Notification Items List -->
          <div class="max-h-[360px] overflow-y-auto divide-y divide-slate-100 overscroll-contain">
            @for (item of notifications(); track item.id) {
              <div
                (click)="onItemClick(item)"
                class="p-3.5 transition-colors cursor-pointer flex items-start gap-3 border-l-[3px]"
                [ngClass]="!item.isRead 
                  ? 'bg-[#F2F7FC] hover:bg-[#EAF2F8] border-l-[#12365A]' 
                  : 'bg-white hover:bg-slate-50 border-l-transparent'"
              >
                <!-- Unread status dot -->
                <div class="pt-1 shrink-0">
                  @if (!item.isRead) {
                    <span class="block w-2 h-2 rounded-full bg-[#F28C28]"></span>
                  } @else {
                    <span class="block w-2 h-2 rounded-full bg-slate-300"></span>
                  }
                </div>

                <!-- Main Content -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2">
                    <h4
                      class="text-xs leading-snug m-0 truncate"
                      [ngClass]="!item.isRead ? 'font-bold text-[#12365A]' : 'font-medium text-slate-700'"
                    >
                      {{ item.title }}
                    </h4>
                    <span class="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                      {{ item.timeAgo }}
                    </span>
                  </div>

                  <p class="text-[11.5px] text-slate-600 mt-1 leading-relaxed m-0">
                    {{ item.message }}
                  </p>
                </div>
              </div>
            } @empty {
              <div class="py-8 px-4 text-center">
                <p class="text-xs text-slate-500 m-0">No notifications at the moment.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class HeaderNotificationComponent {
  private notificationService = inject(PortalNotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly isOpen = signal<boolean>(false);

  readonly notifications = this.notificationService.notifications;
  readonly unreadCount = this.notificationService.unreadCount;
  readonly hasNewArrivals = this.notificationService.hasNewArrivals;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.isOpen.set(false);
      });
  }

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.closeDropdown();
    }
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  closeDropdown(): void {
    this.isOpen.set(false);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  onItemClick(item: PortalNotification): void {
    this.notificationService.markAsRead(item.id);
    this.closeDropdown();
    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }
}
