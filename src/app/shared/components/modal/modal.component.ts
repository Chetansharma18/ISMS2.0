import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ModalService } from '../../services/modal.service';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

const WIDTH: Record<ModalSize, string> = {
  xs: 'max-w-[360px]',
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
  '2xl': 'max-w-[1200px]',
  full: 'max-w-full'
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
  imports: [ButtonComponent],
  host: {
    '[attr.title]': 'null'
  },
  template: `
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto font-sans print:static print:p-0 print:block print:bg-white"
      style="background: rgba(10, 20, 40, 0.45); backdrop-filter: blur(3px);"
      (click)="onBackdrop($event)"
    >
      <div
        class="w-full bg-white rounded-xl border border-[#EADCE2] relative font-sans my-auto flex flex-col"
        [class.overflow-visible]="!scrollBody()"
        [class.overflow-hidden]="scrollBody()"
        [class.max-h-[82vh]]="scrollBody()"
        style="box-shadow: 0 20px 60px rgba(0,0,0,0.18);"
        [class]="widthClass()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="title() ? titleId : null"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        @if (title()) {
          <div class="px-4 sm:px-7 pt-5 sm:pt-6 pb-2 shrink-0">
            <h2 [id]="titleId" class="m-0 text-[#7C0E44]" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
              {{ title() }}
            </h2>
            @if (subtitle()) {
              <p class="m-0 mt-1 text-[#625663] font-normal leading-relaxed text-xs">
                {{ subtitle() }}
              </p>
            }
          </div>
        }

        <!-- Body -->
        <div class="px-4 sm:px-7 py-4" [class.flex-1]="scrollBody()" [class.min-h-0]="scrollBody()" [class.overflow-auto]="scrollBody()" [class.overflow-visible]="!scrollBody()">
          <ng-content />
        </div>

        <!-- Footer -->
        <div class="px-4 sm:px-7 pb-5 sm:pb-7 pt-2 bg-white flex items-center justify-end gap-2.5 shrink-0 whitespace-nowrap empty:hidden print:hidden">
          <!-- No top-right ✕: the footer's Cancel closes the dialog (turn off with [showClose]="false" when the
               dialog has its own Cancel / Close button) -->
          @if (showClose()) {
            <button appButton variant="outline" type="button" (click)="close.emit()">Cancel</button>
          }
          <ng-content select="[modalFooter]" />
        </div>
      </div>
    </div>
  `
})
export class ModalComponent implements OnInit, OnDestroy {
  private readonly modalService = inject(ModalService);

  readonly title = input('');
  readonly subtitle = input('');
  readonly size = input<ModalSize>('md');
  /** A width class that replaces `size` for the odd dialog, for example `max-w-[560px]`. */
  readonly widthOverride = input('');
  /** Shows a "Cancel" button in the footer that emits `close`. */
  readonly showClose = input(true);
  readonly closeOnBackdrop = input(true);
  /** Turn off when the body manages its own scrolling or contains overlay dropdowns. */
  readonly scrollBody = input(false);

  readonly close = output<void>();

  protected readonly titleId = `app-modal-title-${++nextId}`;
  protected readonly widthClass = computed(() => this.widthOverride() || WIDTH[this.size()]);

  ngOnInit(): void {
    this.modalService.registerModalOpen();
  }

  ngOnDestroy(): void {
    this.modalService.registerModalClose();
  }

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
