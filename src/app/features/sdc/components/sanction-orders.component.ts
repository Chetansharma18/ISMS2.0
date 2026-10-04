import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    PageHeaderComponent,
    TableComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      <div class="p-4 sm:p-5 space-y-3 font-sans">
        
        <!-- Page Header via Reusable PageHeaderComponent -->
        <app-page-header
          title="IPA Numbers & Sanction Orders"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'IPA Numbers' }]"
        >
          <!-- Search input -->
          <div class="relative w-full sm:w-72">
            <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search IPA, Scheme, District..."
              class="w-full pl-9 pr-7 py-1.5 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#174A6E] focus:border-[#174A6E] transition-colors font-normal shadow-2xs"
            />
            @if (searchQuery) {
              <button
                type="button"
                (click)="searchQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                ✕
              </button>
            }
          </div>
        </app-page-header>

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
          [data]="filteredOrders"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="IPA records"
          emptyMessage="No IPA records match your query."
          [customTemplates]="{
            ipaNumber: ipaNumberTemplate,
            schemeName: schemeNameTemplate,
            sectors: sectorsTemplate,
            sdcStats: sdcStatsTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: IPA Number (Clickable badge to view IPA form) -->
        <ng-template #ipaNumberTemplate let-so>
          <button
            type="button"
            (click)="viewIpaForm(so)"
            class="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#174A6E] hover:text-[#0B3558] hover:underline cursor-pointer bg-sky-50 px-2 py-0.5 rounded border border-sky-200 transition-colors"
            title="Click to view In-Principle Approval (IPA) document"
          >
            <svg class="w-3.5 h-3.5 text-[#174A6E] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ so.ipaNumber }}</span>
          </button>
        </ng-template>

        <!-- Template: Scheme Name -->
        <ng-template #schemeNameTemplate let-so>
          <div class="flex flex-col items-start gap-0.5">
            <span
              (click)="viewIpaForm(so)"
              class="font-bold text-slate-900 hover:text-[#174A6E] hover:underline cursor-pointer transition-colors"
            >
              {{ so.schemeName || so.scheme }}
            </span>
            <span class="text-[11px] text-slate-500 font-normal">
              Category: {{ so.category }}
            </span>
          </div>
        </ng-template>

        <!-- Template: Sectors -->
        <ng-template #sectorsTemplate let-so>
          <div class="flex flex-wrap gap-1 max-w-xs">
            @for (sector of (so.sectors || ['Skill Training']); track sector) {
              <span class="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                {{ sector }}
              </span>
            }
          </div>
        </ng-template>

        <!-- Template: SDC Stats -->
        <ng-template #sdcStatsTemplate let-so>
          <div class="inline-flex items-center gap-1 font-medium text-xs">
            <span class="text-emerald-700 font-bold">{{ so.approvedSdcCount }} Approved</span>
            <span class="text-slate-400">/</span>
            <span class="text-slate-600">{{ so.totalSdc }} Total</span>
          </div>
        </ng-template>

        <!-- Template: Actions (View IPA Form & Add SDC) -->
        <ng-template #actionsTemplate let-so>
          <div class="flex items-center justify-center gap-2 whitespace-nowrap">
            <!-- View IPA Form Button -->
            <button
              type="button"
              (click)="viewIpaForm(so)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="View & Download IPA Document"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View IPA</span>
            </button>

            <!-- Register SDC Button -->
            <button
              type="button"
              (click)="navigateToAddSdc(so.schemeName || so.scheme, so.category)"
              class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Register SDC for {{ so.schemeName || so.scheme }}"
            >
              <span class="text-sm font-bold leading-none">+</span>
              <span>Add SDC</span>
            </button>
          </div>
        </ng-template>

      </div>

      <!-- ====================================================================
           OFFICIAL IN-PRINCIPLE APPROVAL (IPA) FORM DOCUMENT MODAL
           ==================================================================== -->
      @if (selectedIpaOrder(); as ipa) {
        <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
          <div class="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
            
            <!-- Modal Top Toolbar Header (Hidden during Print) -->
            <div class="px-5 py-3 bg-[#0B3558] text-white flex items-center justify-between shrink-0 print:hidden font-sans">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 class="font-bold text-sm leading-tight">In-Principle Approval (IPA) Form</h3>
                  <p class="text-[11px] text-slate-300">Official Sanction Letter &amp; Target Allocation Document</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="printIpaDocument()"
                  class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print / Download PDF</span>
                </button>
                <button
                  type="button"
                  (click)="closeIpaModal()"
                  class="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- OFFICIAL IPA DOCUMENT CONTENT -->
            <div id="ipa-document-sheet" class="p-6 sm:p-10 overflow-y-auto space-y-4 text-slate-900 text-xs leading-normal bg-white print:p-0 print:overflow-visible">
              
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

              <!-- Reference Row -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans pt-2 border-b border-slate-200 pb-2">
                <div>
                  <span class="font-semibold text-slate-700">File No: </span>
                  <span class="font-mono font-bold text-slate-900">RSLDC/EOI/2026-27/IPA/{{ ipa.ipaNumber }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="border border-slate-300 bg-slate-50 px-2.5 py-0.5 rounded text-xs font-mono font-bold text-slate-800">
                    IPA Ref: {{ ipa.ipaNumber }}
                  </span>
                  <div>
                    <span class="font-semibold text-slate-700">Date: </span>
                    <span class="font-mono font-bold text-slate-900">{{ ipa.mouStartDate }}</span>
                  </div>
                </div>
              </div>

              <!-- Recipient Address -->
              <div class="space-y-0.5 font-sans text-xs pt-2">
                <p class="font-bold text-slate-900">To,</p>
                <div class="pl-4 space-y-0.5 text-slate-800">
                  <p class="font-bold text-[#0B3558]">{{ ipa.agencyName || 'Apex Skill Development Foundation' }}</p>
                  <p>Training Partner Code: <strong class="font-mono">{{ ipa.tpCode || 'MoU-001658' }}</strong></p>
                  <p>Address: Plot No. 42, Malviya Nagar Industrial Area, Jaipur, Rajasthan - 302017</p>
                </div>
              </div>

              <!-- Subject -->
              <div class="bg-amber-50/80 border-l-4 border-amber-500 p-2.5 rounded-r font-sans text-xs">
                <p class="font-bold text-slate-900">
                  Subject: In-Principle Approval (IPA) for execution of skill training under {{ ipa.schemeName }} (Category: {{ ipa.category }}) Scheme.
                </p>
              </div>

              <!-- Preamble text -->
              <div class="text-justify leading-relaxed text-slate-800 space-y-2">
                <p>
                  With reference to your Expression of Interest (EOI) submitted under Application ID <strong>{{ ipa.appId || 'APP-004661' }}</strong> for the <strong>{{ ipa.schemeName }}</strong> scheme, the competent authority of RSLDC is pleased to accord <strong>In-Principle Approval (IPA)</strong> for the allocation of training targets as detailed below:
                </p>
              </div>

              <!-- Allocated Target Table -->
              <div class="border border-slate-300 rounded overflow-hidden">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <tr>
                      <th class="p-2 border-r border-slate-300 text-center">Sr. No</th>
                      <th class="p-2 border-r border-slate-300">Application ID</th>
                      <th class="p-2 border-r border-slate-300">Name of PIA</th>
                      <th class="p-2 border-r border-slate-300">Sanction District</th>
                      <th class="p-2 border-r border-slate-300">Sanction Sector(s)</th>
                      <th class="p-2 border-r border-slate-300 text-center">Category</th>
                      <th class="p-2 border-r border-slate-300 text-center">Grade</th>
                      <th class="p-2 text-center">Sanction Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-slate-200">
                      <td class="p-2 border-r border-slate-200 text-center font-bold">1</td>
                      <td class="p-2 border-r border-slate-200 font-mono font-bold text-[#174A6E]">{{ ipa.appId || 'APP-004661' }}</td>
                      <td class="p-2 border-r border-slate-200 font-medium">{{ ipa.agencyName || 'Apex Skill Development Foundation' }}</td>
                      <td class="p-2 border-r border-slate-200">{{ ipa.district || 'Alwar' }}</td>
                      <td class="p-2 border-r border-slate-200">{{ (ipa.sectors || ['Healthcare & Paramedical']).join(', ') }}</td>
                      <td class="p-2 border-r border-slate-200 text-center">
                        <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[10.5px]">
                          {{ ipa.category }}
                        </span>
                      </td>
                      <td class="p-2 border-r border-slate-200 text-center">
                        <span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10.5px]">
                          {{ ipa.grade || 'A' }}
                        </span>
                      </td>
                      <td class="p-2 text-center font-bold text-base text-[#174A6E]">
                        {{ ipa.sanctionTarget || 150 }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- General Terms & Directives -->
              <div class="space-y-1.5 pt-2">
                <p class="font-bold text-slate-900 uppercase text-[11px] tracking-wide">Terms &amp; Directives of In-Principle Approval:</p>
                <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11.5px] leading-relaxed">
                  <li>The PIA shall set up the Skill Development Centre (SDC) in accordance with the specified infrastructure norms within 45 days of IPA issuance.</li>
                  <li>Physical and Geo-tagged center inspection will be conducted by RSLDC inspection officers before batch commencement.</li>
                  <li>Candidate enrollment must comply with the target demographic criteria with mandatory AEBAS biometric registration.</li>
                  <li>Assessment and certification shall be carried out strictly through approved Sector Skill Councils / Awarding Bodies.</li>
                  <li>Payment disbursements will be governed by milestone achievements as per the official scheme guidelines and MoU.</li>
                </ol>
              </div>

              <!-- Signatures & Official Stamp -->
              <div class="flex justify-between items-end pt-8 border-t border-slate-200 mt-6 font-sans">
                <div class="text-center space-y-1">
                  <div class="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase mx-auto">
                    RSLDC SEAL
                  </div>
                  <p class="text-[10px] text-slate-500">Official Corporation Stamp</p>
                </div>

                <div class="text-right space-y-1">
                  <div class="font-bold text-slate-900 text-xs">For Rajasthan Skill &amp; Livelihoods Development Corporation</div>
                  <div class="pt-6 font-serif italic text-slate-700">Authorized Officer</div>
                  <div class="text-[11px] font-bold text-[#0B3558]">General Manager (Operations &amp; Projects)</div>
                  <div class="text-[10.5px] text-slate-500">RSLDC, Government of Rajasthan</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class SanctionOrdersComponent {
  private router = inject(Router);

  readonly pageSize = 10;
  searchQuery = '';
  readonly orders: SanctionOrder[] = MOCK_SANCTION_ORDERS;
  successMessage = signal<string>('');
  selectedIpaOrder = signal<SanctionOrder | null>(null);

  readonly orderColumns: TableColumn<SanctionOrder>[] = [
    { key: '$index',           label: 'S. No.',               align: 'center', width: 'w-14' },
    { key: 'ipaNumber',        label: 'IPA Number',           align: 'center', width: 'w-44',  type: 'custom' },
    { key: 'appId',            label: 'Application ID',       align: 'center', width: 'w-32',  cellClass: 'whitespace-nowrap font-mono font-bold text-slate-700 text-center' },
    { key: 'schemeName',       label: 'Scheme Name',          type: 'custom', cellClass: 'whitespace-nowrap font-bold text-slate-900' },
    { key: 'district',         label: 'Sanction District',    align: 'center', cellClass: 'whitespace-nowrap font-medium text-slate-800 text-center' },
    { key: 'sectors',          label: 'Sanction Sector(s)',   type: 'custom' },
    { key: 'sanctionTarget',   label: 'Sanction Target',      align: 'center', width: 'w-32',  cellClass: 'whitespace-nowrap font-bold text-[#174A6E] text-center' },
    { key: 'mouExpiryDate',    label: 'MoU Expiry',           align: 'center', cellClass: 'whitespace-nowrap text-slate-600 text-center' },
    { key: 'sdcStats',         label: 'SDC Status',           align: 'center', type: 'custom' },
    { key: 'actions',          label: 'Actions',              align: 'center', type: 'custom', width: 'w-56' }
  ];

  get filteredOrders(): SanctionOrder[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.orders;
    return this.orders.filter(o =>
      o.ipaNumber.toLowerCase().includes(q) ||
      (o.appId && o.appId.toLowerCase().includes(q)) ||
      o.schemeName.toLowerCase().includes(q) ||
      (o.district && o.district.toLowerCase().includes(q)) ||
      o.category.toLowerCase().includes(q) ||
      (o.sectors && o.sectors.some(s => s.toLowerCase().includes(q)))
    );
  }

  viewIpaForm(order: SanctionOrder): void {
    this.selectedIpaOrder.set(order);
  }

  closeIpaModal(): void {
    this.selectedIpaOrder.set(null);
  }

  printIpaDocument(): void {
    window.print();
  }

  navigateToAddSdc(scheme: string, category?: string): void {
    this.router.navigate(['/sdc/create'], { queryParams: { scheme, schemeCategory: category } });
  }
}
