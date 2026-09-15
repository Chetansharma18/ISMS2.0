import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../core/services/audit.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { AuditLog } from '../core/models/admin.models';

@Component({
  selector: 'admin-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, ModalComponent],
  template: `
    <div>
      <admin-page-header 
        title="Comprehensive System Audit Trail"
        subtitle="Immutable security audit trail recording all administrative operations, lifecycle status changes, schema modifications, and SSO associations"
        icon="fact_check"
        [breadcrumbs]="[{ label: 'Audit Logs', url: '/admin/audit-logs' }]">
        <div header-actions>
          <span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
            TLS Immutable Stream
          </span>
        </div>
      </admin-page-header>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search Action, User, EOI ID or Reason..."
              class="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
          </div>

          <div>
            <select [(ngModel)]="moduleFilter" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs bg-white">
              <option value="ALL">All Modules</option>
              <option value="EOI">EOI</option>
              <option value="Schemes">Schemes</option>
              <option value="Committees">Committees</option>
              <option value="Users">Users</option>
              <option value="EOI Form Builder">EOI Form Builder</option>
              <option value="Applications">Applications</option>
            </select>
          </div>

          <div class="flex items-center justify-end text-xs text-slate-500 font-semibold">
            <span>Logged Events: {{ filteredLogs().length }}</span>
          </div>
        </div>
      </div>

      <!-- Audit Logs Table (Section 51) -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-4 py-3.5">Timestamp</th>
                <th class="px-4 py-3.5">User & Role</th>
                <th class="px-4 py-3.5">Module</th>
                <th class="px-4 py-3.5">Action Executed</th>
                <th class="px-4 py-3.5">Tender / App Ref</th>
                <th class="px-4 py-3.5">Change Summary (Old vs New)</th>
                <th class="px-4 py-3.5">IP Address</th>
                <th class="px-4 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let log of filteredLogs()" class="hover:bg-slate-50/80 transition-colors">
                <!-- Timestamp -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="font-bold text-slate-800 block">{{ log.timestamp | date:'dd-MM-yyyy' }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ log.timestamp | date:'HH:mm:ss' }}</span>
                </td>

                <!-- User & Role -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="font-semibold text-slate-900 block">{{ log.user }}</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{{ log.role }}</span>
                </td>

                <!-- Module -->
                <td class="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                  {{ log.module }}
                </td>

                <!-- Action -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="font-bold text-slate-900">{{ log.action }}</span>
                </td>

                <!-- EOI / App Ref -->
                <td class="px-4 py-3 whitespace-nowrap font-mono text-blue-900 font-semibold">
                  {{ log.eoiId || log.applicationId || '—' }}
                </td>

                <!-- Changes -->
                <td class="px-4 py-3 max-w-xs">
                  <div *ngIf="log.oldValue" class="text-rose-700 truncate line-through text-[11px]">{{ log.oldValue }}</div>
                  <div class="font-medium text-emerald-800 line-clamp-1 text-[11px]">{{ log.newValue }}</div>
                  <div *ngIf="log.reason" class="text-slate-400 truncate text-[10px]">Reason: {{ log.reason }}</div>
                </td>

                <!-- IP Address -->
                <td class="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                  {{ log.ipAddress }}
                </td>

                <!-- Details Action -->
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button (click)="viewLog(log)" class="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md">
                    <span class="material-symbols-outlined text-[18px]">info</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Log Details Modal -->
      <admin-modal 
        [isOpen]="isModalOpen()" 
        title="Audit Operation Detailed Record"
        icon="security"
        maxWidth="lg"
        (close)="isModalOpen.set(false)">
        <div modal-body *ngIf="selectedLog() as l" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
              <span class="font-bold text-slate-800">{{ l.timestamp | date:'dd-MM-yyyy HH:mm:ss' }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Module</span>
              <span class="font-bold text-blue-900">{{ l.module }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Operator</span>
              <span class="font-bold text-slate-800">{{ l.user }} ({{ l.role }})</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">IP Address</span>
              <span class="font-mono text-slate-700">{{ l.ipAddress }}</span>
            </div>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Action</span>
            <span class="font-black text-sm text-slate-900">{{ l.action }}</span>
          </div>

          <div *ngIf="l.oldValue">
            <span class="text-[10px] uppercase font-bold text-rose-700 block mb-1">Previous Value</span>
            <p class="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-medium">{{ l.oldValue }}</p>
          </div>

          <div>
            <span class="text-[10px] uppercase font-bold text-emerald-700 block mb-1">New Updated Value</span>
            <p class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-medium">{{ l.newValue }}</p>
          </div>

          <div *ngIf="l.reason">
            <span class="text-[10px] uppercase font-bold text-slate-400 block mb-1">Administrative Justification</span>
            <p class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium">{{ l.reason }}</p>
          </div>
        </div>

        <div modal-footer>
          <button (click)="isModalOpen.set(false)" class="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100">
            Close
          </button>
        </div>
      </admin-modal>

    </div>
  `
})
export class AuditLogsComponent implements OnInit {
  private auditService = inject(AuditService);

  logs = signal<AuditLog[]>([]);
  searchQuery = '';
  moduleFilter = 'ALL';

  selectedLog = signal<AuditLog | null>(null);
  isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.auditService.getAuditLogs().subscribe(list => this.logs.set(list));
  }

  filteredLogs(): AuditLog[] {
    return this.logs().filter(l => {
      const matchSearch = !this.searchQuery ||
        l.action.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        l.user.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (l.eoiId && l.eoiId.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (l.reason && l.reason.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchModule = this.moduleFilter === 'ALL' || l.module === this.moduleFilter;

      return matchSearch && matchModule;
    });
  }

  viewLog(l: AuditLog): void {
    this.selectedLog.set(l);
    this.isModalOpen.set(true);
  }
}
