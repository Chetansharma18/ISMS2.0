import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { SdcService } from '../../../../core/services/sdc.service';
import { UiTableComponent, TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-batch-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Batch Management</h1>
          <p class="text-sm text-slate-500 mt-1">Manage training batches, faculty, and candidate attendance across all SDCs.</p>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy" placeholder="Search by SDC Code, District...">
          </div>
        </div>
        <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition border border-slate-300">
          Filter
        </button>
      </div>

      <!-- SDC Data Table for Batches -->
      <app-ui-table
        [columns]="columns"
        [data]="(sdcs$ | async) || []"
        emptyMessage="No SDCs found. There are no training centers matching your criteria.">
        
        <ng-template #rowTemplate let-sdc let-col="column">
          
          <ng-container *ngIf="col.key === 'district'">
            <div class="text-slate-600">{{ sdc.district || 'N/A' }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'sdcCode'">
            <div class="font-mono font-semibold text-rsldc-navy">{{ sdc.sdcCode }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'scheme'">
            <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{{ sdc.scheme }}</span>
          </ng-container>

          <ng-container *ngIf="col.key === 'approvedBatches'">
            <div class="text-slate-600 font-semibold">{{ sdc.noOfApprovedBatches || 0 }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'completedBatches'">
            <div class="text-slate-600 font-semibold">{{ sdc.noOfCompletedBatches || 0 }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'ongoingBatches'">
            <div class="text-slate-600 font-semibold">{{ sdc.noOfOngoingBatches || 0 }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end gap-2">
              <a [routerLink]="['/batches/create']" [queryParams]="{ sdcCode: sdc.sdcCode }" class="inline-flex items-center gap-1.5 bg-rsldc-navy text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-rsldc-navyLight transition shadow-md whitespace-nowrap">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Add Batch
              </a>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class BatchListComponent {
  authService = inject(AuthService);
  private sdcService = inject(SdcService);
  
  sdcs$ = this.sdcService.sdcs$;

  columns: TableColumn[] = [
    { key: 'district', label: 'District' },
    { key: 'sdcCode', label: 'SDC Code' },
    { key: 'scheme', label: 'Scheme' },
    { key: 'approvedBatches', label: 'Approved Batches' },
    { key: 'completedBatches', label: 'Completed Batches' },
    { key: 'ongoingBatches', label: 'Ongoing Batches' },
    { key: 'action', label: 'Actions', align: 'right' }
  ];
}
