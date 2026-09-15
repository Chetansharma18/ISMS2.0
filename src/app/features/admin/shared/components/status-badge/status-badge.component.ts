import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'admin-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs transition-all"
      [ngClass]="getBadgeClass()">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClass()"></span>
      {{ status }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: string = 'Active';

  getBadgeClass(): string {
    const s = this.status?.toUpperCase() || '';
    switch (s) {
      case 'OPEN':
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'PAYMENT VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DRAFT':
      case 'CONFIGURED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'UNDER REVIEW':
      case 'PENDING APPROVAL':
      case 'SUBMITTED':
      case 'COMMITTEE REVIEW':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'RESCHEDULED':
      case 'PAYMENT PENDING':
      case 'CLARIFICATION REQUIRED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLOSED':
      case 'ARCHIVED':
      case 'WITHDRAWN':
        return 'bg-zinc-100 text-zinc-700 border-zinc-300';
      case 'INACTIVE':
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getDotClass(): string {
    const s = this.status?.toUpperCase() || '';
    switch (s) {
      case 'OPEN':
      case 'PUBLISHED':
      case 'ACTIVE':
      case 'ACCEPTED':
      case 'PAYMENT VERIFIED':
        return 'bg-emerald-500 animate-pulse';
      case 'DRAFT':
      case 'CONFIGURED':
        return 'bg-slate-400';
      case 'UNDER REVIEW':
      case 'PENDING APPROVAL':
      case 'SUBMITTED':
      case 'COMMITTEE REVIEW':
        return 'bg-blue-500';
      case 'RESCHEDULED':
      case 'PAYMENT PENDING':
      case 'CLARIFICATION REQUIRED':
        return 'bg-amber-500';
      case 'CLOSED':
      case 'ARCHIVED':
      case 'WITHDRAWN':
        return 'bg-zinc-500';
      case 'INACTIVE':
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}
