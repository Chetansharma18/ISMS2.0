import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-12 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      <div class="w-14 h-14 mx-auto mb-3.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <span class="material-symbols-outlined text-[28px]">{{ icon }}</span>
      </div>
      <h3 class="text-base font-semibold text-slate-800">{{ title }}</h3>
      <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">{{ message }}</p>
      <div *ngIf="actionLabel" class="mt-4">
        <button 
          (click)="actionClick.emit()"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium shadow-xs transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">add</span>
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'inventory_2';
  @Input() title: string = 'No records found';
  @Input() message: string = 'There are no items matching your criteria at this moment.';
  @Input() actionLabel?: string;
  @Output() actionClick = new EventEmitter<void>();
}
