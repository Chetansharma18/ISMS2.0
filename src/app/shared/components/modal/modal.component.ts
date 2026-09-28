import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-white rounded-lg border border-border shadow-[0_8px_24px_rgba(31,41,51,0.12)] w-full overflow-hidden flex flex-col max-h-[90vh] font-sans"
          [ngClass]="maxWidthClass"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="px-5 py-3.5 border-b border-border bg-white flex items-center justify-between gap-3 shrink-0">
            <h3 class="text-[16px] leading-6 font-semibold text-text-primary tracking-tight m-0">
              {{ title }}
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="w-7 h-7 rounded-sm text-text-muted hover:text-text-primary hover:bg-primary-light flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
              title="Close modal"
              aria-label="Close modal"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div class="p-5 overflow-y-auto flex-1 text-[14px] leading-5.5 text-text-primary">
            <ng-content></ng-content>
          </div>

          <!-- Modal Footer (Optional Slot) -->
          <div class="px-5 py-3 border-t border-border bg-[#F5F7F9] flex items-center justify-end gap-2.5 shrink-0">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidthClass = 'max-w-xl';
  @Input() closeOnBackdrop = true;

  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }
}
