import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-bold border tabular-nums">
      <!-- Pencil Icon for Draft -->
      <svg *ngIf="normalizedStatus === 'DRAFT'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>

      <!-- Check Icon for Submitted -->
      <svg *ngIf="normalizedStatus === 'SUBMITTED'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>

      <!-- Clock Icon for Pending / Under Scrutiny -->
      <svg *ngIf="normalizedStatus === 'UNDER_SCRUTINY' || normalizedStatus === 'UNDER_PROCESS' || normalizedStatus === 'PENDING'" class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>

      <!-- Check Seal Icon for Accepted / Approved -->
      <svg *ngIf="normalizedStatus === 'APPROVED' || normalizedStatus === 'ACCEPTED'" class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>

      <!-- X-Circle Icon for Rejected -->
      <svg *ngIf="normalizedStatus === 'REJECTED'" class="w-3.5 h-3.5 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>

      <!-- Award / Certificate Icon for AOC -->
      <svg *ngIf="normalizedStatus === 'AOC'" class="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
      </svg>

      <span>{{ displayLabel }}</span>
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = 'DRAFT';

  get normalizedStatus(): string {
    return (this.status || '').toUpperCase().replace(/[\s-]/g, '_');
  }

  get displayLabel(): string {
    switch (this.normalizedStatus) {
      case 'DRAFT': return 'Draft';
      case 'SUBMITTED': return 'Submitted';
      case 'UNDER_SCRUTINY':
      case 'UNDER_PROCESS':
      case 'PENDING': return 'Pending';
      case 'APPROVED':
      case 'ACCEPTED': return 'Accepted';
      case 'REJECTED': return 'Rejected';
      case 'AOC': return 'AOC';
      default: return this.status;
    }
  }

  get badgeClass(): string {
    switch (this.normalizedStatus) {
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'SUBMITTED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'UNDER_SCRUTINY':
      case 'UNDER_PROCESS':
      case 'PENDING':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'APPROVED':
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'AOC':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  }
}
