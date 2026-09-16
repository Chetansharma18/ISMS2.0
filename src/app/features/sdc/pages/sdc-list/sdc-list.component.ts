import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-sdc-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
      <div class="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm whitespace-nowrap">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th class="px-6 py-4">SDC Code</th>
                <th class="px-6 py-4">Center Name</th>
                <th class="px-6 py-4">TP / PIA</th>
                <th class="px-6 py-4">Scheme</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let sdc of sdcs" class="hover:bg-slate-50/50 transition">
                <td class="px-6 py-4 font-mono font-semibold text-rsldc-navy">{{ sdc.sdcCode }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ sdc.name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ sdc.tpName }}</td>
                <td class="px-6 py-4 text-slate-600">
                  <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">{{ sdc.scheme }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
                    [ngClass]="{
                      'bg-approve-100 text-approve-700 border-approve-700/20': sdc.status === 'APPROVED',
                      'bg-pending-100 text-pending-700 border-pending-700/20': sdc.status === 'PENDING_INSPECTION' || sdc.status === 'SUBMITTED',
                      'bg-slate-100 text-slate-700 border-slate-300': sdc.status === 'DRAFT',
                      'bg-reject-100 text-reject-700 border-reject-700/20': sdc.status === 'REJECTED'
                    }">
                    {{ sdc.status.replace('_', ' ') }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <a [routerLink]="['/sdcs', sdc.id]" class="text-rsldc-blueAccent hover:text-rsldc-navy font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition">
                    View Details
                  </a>
                </td>
              </tr>
              
              <!-- Empty State -->
              <tr *ngIf="sdcs.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-slate-500">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-12 h-12 text-slate-300 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <p class="text-base font-semibold text-slate-700">No SDCs found</p>
                    <p class="text-sm mt-1">There are no training centers matching your criteria.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        <div class="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {{ sdcs.length }} of {{ sdcs.length }} entries</span>
          <div class="flex gap-1">
            <button class="px-3 py-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-50" disabled>Previous</button>
            <button class="px-3 py-1.5 border border-slate-300 rounded bg-rsldc-navy text-white">1</button>
            <button class="px-3 py-1.5 border border-slate-300 rounded hover:bg-white disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SdcListComponent {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  
  sdcs: any[] = [];

  constructor() {
    this.loadSdcs();
  }

  loadSdcs() {
    this.http.get<any>('/api/v1/sdcs').subscribe({
      next: (res) => {
        if (res.success) {
          this.sdcs = res.data.items;
        }
      }
    });
  }
}
