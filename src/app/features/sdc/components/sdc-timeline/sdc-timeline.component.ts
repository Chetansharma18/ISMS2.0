import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sdc-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative py-4">
      <div class="absolute left-1/2 md:left-0 md:top-1/2 w-0.5 h-full md:w-full md:h-0.5 bg-slate-200 -translate-x-1/2 md:-translate-x-0 md:-translate-y-1/2 z-0"></div>
      
      <div class="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">
        
        <!-- Step 1: Created -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition"
               [ngClass]="currentStatus === 'DRAFT' || statusLevel >= 1 ? 'bg-rsldc-navy text-white' : 'bg-white border-2 border-slate-300 text-slate-400'">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </div>
          <span class="text-xs font-bold mt-2" [ngClass]="statusLevel >= 1 ? 'text-rsldc-navy' : 'text-slate-500'">Created</span>
        </div>

        <!-- Step 2: Submitted -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition"
               [ngClass]="statusLevel >= 2 ? 'bg-rsldc-navy text-white' : 'bg-white border-2 border-slate-300 text-slate-400'">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <span class="text-xs font-bold mt-2" [ngClass]="statusLevel >= 2 ? 'text-rsldc-navy' : 'text-slate-500'">Submitted</span>
        </div>

        <!-- Step 3: Inspection -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition"
               [ngClass]="statusLevel >= 3 ? (currentStatus === 'RE_INSPECTION_REQUIRED' ? 'bg-amber-500 text-white' : 'bg-rsldc-navy text-white') : 'bg-white border-2 border-slate-300 text-slate-400'">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <span class="text-xs font-bold mt-2 text-center leading-tight" [ngClass]="statusLevel >= 3 ? 'text-rsldc-navy' : 'text-slate-500'">
            Inspection<br><span *ngIf="currentStatus === 'RE_INSPECTION_REQUIRED'" class="text-amber-600">(Re-Req)</span>
          </span>
        </div>

        <!-- Step 4: Approval -->
        <div class="flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md transition"
               [ngClass]="statusLevel >= 4 ? (currentStatus === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-approve-700 text-white') : 'bg-white border-2 border-slate-300 text-slate-400'">
            <svg *ngIf="currentStatus !== 'REJECTED'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <svg *ngIf="currentStatus === 'REJECTED'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <span class="text-xs font-bold mt-2" [ngClass]="statusLevel >= 4 ? (currentStatus === 'REJECTED' ? 'text-red-700' : 'text-approve-700') : 'text-slate-500'">
            {{ currentStatus === 'REJECTED' ? 'Rejected' : 'Approved' }}
          </span>
        </div>

      </div>
    </div>
  `
})
export class SdcTimelineComponent {
  @Input() currentStatus: string = 'DRAFT';

  get statusLevel(): number {
    switch (this.currentStatus) {
      case 'DRAFT': return 1;
      case 'SUBMITTED': 
      case 'PENDING_INSPECTION': return 2;
      case 'INSPECTION_COMPLETED':
      case 'RE_INSPECTION_REQUIRED': return 3;
      case 'PENDING_APPROVAL': return 3;
      case 'APPROVED': 
      case 'ACTIVE':
      case 'REJECTED': return 4;
      default: return 1;
    }
  }
}
