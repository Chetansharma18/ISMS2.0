import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { TenderService, Tender } from '../../../core/services/tender.service';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  imports: [CommonModule, RouterLink, UiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Tender Management</h1>
          <p class="text-slate-500 mt-1">Manage tenders, process TP applications, and prepare Sanction Orders.</p>
        </div>
      </div>

      <app-ui-table
        [columns]="columns"
        [data]="(tenders$ | async) || []"
        emptyMessage="No tenders found.">
        
        <ng-template #rowTemplate let-tender let-col="column">
          
          <ng-container *ngIf="col.key === 'ref'">
            <div class="font-bold text-[#131A4D]">{{ tender.ref }}</div>
            <div class="text-xs text-slate-500">{{ tender.sector }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'scheme'">
            <div class="font-bold text-slate-700">{{ tender.scheme }}</div>
            <div class="text-xs text-slate-500">{{ tender.eoi }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'applicants'">
            <div class="flex gap-4">
              <div class="text-center">
                <div class="font-black text-[#131A4D]">{{ tender.appliedCount }}</div>
                <div class="text-[10px] text-slate-500 uppercase">Applied</div>
              </div>
              <div class="text-center">
                <div class="font-black text-green-600">{{ tender.approvedCount }}</div>
                <div class="text-[10px] text-green-600 uppercase">Approved</div>
              </div>
            </div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold"
              [ngClass]="{
                'bg-blue-100 text-blue-800': tender.status === 'Processing',
                'bg-amber-100 text-amber-800': tender.status === 'Draft',
                'bg-green-100 text-green-800': tender.status === 'Published',
                'bg-slate-100 text-slate-800': tender.status === 'Closed'
              }">
              {{ tender.status }}
            </span>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end">
              <button routerLink="/department/sanction-orders/create" class="px-4 py-2 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs transition-colors">
                Prepare Sanction Order
              </button>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class TenderListComponent {
  private tenderService = inject(TenderService);
  
  tenders$ = this.tenderService.tenders$;

  columns: TableColumn[] = [
    { key: 'ref', label: 'Tender Ref' },
    { key: 'scheme', label: 'Scheme / EOI' },
    { key: 'applicants', label: 'TP Applicants' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action', align: 'right' }
  ];
}

