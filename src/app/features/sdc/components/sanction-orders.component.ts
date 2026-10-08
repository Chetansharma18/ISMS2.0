import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MOCK_SANCTION_ORDERS, SanctionOrder } from '../models/sdc.model';
import { EoiStateService, SanctionOrderDocumentData } from '../../eoi/services/eoi-state.service';
import { environment } from '../../../../environments/environment';
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

    <!-- SANCTION ORDER DOCUMENT PREVIEW MODAL (EXACT SAME FORMAT AS ADMIN, NON-EDITABLE) -->
    @if (selectedOrder(); as so) {
      @if (activeSanctionDoc(); as doc) {
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 font-sans animate-in fade-in duration-150 overflow-y-auto print:p-0 print:static print:bg-white print:z-auto"
          role="dialog"
          aria-modal="true"
        >
          <div class="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-slate-300 print:max-h-none print:shadow-none print:border-none print:rounded-none">
            
            <!-- Modal Top Toolbar (Hidden during Print) -->
            <div class="px-5 py-3.5 bg-[#0B3558] text-white flex items-center justify-between shrink-0 shadow-sm print:hidden">
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

            <!-- OFFICIAL SANCTION ORDER DOCUMENT CONTENT (Matching PDF 1 Exactly, Non-editable) -->
            <div id="sanction-order-document-sheet" class="p-6 sm:p-10 overflow-y-auto space-y-4 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm bg-white print:p-0 print:overflow-visible">
              
              <!-- Letterhead Header with Logos -->
              <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
                <div class="flex items-center justify-between gap-4 mb-2">
                  <!-- Left Emblem Logo -->
                  <div class="w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
                    <img [src]="doc.leftLogoUrl || defaultEmblemSvg" alt="Emblem Logo" class="max-w-full max-h-full object-contain" />
                  </div>

                  <!-- Header Titles -->
                  <div class="flex-1 space-y-1">
                    <div class="font-bold text-slate-900 text-base sm:text-lg uppercase">
                      {{ doc.headerTitle }}
                    </div>
                    <div class="font-medium text-slate-700 text-xs">
                      {{ doc.headerSubtitle }}
                    </div>
                    <div class="text-[11px] text-slate-600">
                      {{ doc.headerAddress }}
                    </div>
                  </div>

                  <!-- Right Organization Logo -->
                  <div class="w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
                    @if (doc.rightLogoUrl) {
                      <img [src]="doc.rightLogoUrl" alt="Right Logo" class="max-w-full max-h-full object-contain" />
                    } @else {
                      <div class="text-center font-bold text-[#0B3558] leading-tight text-[11px] font-sans px-1">
                        RSLDC<br>JAIPUR
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- File No & Date Row -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs font-semibold mb-4 border-b border-slate-200 pb-2">
                <div class="flex items-center gap-1.5">
                  <span class="text-slate-600">File No:</span>
                  <span class="font-mono text-slate-900">{{ doc.fileNo }}</span>
                </div>

                <div class="flex items-center gap-1.5">
                  <span class="text-slate-600">Date:</span>
                  <span class="font-mono text-slate-900">{{ doc.sanctionDate }}</span>
                </div>
              </div>

              <!-- Document Main Heading -->
              <div class="text-center my-3">
                <h2 class="font-bold text-slate-900 text-base tracking-wide uppercase underline">
                  {{ doc.documentTitle || 'SANCTION ORDER' }}
                </h2>
              </div>

              <!-- Subject & Reference Section -->
              <div class="space-y-2 mb-4 font-sans text-xs">
                <div class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">Subject:</span>
                  <p class="font-medium text-slate-800 m-0 leading-relaxed">{{ doc.subjectText }}</p>
                </div>

                <div class="flex items-start gap-2">
                  <span class="font-bold text-slate-900 shrink-0">Ref:</span>
                  <p class="text-slate-700 m-0 leading-relaxed">{{ doc.referenceText }}</p>
                </div>
              </div>

              <!-- Preamble Paragraph -->
              <div class="mb-4 text-justify font-serif text-xs sm:text-sm leading-relaxed text-slate-800">
                <p class="m-0">{{ doc.preambleText }}</p>
              </div>

              <!-- ALLOCATED PHYSICAL TARGETS TABLE -->
              <div class="my-6">
                <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight mb-2 font-sans">
                  ALLOCATED PHYSICAL TARGETS TABLE (APPROVED PIAS &amp; AGENCIES):
                </h4>

                <div class="w-full">
                  <table class="w-full text-left border-collapse font-sans text-[10.5px] sm:text-[11px] table-fixed">
                    <thead>
                      <tr class="bg-slate-100 text-slate-900 border border-slate-800 font-bold text-center">
                        <th class="p-1 border border-slate-800 w-[6%]">Sr. No</th>
                        <th class="p-1 border border-slate-800 w-[14%]">Application ID</th>
                        <th class="p-1 border border-slate-800 w-[24%]">Name Of the Agency/PIA</th>
                        <th class="p-1 border border-slate-800 w-[14%]">Sanction District</th>
                        <th class="p-1 border border-slate-800 w-[18%]">Sanction Sector(s)</th>
                        <th class="p-1 border border-slate-800 w-[14%]">Application Category</th>
                        <th class="p-1 border border-slate-800 w-[6%]">Grade</th>
                        <th class="p-1 border border-slate-800 w-[10%]">Sanction Target</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (row of doc.tableRows; track row.id; let i = $index) {
                        <tr class="border border-slate-800 hover:bg-slate-50 transition-colors">
                          <td class="border border-slate-800 p-1 text-center font-bold">
                            {{ i + 1 }}
                          </td>
                          <td class="border border-slate-800 p-1 font-mono text-center font-semibold text-slate-900">
                            {{ row.appId }}
                          </td>
                          <td class="border border-slate-800 p-1 font-medium text-slate-900 truncate">
                            {{ row.agencyName }}
                          </td>
                          <td class="border border-slate-800 p-1 text-slate-800">
                            {{ row.district }}
                          </td>
                          <td class="border border-slate-800 p-1 text-slate-800 truncate">
                            {{ row.sector }}
                          </td>
                          <td class="border border-slate-800 p-1 text-center font-medium text-slate-800">
                            {{ row.category }}
                          </td>
                          <td class="border border-slate-800 p-1 text-center font-bold text-emerald-800">
                            {{ row.grade }}
                          </td>
                          <td class="border border-slate-800 p-1 text-center font-bold text-slate-900">
                            {{ row.target }}
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TERMS AND CONDITIONS SECTION -->
              <div class="mt-6 mb-4 font-sans text-xs">
                <p class="font-bold text-slate-900 mb-2">
                  The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):
                </p>
                <ol class="list-decimal pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs">
                  @for (clause of doc.termsAndConditions; track i; let i = $index) {
                    <li class="pl-1">
                      <span class="font-serif leading-relaxed text-slate-800">{{ clause }}</span>
                    </li>
                  }
                </ol>
              </div>

              <!-- DISPATCH & SIGNATORY BLOCK -->
              <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
                <div>
                  <p class="font-bold text-slate-800 m-0">Dispatch Reference:</p>
                  <p class="font-mono text-[11px] text-slate-700 m-0 mt-0.5">{{ doc.dispatchRef }}</p>
                </div>

                <div class="text-right space-y-0.5">
                  <div class="font-bold text-slate-900 text-xs">{{ doc.signatoryName }}</div>
                  <div class="font-medium text-slate-700 text-xs">{{ doc.signatoryTitle }}</div>
                  <div class="text-slate-500 text-[10px]">{{ doc.signatoryOrg }}</div>
                </div>
              </div>

              <!-- COPY TO DISTRIBUTION LIST -->
              <div class="mt-6 pt-4 border-t border-slate-300 font-sans text-xs">
                <p class="font-bold text-slate-800 mb-1.5">Copy to:</p>
                <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
                  @for (item of doc.copyToList; track i; let i = $index) {
                    <li>{{ item }}</li>
                  }
                </ol>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 print:hidden">
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
    }
  `
})
export class SanctionOrdersComponent {
  private eoiStateService = inject(EoiStateService);
  private router = inject(Router);

  readonly pageSize = 10;
  readonly orders: SanctionOrder[] = environment.useMockData ? MOCK_SANCTION_ORDERS : [];
  successMessage = signal<string>('');
  selectedOrder = signal<SanctionOrder | null>(null);

  defaultEmblemSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 16 L54 28 L67 28 L56 36 L60 48 L50 40 L40 48 L44 36 L33 28 L46 28 Z" fill="%230b3558"/><path d="M25 65 Q50 55 75 65 Q50 72 25 65 Z" fill="%23b91c1c"/><text x="50" y="83" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230b3558">GOVT OF RAJASTHAN</text></svg>`;

  activeSanctionDoc = computed<SanctionOrderDocumentData>(() => {
    const o = this.selectedOrder();
    const schemeId = o?.scheme || 'MMKVY-01';
    return this.eoiStateService.getSanctionOrderData(schemeId);
  });

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: 'ipaNumber', label: 'IPA Number', align: 'center', width: 'w-36', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-700 text-center' },
    { key: 'schemeName', label: 'Scheme Name', align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900 text-center' },
    { key: 'category', label: 'Category', align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-700 text-center' },
    { key: 'actions', label: 'Action', align: 'center', type: 'custom', width: 'w-56' }
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
