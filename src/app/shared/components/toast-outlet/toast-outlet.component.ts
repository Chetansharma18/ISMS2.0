import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NotificationService, NotificationType } from '../../../core/services/notification.service';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icons';

interface ToastStyle {
  icon: IconName;
  /** Left accent bar and icon colour. */
  accent: string;
  iconColor: string;
  iconBg: string;
}

const STYLES: Record<NotificationType, ToastStyle> = {
  success: { icon: 'check-circle', accent: 'bg-emerald-600', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  error: { icon: 'error', accent: 'bg-rose-600', iconColor: 'text-rose-600', iconBg: 'bg-rose-50' },
  warning: { icon: 'alert-triangle', accent: 'bg-amber-500', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
  info: { icon: 'info', accent: 'bg-sky-600', iconColor: 'text-sky-600', iconBg: 'bg-sky-50' }
};

/**
 * Renders NotificationService toasts. Mounted once in AppComponent so any
 * feature can call `notificationService.success(...)` instead of hand-rolling
 * its own fixed-position toast markup.
 *
 * Text sits in div/span, not p/h4: the global `p` and `h4` typography in styles.css is unlayered and would
 * override the toast's own sizes.
 */
@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="fixed bottom-6 right-6 z-60 flex flex-col gap-2.5 w-[calc(100vw-3rem)] max-w-sm pointer-events-none font-sans">
      @for (n of notifications.notifications(); track n.id) {
        <div
          class="pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white py-3 pl-4 pr-2 shadow-lg animate-in slide-in-from-bottom-5 duration-200"
          [attr.role]="n.type === 'error' ? 'alert' : 'status'"
          [attr.aria-live]="n.type === 'error' ? 'assertive' : 'polite'"
        >
          <span class="absolute inset-y-0 left-0 w-1" [class]="style(n.type).accent" aria-hidden="true"></span>

          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            [class]="style(n.type).iconBg + ' ' + style(n.type).iconColor"
            aria-hidden="true"
          >
            <app-icon [name]="style(n.type).icon" size="md" [stroke]="2" />
          </span>

          <div class="min-w-0 flex-1 pt-0.5">
            @if (n.title) {
              <div class="text-sm font-semibold leading-5 text-slate-900">{{ n.title }}</div>
            }
            <div class="text-[13px] leading-5 text-slate-600 break-words" [class.mt-0.5]="!!n.title">{{ n.message }}</div>
          </div>

          <button appButton variant="ghost" size="sm" iconOnly type="button" aria-label="Dismiss notification" (click)="notifications.dismiss(n.id)">
            <app-icon name="close" size="sm" />
          </button>
        </div>
      }
    </div>
  `
})
export class ToastOutletComponent {
  readonly notifications = inject(NotificationService);

  style(type: NotificationType): ToastStyle {
    return STYLES[type] ?? STYLES.info;
  }
}
