import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        class="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all max-h-[90vh] flex flex-col"
        [ngClass]="maxWidthClass"
      >
        <!-- Header -->
        <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 class="font-bold text-[#131A4D] text-lg">{{ title }}</h3>
          <button (click)="close()" class="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="p-6 overflow-y-auto">
          <ng-content></ng-content>
        </div>
        
        <!-- Footer (Optional) -->
        <div *ngIf="showFooter" class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
          <ng-content select="[modal-footer]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class UiModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' = 'md';
  @Input() showFooter = false;

  @Output() closed = new EventEmitter<void>();

  get maxWidthClass(): string {
    switch (this.maxWidth) {
      case 'sm': return 'max-w-sm w-full';
      case 'md': return 'max-w-md w-full';
      case 'lg': return 'max-w-lg w-full';
      case 'xl': return 'max-w-xl w-full';
      case '2xl': return 'max-w-2xl w-full';
      default: return 'max-w-md w-full';
    }
  }

  close() {
    this.closed.emit();
  }
}
