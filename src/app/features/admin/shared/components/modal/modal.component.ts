import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        (click)="closeOnBackdrop ? close.emit() : null">
      </div>

      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          class="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full border border-slate-200"
          [ngClass]="maxWidthClass">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div class="flex items-center gap-2.5">
              <span *ngIf="icon" class="material-symbols-outlined text-[22px] text-blue-700">{{ icon }}</span>
              <h3 class="text-base font-bold text-slate-900" id="modal-title">{{ title }}</h3>
            </div>
            <button 
              (click)="close.emit()" 
              class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 max-h-[78vh] overflow-y-auto">
            <ng-content select="[modal-body]"></ng-content>
          </div>

          <!-- Footer -->
          <div *ngIf="hasFooter" class="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() icon?: string;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' = 'lg';
  @Input() closeOnBackdrop: boolean = true;
  @Input() hasFooter: boolean = true;
  @Output() close = new EventEmitter<void>();

  get maxWidthClass(): string {
    switch (this.maxWidth) {
      case 'sm': return 'sm:max-w-sm';
      case 'md': return 'sm:max-w-md';
      case 'lg': return 'sm:max-w-lg';
      case 'xl': return 'sm:max-w-xl';
      case '2xl': return 'sm:max-w-2xl';
      case '3xl': return 'sm:max-w-3xl';
      case '4xl': return 'sm:max-w-4xl';
      default: return 'sm:max-w-lg';
    }
  }
}
