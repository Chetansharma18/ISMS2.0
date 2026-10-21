import { ChangeDetectionStrategy, Component, HostListener, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const WIDTH: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl'
};

let nextId = 0;

/**
 * The one dialog shell of the portal: dark overlay, white panel, navy accent bar, title with a
 * close button, scrolling body and an optional footer. Every dialog is built on it.
 *
 *   @if (open()) {
 *     <app-modal title="Approved Companies" subtitle="MMKVY" size="xl" (close)="open.set(false)">
 *       ...body...
 *       <ng-container modalFooter>
 *         <button appButton variant="outline" (click)="open.set(false)">Close</button>
 *       </ng-container>
 *     </app-modal>
 *   }
 *
 * The dialog exists while it is in the template, so wrap it in `@if`. It closes on Escape, on a
 * click outside the panel and on the close button; each emits `close`.
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans print:static print:p-0 print:block print:bg-white"
      style="background: rgba(10, 20, 40, 0.5); backdrop-filter: blur(4px);"
      (click)="onBackdrop($event)"
    >
      <div
        class="w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        [class]="widthClass()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? titleId : null"
        (click)="$event.stopPropagation()"
      >
        <div class="h-1.5 w-full bg-navy shrink-0 print:hidden"></div>

        @if (title() || showClose()) {
          <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3 shrink-0">
            <div class="min-w-0">
              @if (title()) {
                <h2 [id]="titleId" class="text-base sm:text-lg font-bold text-slate-900 m-0">{{ title() }}</h2>
              }
              @if (subtitle()) {
                <p class="text-xs text-slate-500 m-0 mt-0.5">{{ subtitle() }}</p>
              }
            </div>
            @if (showClose()) {
              <button appButton variant="ghost" size="sm" iconOnly aria-label="Close" title="Close" (click)="close.emit()">
                <app-icon name="close" />
              </button>
            }
          </div>
        }

        <div class="px-5 sm:px-6 py-5 flex-1 min-h-0" [class.overflow-auto]="scrollBody()">
          <ng-content />
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2.5 shrink-0 empty:hidden print:hidden">
          <ng-content select="[modalFooter]" />
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  readonly title = input('');
  readonly subtitle = input('');
  readonly size = input<ModalSize>('md');
  /** A width class that replaces `size` for the odd dialog, for example `max-w-[560px]`. */
  readonly widthOverride = input('');
  readonly showClose = input(true);
  readonly closeOnBackdrop = input(true);
  /** Turn off when the body manages its own scrolling. */
  readonly scrollBody = input(true);

  readonly close = output<void>();

  protected readonly titleId = `app-modal-title-${++nextId}`;
  protected readonly widthClass = computed(() => this.widthOverride() || WIDTH[this.size()]);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  protected onBackdrop(event: MouseEvent): void {
    if (this.closeOnBackdrop() && event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
