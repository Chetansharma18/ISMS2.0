import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationType } from '../../../core/services/notification.service';

/**
 * Renders NotificationService toasts. Mounted once in AppComponent so any
 * feature can call `notificationService.success(...)` instead of hand-rolling
 * its own fixed-position toast markup.
 */
@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-6 right-6 z-60 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-3rem)] sm:w-auto pointer-events-none font-sans">
      @for (n of notifications.notifications(); track n.id) {
        <div
          class="pointer-events-auto bg-slate-900 text-white p-3.5 rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200"
          [attr.role]="n.type === 'error' ? 'alert' : 'status'"
        >
          <div class="flex items-start gap-2.5">
            <div
              class="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs shrink-0"
              [ngClass]="iconBgClass(n.type)"
              aria-hidden="true"
            >
              {{ iconGlyph(n.type) }}
            </div>
            <div class="flex-1 min-w-0">
              @if (n.title) {
                <h4 class="text-xs font-medium text-white m-0">{{ n.title }}</h4>
              }
              <p class="text-[11px] text-slate-300 m-0" [class.mt-0.5]="!!n.title">{{ n.message }}</p>
            </div>
            <button
              type="button"
              (click)="notifications.dismiss(n.id)"
              class="text-slate-400 hover:text-white text-base leading-none cursor-pointer -mt-0.5"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastOutletComponent {
  readonly notifications = inject(NotificationService);

  iconBgClass(type: NotificationType): string {
    switch (type) {
      case 'success': return 'bg-emerald-500';
      case 'error': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-sky-500';
    }
  }

  iconGlyph(type: NotificationType): string {
    switch (type) {
      case 'success': return '\u2713';
      case 'error': return '\u00D7';
      case 'warning': return '!';
      default: return 'i';
    }
  }
}
