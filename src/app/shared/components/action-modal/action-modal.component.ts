import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        style="background: rgba(10,20,40,0.45); backdrop-filter: blur(3px);"
        (click)="onBackdropClick($event)"
      >
        <div
          class="w-full bg-white rounded-xl border border-slate-200 relative font-sans overflow-hidden my-auto max-h-[90vh] flex flex-col"
          [ngClass]="maxWidthClass"
          style="box-shadow: 0 20px 60px rgba(0,0,0,0.18);"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="title ? titleId : null"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Bar -->
          @if (showAccentBar) {
            <div class="h-1 w-full shrink-0" [ngClass]="accentBarClass"></div>
          }

          <!-- Modal Body -->
          <div class="px-4 sm:px-7 pt-5 sm:pt-6 pb-5 sm:pb-7 overflow-y-auto flex-1">

            <!-- Close Button -->
            @if (showCloseButton) {
              <button
                type="button"
                (click)="onClose()"
                class="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
                title="Close"
                aria-label="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }

            <!-- Badge Pill -->
            @if (badge) {
              <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 mb-3">
                {{ badge }}
              </div>
            }

            <!-- Title -->
            @if (title) {
              <h2 [id]="titleId" class="m-0 text-navy pr-6" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
                {{ title }}
              </h2>
            }

            <!-- Description -->
            @if (description) {
              <p class="m-0 mt-2 text-slate-500 font-normal leading-relaxed" style="font-size: 13.5px;">
                {{ description }}
              </p>
            }

            <!-- Projected Custom Slot -->
            <div class="w-full">
              <ng-content></ng-content>
            </div>

            <!-- Action Buttons Footer -->
            @if (primaryLabel || secondaryLabel) {
              <div class="mt-6 mb-5 border-t border-slate-100"></div>

              <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3" [class.sm:flex-row-reverse]="!secondaryLabel">
                @if (secondaryLabel) {
                  <button
                    type="button"
                    (click)="onSecondaryAction()"
                    class="w-full sm:flex-1 py-2.5 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {{ secondaryLabel }}
                  </button>
                }
                @if (primaryLabel) {
                  <button
                    type="button"
                    (click)="onPrimaryAction()"
                    [disabled]="disablePrimary"
                    class="w-full sm:flex-1 py-2.5 px-4 rounded-lg text-white! text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    [ngClass]="primaryVariantClass"
                  >
                    {{ primaryLabel }}
                  </button>
                }
              </div>
            }

          </div>
        </div>
      </div>
    }
  `
})
export class ActionModalComponent {
  private static nextId = 0;
  readonly titleId = `action-modal-title-${++ActionModalComponent.nextId}`;

  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() badge = '';
  @Input() primaryLabel = 'Confirm';
  @Input() secondaryLabel = 'Cancel';
  @Input() showPrimaryArrow = true;
  @Input() showAccentBar = true;
  @Input() accentBarClass = 'bg-navy';
  @Input() showCloseButton = false;
  @Input() maxWidthClass = 'max-w-[490px]';
  @Input() closeOnBackdrop = true;
  @Input() disablePrimary = false;
  @Input() reverseButtons = false;
  /** Colour of the primary action button. 'primary' keeps the default dark brand blue. */
  @Input() primaryVariant: 'primary' | 'success' | 'danger' = 'primary';

  get primaryVariantClass(): string {
    switch (this.primaryVariant) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700';
      default:
        return 'bg-navy hover:bg-navy-dark';
    }
  }

  @Output() primaryAction = new EventEmitter<void>();
  @Output() secondaryAction = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onPrimaryAction(): void {
    this.primaryAction.emit();
  }

  onSecondaryAction(): void {
    this.secondaryAction.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
