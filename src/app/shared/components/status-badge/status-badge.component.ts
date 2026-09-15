import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgIf, NgClass],
  template: `
    <span [ngClass]="badgeClass" class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border tabular-nums">
      <!-- Pencil Icon for Draft -->
      <svg *ngIf="normalizedStatus === 'DRAFT'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
      </svg>

      <!-- Check Icon for Submitted -->
      <svg *ngIf="normalizedStatus === 'SUBMITTED'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>

      <!-- Clock Icon for Under Scrutiny / Pending -->
      <svg *ngIf="normalizedStatus === 'UNDER_SCRUTINY' || normalizedStatus === 'UNDER_PROCESS' || normalizedStatus === 'PENDING'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>

      <!-- Check Seal Icon for Approved -->
      <svg *ngIf="normalizedStatus === 'APPROVED' || normalizedStatus === 'ACCEPTED'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <polyline points="9 12 11 14 15 10"></polyline>
      </svg>

      <!-- X-Circle Icon for Rejected -->
      <svg *ngIf="normalizedStatus === 'REJECTED'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
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
      case 'PENDING': return 'Under Scrutiny';
      case 'APPROVED':
      case 'ACCEPTED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return this.status;
    }
  }

  get badgeClass(): string {
    switch (this.normalizedStatus) {
      case 'DRAFT':
        return 'bg-[#EAE7DF] text-muted-500 border-line-200';
      case 'SUBMITTED':
        return 'bg-paper-50 text-ink-700 border-line-200';
      case 'UNDER_SCRUTINY':
      case 'UNDER_PROCESS':
      case 'PENDING':
        return 'bg-pending-100 text-pending-700 border-[#E4D4B0]';
      case 'APPROVED':
      case 'ACCEPTED':
        return 'bg-approve-100 text-approve-700 border-[#BBDAC9]';
      case 'REJECTED':
        return 'bg-reject-100 text-reject-700 border-[#E3BFBA]';
      default:
        return 'bg-paper-50 text-ink-700 border-line-200';
    }
  }
}
