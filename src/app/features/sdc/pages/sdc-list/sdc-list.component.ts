import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { SdcService, Sdc } from '../../../../core/services/sdc.service';
import { UiTableComponent, TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';

@Component({
  selector: 'app-sdc-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-extrabold text-[#131A4D] tracking-tight">Skill Development Centers (SDC)</h1>
          <p class="text-xs text-slate-500 mt-1">Rajasthan Skill & Livelihoods Development Corporation • Approved Center Directory</p>
        </div>
        <a 
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/sdcs/create"
          class="inline-flex items-center gap-2 bg-[#131A4D] text-white px-4 py-2 rounded text-xs font-bold hover:bg-[#0a0e29] transition shadow-xs">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Register New SDC
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search Centers</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-[#131A4D]" placeholder="Search by SDC Code, Center Name, TP...">
          </div>
        </div>
      </div>

      <!-- SDC Data Table -->
      <app-ui-table
        [columns]="columns"
        [data]="(sdcs$ | async) || []"
        emptyMessage="No SDCs found. There are no training centers registered.">
        
        <ng-template #rowTemplate let-sdc let-col="column">
          
          <ng-container *ngIf="col.key === 'sdcCode'">
            <div class="font-mono font-bold text-[#131A4D] text-xs">{{ sdc.sdcCode }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'name'">
            <div class="font-bold text-slate-800 text-xs">{{ sdc.name }}</div>
            <div class="text-[10px] text-slate-500 font-semibold">{{ sdc.district || 'Jaipur' }} District</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tpName'">
            <div class="text-xs font-semibold text-slate-700">{{ sdc.tpName }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'scheme'">
            <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-300 uppercase">{{ sdc.scheme }}</span>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase inline-block"
              [ngClass]="{
                'bg-green-50 text-green-700 border-green-300': sdc.status === 'APPROVED',
                'bg-amber-50 text-amber-800 border-amber-300': sdc.status === 'PENDING_INSPECTION' || sdc.status === 'SUBMITTED',
                'bg-slate-100 text-slate-700 border-slate-300': sdc.status === 'DRAFT',
                'bg-red-50 text-red-700 border-red-300': sdc.status === 'REJECTED'
              }">
              {{ sdc.status.replace('_', ' ') }}
            </span>
          </ng-container>

          <!-- ACTIONS COLUMN -->
          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end items-center gap-2">
              
              <!-- ➕ CREATE BATCH BUTTON FOR THIS SDC -->
              <a 
                *ngIf="sdc.status === 'APPROVED' && authService.hasRole('TP_PIA')"
                [routerLink]="['/batches/create']"
                [queryParams]="{ sdcCode: sdc.sdcCode, sdcName: sdc.name, scheme: sdc.scheme }"
                class="inline-flex items-center gap-1 bg-[#131A4D] hover:bg-[#0a0e29] text-white px-3 py-1.5 rounded text-xs font-bold shadow-xs transition-all">
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                + Create Batch
              </a>

              <a [routerLink]="['/sdcs', sdc.id]" class="text-slate-700 hover:text-[#131A4D] font-bold text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition border border-slate-300">
                View Details
              </a>
            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class SdcListComponent {
  authService = inject(AuthService);
  private sdcService = inject(SdcService);
  
  sdcs$ = this.sdcService.sdcs$;

  columns: TableColumn[] = [
    { key: 'sdcCode', label: 'SDC Code' },
    { key: 'name', label: 'Center Name' },
    { key: 'tpName', label: 'TP / PIA' },
    { key: 'scheme', label: 'Scheme' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Actions', align: 'right' }
  ];
}
