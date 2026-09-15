import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 backdrop-blur-[1px] p-4">
      <div class="bg-surface-0 border border-line-200 max-w-lg w-full p-6 relative rounded-none animate-in fade-in zoom-in-95 duration-150">
        
        <!-- Header -->
        <div class="flex items-start gap-3 border-b border-line-200 pb-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-seal-100 text-seal-600 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-serif font-bold text-ink-900">{{ title }}</h3>
            <p class="text-xs text-muted-500 mt-0.5">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Body Content -->
        <div class="text-sm text-ink-900 space-y-3 mb-6">
          <p>{{ message }}</p>
          <div class="p-3 bg-paper-50 border border-line-200 text-xs text-ink-700 leading-relaxed">
            <strong>Important Legal Notice:</strong> Once submitted, the application parameters and technical proposals will be locked and timestamped for scrutiny. No modifications will be permitted after this stage.
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2 border-t border-line-200">
          <button 
            type="button" 
            (click)="onCancel()"
            class="px-4 py-2 border border-line-200 bg-surface-0 text-ink-700 text-xs font-semibold hover:bg-paper-50 transition-colors">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            (click)="onConfirm()"
            class="px-5 py-2 bg-seal-600 text-surface-0 text-xs font-semibold hover:bg-[#9B4523] transition-colors flex items-center gap-1.5">
            <span>{{ confirmText }}</span>
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>

      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Final Submission';
  @Input() subtitle = 'Statutory Expression of Interest (EOI) Filing';
  @Input() message = 'Are you sure you want to finalize and submit this Expression of Interest?';
  @Input() confirmText = 'Yes, Final Submit';
  @Input() cancelText = 'Cancel & Review';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
