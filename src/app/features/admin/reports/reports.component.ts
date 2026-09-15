import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ReportSummaryData } from '../core/services/report.service';
import { ToastService } from '../core/services/toast.service';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

@Component({
  selector: 'admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div>
      <admin-page-header 
        title="State Tender & Financial Reports"
        subtitle="Generate, review, and export statutory audit statements, fee collection ledgers, and committee evaluations"
        icon="analytics"
        [breadcrumbs]="[{ label: 'Reports', url: '/admin/reports' }]">
        <div header-actions class="flex items-center gap-2">
          <button (click)="exportCsv()" [disabled]="!currentReport()" class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px] text-emerald-600">csv</span>
            Export CSV
          </button>
          <button (click)="printReport()" [disabled]="!currentReport()" class="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">print</span>
            Print / Save PDF
          </button>
        </div>
      </admin-page-header>

      <!-- 10 Report Types Selector -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button 
          *ngFor="let rt of reportTypes"
          (click)="selectReport(rt.id)"
          class="p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5"
          [ngClass]="selectedType === rt.id ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'">
          <span class="material-symbols-outlined text-[20px] mt-0.5" [ngClass]="selectedType === rt.id ? 'text-blue-700' : 'text-slate-400'">
            {{ rt.icon }}
          </span>
          <div>
            <span class="font-bold text-xs block" [ngClass]="selectedType === rt.id ? 'text-blue-950' : 'text-slate-800'">
              {{ rt.name }}
            </span>
            <span class="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{{ rt.description }}</span>
          </div>
        </button>
      </div>

      <!-- Filters Bar -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full sm:w-auto">
          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Start Date</label>
            <input type="date" [(ngModel)]="startDate" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white" />
          </div>
          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">End Date</label>
            <input type="date" [(ngModel)]="endDate" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white" />
          </div>
          <div>
            <label class="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Scheme Filter</label>
            <select [(ngModel)]="schemeFilter" class="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
              <option value="ALL">All Schemes</option>
              <option value="MMKVY">MMKVY</option>
              <option value="RAJKVIK">RAJKVIK</option>
            </select>
          </div>
        </div>

        <button (click)="generateReport()" class="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer">
          Generate Statement
        </button>
      </div>

      <!-- Generated Report Sheet Card -->
      <div *ngIf="currentReport() as report" class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden" id="printable-report">
        
        <div class="p-6 border-b border-slate-200 bg-slate-50/50">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span class="text-[10px] uppercase font-bold text-blue-900 tracking-wider block">Official State Government Audit Report</span>
              <h3 class="text-base font-bold text-slate-900 mt-0.5">{{ report.title }}</h3>
            </div>
            <div class="text-left sm:text-right text-xs text-slate-500">
              <div>Generated: <strong class="text-slate-800">{{ report.generatedAt }}</strong></div>
              <div>Signatory: <strong class="text-slate-800">{{ report.generatedBy }}</strong></div>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-4 text-xs">
            <span class="px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 font-bold">
              {{ report.totalRecords }} Total Records
            </span>
            <span *ngIf="report.totalFinancialVolumeINR" class="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold">
              Volume: ₹{{ report.totalFinancialVolumeINR | number:'1.0-0' }} INR
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-100/70 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th *ngFor="let h of report.headers" class="px-4 py-3">{{ h }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let row of report.rows" class="hover:bg-slate-50">
                <td *ngFor="let cell of row" class="px-4 py-3 font-medium">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  reportTypes = this.reportService.getReportTypes();
  selectedType = 'EOI_SUMMARY';
  startDate = '2024-04-01';
  endDate = new Date().toISOString().split('T')[0];
  schemeFilter = 'ALL';

  currentReport = signal<ReportSummaryData | null>(null);

  ngOnInit(): void {
    this.generateReport();
  }

  selectReport(typeId: string): void {
    this.selectedType = typeId;
    this.generateReport();
  }

  generateReport(): void {
    this.reportService.generateReport({
      reportType: this.selectedType,
      startDate: this.startDate,
      endDate: this.endDate,
      scheme: this.schemeFilter
    }).subscribe(rep => {
      this.currentReport.set(rep);
    });
  }

  exportCsv(): void {
    const r = this.currentReport();
    if (r) {
      this.reportService.exportToCsv(r);
      this.toastService.success('CSV Downloaded', `${r.title} exported.`);
    }
  }

  printReport(): void {
    window.print();
  }
}
