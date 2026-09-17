import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <span [ngClass]="textClass" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] text-[12px] font-semibold tabular-nums font-sans">
      <!-- Pencil Icon for Draft -->
      <svg *ngIf="normalizedStatus === 'DRAFT'" class="w-3.5 h-3.5 text-[#5F6F7E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>

      <!-- Check Icon for Submitted -->
      <svg *ngIf="normalizedStatus === 'SUBMITTED'" class="w-3.5 h-3.5 text-[#0B3558]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>

      <!-- Clock Icon for Pending / Under Scrutiny -->
      <svg *ngIf="normalizedStatus === 'UNDER_SCRUTINY' || normalizedStatus === 'UNDER_PROCESS' || normalizedStatus === 'PENDING'" class="w-3.5 h-3.5 text-[#B7791F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>

      <!-- Check Seal Icon for Accepted / Approved -->
      <svg *ngIf="normalizedStatus === 'APPROVED' || normalizedStatus === 'ACCEPTED'" class="w-3.5 h-3.5 text-[#16834B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>

      <!-- X-Circle Icon for Rejected -->
      <svg *ngIf="normalizedStatus === 'REJECTED'" class="w-3.5 h-3.5 text-[#C62828]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>

      <!-- Award / Certificate Icon for AOC -->
      <svg *ngIf="normalizedStatus === 'AOC'" class="w-3.5 h-3.5 text-[#0B3558]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
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

  get textClass(): string {
    switch (this.normalizedStatus) {
      case 'DRAFT':
        return 'bg-[#F1F5F9] text-[#5F6F7E] border border-[#E2E8F0]';
      case 'SUBMITTED':
        return 'bg-[#EEF3F7] text-[#0B3558] border border-[#D9E1E8]';
      case 'UNDER_SCRUTINY':
      case 'UNDER_PROCESS':
      case 'PENDING':
        return 'bg-[#FEF3C7] text-[#B7791F] border border-[#FDE68A]';
      case 'APPROVED':
      case 'ACCEPTED':
        return 'bg-[#E8F5E9] text-[#16834B] border border-[#C8E6C9]';
      case 'REJECTED':
        return 'bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]';
      case 'AOC':
        return 'bg-[#EEF3F7] text-[#0B3558] border border-[#D9E1E8]';
      default:
        return 'bg-[#F1F5F9] text-[#172B3A] border border-[#D9E1E8]';
    }
  }
}
