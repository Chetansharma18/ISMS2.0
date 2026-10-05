import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MOCK_SANCTION_ORDERS, SanctionOrder } from '../models/sdc.model';
import {
  PageHeaderComponent,
  TableComponent,
  TableColumn
} from '../../../shared';

@Component({
  selector: 'app-sanction-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header title="Sanction Order"></app-page-header>

        <!-- Success Toast Notification -->
        @if (successMessage()) {
          <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <span class="font-bold text-emerald-700">Success:</span>
              <span>{{ successMessage() }}</span>
            </div>
            <button (click)="successMessage.set('')" class="text-emerald-600 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- Orders Table via Reusable TableComponent -->
        <app-table
          [columns]="orderColumns"
          [data]="orders"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="orders"
          emptyMessage="No sanction orders available."
          [customTemplates]="{
            schemeName: schemeNameTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Scheme Name -->
        <ng-template #schemeNameTemplate let-so>
          <span class="font-bold text-slate-900">{{ so.schemeName || so.scheme }}</span>
        </ng-template>

        <!-- Template: Actions (View Sanction Order) -->
        <ng-template #actionsTemplate let-so>
          <button
            type="button"
            (click)="openSanctionOrderModal(so)"
            class="whitespace-nowrap inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-95 w-full"
            title="View Sanction Order for {{ so.schemeName || so.scheme }}"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Sanction Order</span>
          </button>
        </ng-template>

      </div>
    </div>

    <!-- SANCTION ORDER DOCUMENT PREVIEW MODAL -->
    @if (selectedOrder()) {
      <div
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
          
          <!-- Modal Top Toolbar -->
          <div class="px-5 py-3.5 bg-[#0B3558] text-white flex items-center justify-between shrink-0 shadow-sm">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 class="font-bold text-sm leading-tight">Official Sanction Order</h3>
                <p class="text-[11px] text-slate-300">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</p>
              </div>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printSanctionOrderDocument()"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print / Download PDF</span>
              </button>
              <button
                type="button"
                (click)="closeSanctionOrderModal()"
                class="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- OFFICIAL SANCTION ORDER DOCUMENT CONTENT -->
          <div id="sanction-order-document-sheet" class="p-6 sm:p-10 overflow-y-auto space-y-4 text-slate-900 text-xs leading-normal bg-white">
            
            <!-- Letterhead Header -->
            <div class="relative border-b-2 border-slate-900 pb-3 font-sans pt-1 text-center space-y-1">
              <div class="text-[11px] font-bold text-amber-700 tracking-wider uppercase">GOVERNMENT OF RAJASTHAN</div>
              <div class="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight uppercase">
                RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION
              </div>
              <div class="text-slate-700 text-xs font-medium">
                (A Government of Rajasthan Undertaking)
              </div>
              <div class="text-slate-600 text-[11px]">
                EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004
              </div>
            </div>

            <!-- Order Reference Row -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans pt-2 border-b border-slate-200 pb-2">
              <div>
                <span class="font-semibold text-slate-700">Order No: </span>
                <span class="font-mono font-bold text-slate-900">RSLDC/SANCTION/2026-27/{{ selectedOrder()?.ipaNumber }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="border border-slate-300 bg-slate-50 px-2.5 py-0.5 rounded text-xs font-mono font-bold text-slate-800">
                  Ref: {{ selectedOrder()?.ipaNumber }}
                </span>
                <div>
                  <span class="font-semibold text-slate-700">Date: </span>
                  <span class="font-mono font-bold text-slate-900">{{ selectedOrder()?.mouStartDate || '08/09/2023' }}</span>
                </div>
              </div>
            </div>

            <!-- Subject -->
            <div class="bg-amber-50/80 border-l-4 border-amber-500 p-2.5 rounded-r font-sans text-xs">
              <p class="font-bold text-slate-900">
                Subject: Sanction Order for Execution of Skill Training Program under {{ selectedOrder()?.schemeName || selectedOrder()?.scheme }} (Category: {{ selectedOrder()?.category }}).
              </p>
            </div>

            <!-- Preamble text -->
            <div class="text-justify leading-relaxed text-slate-800 space-y-2">
              <p>
                Sanction of the Competent Authority, Rajasthan Skill and Livelihoods Development Corporation (RSLDC) is hereby accorded to allocate targets and operationalize Skill Development Centers (SDCs) under <strong>{{ selectedOrder()?.schemeName || selectedOrder()?.scheme }}</strong> scheme as per the approved guidelines and criteria outlined below:
              </p>
            </div>

            <!-- Allocated Target Details Table -->
            <div class="border border-slate-300 rounded overflow-hidden">
              <table class="w-full text-left border-collapse text-xs">
                <thead class="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <tr>
                    <th class="p-2 border-r border-slate-300 text-center">Sr. No</th>
                    <th class="p-2 border-r border-slate-300">Application ID</th>
                    <th class="p-2 border-r border-slate-300">Name of PIA</th>
                    <th class="p-2 border-r border-slate-300">IPA Number</th>
                    <th class="p-2 border-r border-slate-300">District</th>
                    <th class="p-2 border-r border-slate-300">Sector(s)</th>
                    <th class="p-2 border-r border-slate-300 text-center">Category</th>
                    <th class="p-2 border-r border-slate-300 text-center">Grade</th>
                    <th class="p-2 border-r border-slate-300 text-center">Sanction Target</th>
                    <th class="p-2 text-center">Sanction Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr class="hover:bg-slate-50">
                    <td class="p-2 border-r border-slate-300 text-center font-bold">1</td>
                    <td class="p-2 border-r border-slate-300 font-mono font-bold text-[#174A6E]">{{ selectedOrder()?.appId || 'APP-2024-001' }}</td>
                    <td class="p-2 border-r border-slate-300 font-medium">{{ selectedOrder()?.agencyName || 'Apex Skill Development Foundation' }}</td>
                    <td class="p-2 border-r border-slate-300 font-mono font-semibold text-slate-800">{{ selectedOrder()?.ipaNumber }}</td>
                    <td class="p-2 border-r border-slate-300">{{ selectedOrder()?.district || 'Jaipur' }}</td>
                    <td class="p-2 border-r border-slate-300">{{ (selectedOrder()?.sectors || ['Electronics', 'IT']).join(', ') }}</td>
                    <td class="p-2 border-r border-slate-300 text-center">
                      <span class="px-2 py-0.5 rounded bg-blue-50 text-[#0B3558] border border-blue-200 font-bold text-[11px]">
                        {{ selectedOrder()?.category }}
                      </span>
                    </td>
                    <td class="p-2 border-r border-slate-300 text-center font-bold text-emerald-700">
                      {{ selectedOrder()?.grade || 'A' }}
                    </td>
                    <td class="p-2 border-r border-slate-300 text-center font-bold text-[#0B3558]">
                      {{ selectedOrder()?.sanctionTarget || 300 }}
                    </td>
                    <td class="p-2 text-center">
                      <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                        Approved &amp; Issued
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Terms & Conditions Clause List -->
            <div class="space-y-2 pt-2 text-slate-800">
              <h4 class="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase text-[11px] tracking-wide">
                Key Terms &amp; Conditions:
              </h4>
              <ol class="list-decimal pl-5 space-y-1.5 leading-relaxed text-justify text-[11.5px]">
                <li>The Training Partner shall strictly adhere to the guidelines, common norms, and standard operating procedures (SOP) prescribed by RSLDC and Government of Rajasthan.</li>
                <li>Biometric AEBAS attendance and CCTV integration must be operational at all registered Skill Development Centers (SDCs) prior to batch commencement.</li>
                <li>Training curriculum, trainer qualification, and batch assessment must conform to National Skills Qualifications Framework (NSQF) standards.</li>
                <li>Payment disbursements shall be linked to milestone achievements as specified in the scheme guidelines.</li>
                <li>RSLDC reserves the right to inspect training centers, audit batch logs, or terminate sanction upon non-compliance.</li>
              </ol>
            </div>

            <!-- Official Signatory Box -->
            <div class="pt-8 flex justify-between items-end">
              <div class="text-[11px] text-slate-500 font-mono">
                System Generated Sanction Document<br>
                Verification Code: {{ selectedOrder()?.ipaNumber }}-SEC
              </div>
              <div class="text-right space-y-1">
                <div class="font-bold text-slate-900 text-xs">Managing Director / Authorized Officer</div>
                <div class="text-slate-600 text-[11px]">Rajasthan Skill and Livelihoods Development Corporation</div>
                <div class="text-slate-500 text-[10px]">Jaipur, Rajasthan</div>
              </div>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              (click)="closeSanctionOrderModal()"
              class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              (click)="printSanctionOrderDocument()"
              class="px-4 py-2 bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Download</span>
            </button>
          </div>

        </div>
      </div>
    }
  `
})
export class SanctionOrdersComponent {
  private router = inject(Router);

  readonly pageSize = 10;
  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;
  successMessage = signal<string>('');
  selectedOrder = signal<SanctionOrder | null>(null);

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: 'ipaNumber',        label: 'IPA Number',           align: 'center', width: 'w-36',  cellClass: 'whitespace-nowrap font-mono font-medium text-slate-700 text-center' },
    { key: 'schemeName',       label: 'Scheme Name',          align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900 text-center' },
    { key: 'category',         label: 'Category',             align: 'center',                 cellClass: 'whitespace-nowrap font-medium text-slate-700 text-center' },
    { key: 'actions',          label: 'Action',               align: 'center', type: 'custom', width: 'w-56' }
  ];

  openSanctionOrderModal(so: SanctionOrder): void {
    this.selectedOrder.set(so);
  }

  closeSanctionOrderModal(): void {
    this.selectedOrder.set(null);
  }

  printSanctionOrderDocument(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}

