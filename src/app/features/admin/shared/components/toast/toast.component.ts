import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';

@Component({
  selector: 'admin-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-xs flex items-start gap-3 transition-all transform duration-300"
        [ngClass]="getToastClass(toast.type)">
        <span class="material-symbols-outlined text-[22px] shrink-0 mt-0.5" [ngClass]="getIconColor(toast.type)">
          {{ getIcon(toast.type) }}
        </span>
        <div class="flex-1 text-left">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-900">{{ toast.title }}</h4>
          <p *ngIf="toast.message" class="text-xs text-slate-600 mt-0.5 leading-relaxed">{{ toast.message }}</p>
        </div>
        <button 
          (click)="toastService.remove(toast.id)"
          class="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-white/95 border-emerald-300 ring-1 ring-emerald-200';
      case 'error': return 'bg-white/95 border-rose-300 ring-1 ring-rose-200';
      case 'warning': return 'bg-white/95 border-amber-300 ring-1 ring-amber-200';
      default: return 'bg-white/95 border-blue-300 ring-1 ring-blue-200';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-rose-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }
}
