import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick($event)"
      >
        <div
          class="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden font-sans"
          [ngClass]="maxWidthClass"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Decorative Accent Bar -->
          @if (showAccentBar) {
            <div class="absolute top-0 left-0 right-0 h-1" [ngClass]="accentBarClass"></div>
          }

          <!-- Top Right Close Icon Button -->
          @if (showCloseButton) {
            <button
              type="button"
              (click)="onClose()"
              class="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          }

          <!-- Modal Body Content -->
          <div class="flex flex-col items-center text-center mt-1">
            <!-- Optional Badge / Status Pill -->
            @if (badge) {
              <div class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/80 mb-2">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                {{ badge }}
              </div>
            }

            <!-- Main Title -->
            @if (title) {
              <h3 class="text-lg sm:text-[19px] font-bold text-[#0B3558] tracking-tight m-0">
                {{ title }}
              </h3>
            }

            <!-- Description Message -->
            @if (description) {
              <p class="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed px-1 font-normal m-0">
                {{ description }}
              </p>
            }

            <!-- Projected Custom Content Slot -->
            <div class="w-full">
              <ng-content></ng-content>
            </div>

            <!-- Action Buttons Footer -->
            <div class="w-full mt-5 flex flex-col-reverse sm:flex-row items-center gap-2.5">
              @if (secondaryLabel) {
                <button
                  type="button"
                  (click)="onSecondaryAction()"
                  class="w-full sm:w-1/2 py-2.5 px-3.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  {{ secondaryLabel }}
                </button>
              }

              @if (primaryLabel) {
                <button
                  type="button"
                  (click)="onPrimaryAction()"
                  class="w-full py-2.5 px-3.5 rounded-lg bg-[#0B3558] hover:bg-[#07233B] active:bg-[#041d31] text-white text-xs sm:text-[13px] font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="secondaryLabel ? 'sm:w-1/2' : 'w-full'"
                  style="color: #ffffff !important;"
                >
                  <span class="text-white font-semibold" style="color: #ffffff !important;">{{ primaryLabel }}</span>
                  @if (showPrimaryArrow) {
                    <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  }
                </button>
              }
            </div>

          </div>
        </div>
      </div>
    }
  `
})
export class ActionModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() badge = '';
  @Input() primaryLabel = 'Confirm';
  @Input() secondaryLabel = 'Cancel';
  @Input() showPrimaryArrow = true;
  @Input() showAccentBar = true;
  @Input() accentBarClass = 'bg-[#0B3558]';
  @Input() showCloseButton = false;
  @Input() maxWidthClass = 'max-w-[490px]';
  @Input() closeOnBackdrop = true;

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
