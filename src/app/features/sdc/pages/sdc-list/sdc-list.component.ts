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
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Skill Development Centers (SDC)</h1>
          <p class="text-sm text-slate-500 mt-1">Manage and track training centers across all schemes.</p>
        </div>
        <a 
          *ngIf="authService.hasRole('TP_PIA')"
          routerLink="/sdcs/create"
          class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rsldc-navyLight transition shadow-md">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Register New SDC
        </a>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-xl shadow-2xs border border-slate-200 flex flex-wrap gap-4 items-end">
        <div class="flex-grow max-w-md">
          <label class="block text-xs font-bold text-slate-700 mb-1">Search</label>
          <div class="relative">
            <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" class="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy focus:border-rsldc-navy" placeholder="Search by SDC Code, TP Name...">
          </div>
        </div>
        <div class="w-48">
          <label class="block text-xs font-bold text-slate-700 mb-1">Status</label>
          <select class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-rsldc-navy focus:border-rsldc-navy bg-white">
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING_INSPECTION">Pending Inspection</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>
        <button class="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition border border-slate-300">
          Filter
        </button>
      </div>

      <!-- SDC Data Table -->
      <app-ui-table
        [columns]="columns"
        [data]="(sdcs$ | async) || []"
        emptyMessage="No SDCs found. There are no training centers matching your criteria.">
        
        <ng-template #rowTemplate let-sdc let-col="column">
          
          <ng-container *ngIf="col.key === 'sdcCode'">
            <div class="font-mono font-semibold text-rsldc-navy">{{ sdc.sdcCode }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'name'">
            <div class="font-semibold text-slate-800">{{ sdc.name }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tpName'">
            <div class="text-slate-600">{{ sdc.tpName }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'scheme'">
            <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{{ sdc.scheme }}</span>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
              [ngClass]="{
                'bg-approve-100 text-approve-700 border-approve-700/20': sdc.status === 'APPROVED',
                'bg-pending-100 text-pending-700 border-pending-700/20': sdc.status === 'PENDING_INSPECTION' || sdc.status === 'SUBMITTED',
                'bg-slate-100 text-slate-700 border-slate-300': sdc.status === 'DRAFT',
                'bg-reject-100 text-reject-700 border-reject-700/20': sdc.status === 'REJECTED'
              }">
              {{ sdc.status.replace('_', ' ') }}
            </span>
          </ng-container>

          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end">
              <a [routerLink]="['/sdcs', sdc.id]" class="text-rsldc-blueAccent hover:text-rsldc-navy font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
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

