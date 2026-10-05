import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../../shared';

export interface AcceptedCompanyRow {
  srNo: number;
  appId: string;
  agencyName: string;
  district: string;
  sector: string;
  category: string;
  grade: string;
  target: number;
}

@Component({
  selector: 'app-sanction-order',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent],
  template: `
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans pb-12">
      <div class="p-4 sm:p-5 max-w-7xl mx-auto space-y-4 font-sans">
        
        <!-- Top Action Header -->
        <app-page-header
          title="Sanction Order - Allocated Targets"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'Sanction Order', url: '/admin/sanction-orders' },
            { label: 'Accepted Companies Table' }
          ]"
          backUrl="/admin/sanction-orders"
          backTitle="Back to Sanction Order List"
        >
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-[#0c2d4e] border border-slate-300 text-xs font-medium shadow-xs">
            <span class="text-slate-600">Accepted Companies:</span>
            <span class="font-bold text-[#0c2d4e]">{{ acceptedRows().length }}</span>
          </div>
        </app-page-header>

        <!-- Scheme Context Banner -->
        @if (currentScheme()) {
          <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div>
              <span class="font-semibold text-slate-800 text-sm block sm:inline">{{ currentScheme()?.schemeTitle }}</span>
              <span class="text-slate-500 sm:ml-2 font-mono text-[11px]">Ref: {{ currentScheme()?.refNo }}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <span class="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                &check; Sanction Issued
              </span>
              <span class="text-slate-500 text-[11px]">Category: {{ currentScheme()?.category || 'General' }}</span>
            </div>
          </div>
        }

        <!-- Allocated Physical Targets Table (Using Reusable TableComponent) -->
        <app-table
          [columns]="companyColumns"
          [data]="acceptedRows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="companies"
          emptyMessage="No accepted companies / approved tenders found for this scheme."
          [customTemplates]="{
            category: categoryTemplate,
            grade: gradeTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #categoryTemplate let-row>
          <span class="inline-block px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium text-[11px]">
            {{ row.category }}
          </span>
        </ng-template>

        <ng-template #gradeTemplate let-row>
          <span class="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
            {{ row.grade }}
          </span>
        </ng-template>

        <ng-template #actionTemplate let-row>
          <button
            type="button"
            (click)="openIpaModal(row)"
            class="px-3 py-1.5 bg-[#174A6E] hover:bg-[#0E324D] text-white rounded text-xs font-medium transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="whitespace-nowrap">Generated IPA</span>
          </button>
        </ng-template>

      </div>
    </div>

    <!-- IN-PRINCIPLE APPROVAL (IPA) DOCUMENT PREVIEW MODAL -->
    @if (selectedIpaCompany()) {
      <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="px-5 py-3.5 bg-[#0B3558] text-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="font-bold text-sm tracking-tight">In-Principle Approval (IPA) Letter</h3>
            </div>
            <button
              type="button"
              (click)="closeIpaModal()"
              class="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Printable IPA Document Content -->
          <div id="ipa-letter-content" class="p-6 sm:p-8 overflow-y-auto space-y-5 text-slate-800 text-xs font-serif leading-relaxed bg-white">
            
            <!-- Letterhead -->
            <div class="text-center border-b-2 border-slate-800 pb-3 font-sans">
              <h2 class="text-base font-bold text-slate-900 uppercase">Rajasthan Skill and Livelihoods Development Corporation</h2>
              <p class="text-[11px] text-slate-600">(A Government of Rajasthan Enterprise)</p>
              <p class="text-[10px] text-slate-500 mt-0.5">EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur - 302004</p>
            </div>

            <!-- Letter Ref & Date -->
            <div class="flex items-center justify-between font-sans text-xs font-medium border-b border-slate-200 pb-2">
              <div>
                <span class="text-slate-500">Ref No:</span>
                <span class="font-mono font-bold text-slate-900 ml-1">RSLDC/IPA/2026-27/{{ selectedIpaCompany()?.appId }}</span>
              </div>
              <div>
                <span class="text-slate-500">Date:</span>
                <span class="font-bold text-slate-900 ml-1">{{ todayDate }}</span>
              </div>
            </div>

            <!-- Subject & Recipient -->
            <div class="space-y-1 font-sans">
              <p class="font-bold text-slate-900">To,</p>
              <p class="font-bold text-[#0B3558] text-sm">{{ selectedIpaCompany()?.agencyName }}</p>
              <p class="text-slate-600">Application ID: <span class="font-mono">{{ selectedIpaCompany()?.appId }}</span></p>
              <p class="text-slate-600">District: {{ selectedIpaCompany()?.district }}, Rajasthan</p>
            </div>

            <div class="bg-slate-50 p-3 rounded border border-slate-200 font-sans text-xs">
              <p class="font-bold text-slate-900 mb-0.5">Subject: In-Principle Approval (IPA) for Allocation of Physical Skill Targets FY 2026-27</p>
              <p class="text-slate-600 text-[11px]">Scheme: {{ currentScheme()?.schemeTitle || 'Skill Development Scheme' }} ({{ currentScheme()?.refNo }})</p>
            </div>

            <!-- Body Paragraph -->
            <div class="space-y-2 text-slate-800 font-serif text-justify text-[12.5px] leading-relaxed">
              <p>
                With reference to your proposal submitted against EOI Notice <strong>{{ currentScheme()?.refNo }}</strong>, the State Level Empanelment &amp; Scrutiny Committee is pleased to convey <strong>In-Principle Approval (IPA)</strong> to <strong>{{ selectedIpaCompany()?.agencyName }}</strong> for imparting skill training for Financial Year 2026-27.
              </p>
              
              <div class="my-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded font-sans text-xs">
                <table class="w-full text-left font-sans">
                  <tr>
                    <td class="py-1 font-semibold text-slate-700 w-36">Sanctioned Sector:</td>
                    <td class="py-1 font-bold text-slate-900">{{ selectedIpaCompany()?.sector }}</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-semibold text-slate-700">Sanctioned District:</td>
                    <td class="py-1 font-bold text-slate-900">{{ selectedIpaCompany()?.district }}</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-semibold text-slate-700">Empanelment Grade:</td>
                    <td class="py-1 font-bold text-emerald-800">Grade {{ selectedIpaCompany()?.grade }}</td>
                  </tr>
                  <tr>
                    <td class="py-1 font-semibold text-slate-700">Sanctioned Target:</td>
                    <td class="py-1 font-bold text-slate-900 text-sm">{{ selectedIpaCompany()?.target }} Candidates</td>
                  </tr>
                </table>
              </div>

              <p>
                This In-Principle Approval is subject to signing of the formal MoU within 10 working days, submission of the Performance Security Deposit (PSD), and complete adherence to RSLDC AEBAS biometric attendance and IP camera infrastructure guidelines.
              </p>
            </div>

            <!-- Signatory Footer -->
            <div class="pt-6 border-t border-slate-300 flex items-end justify-between font-sans">
              <div>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                  &check; Digitally Verified IPA
                </span>
              </div>
              <div class="text-right">
                <p class="font-bold text-slate-900">Managing Director</p>
                <p class="text-slate-600 text-[11px]">RSLDC, Jaipur (GoR)</p>
              </div>
            </div>

          </div>

          <!-- Modal Action Footer -->
          <div class="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between font-sans">
            <span class="text-xs text-slate-500 font-medium">IPA Status: Active &amp; Issued</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="printIpaLetter()"
                class="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print IPA Letter</span>
              </button>
              <button
                type="button"
                (click)="closeIpaModal()"
                class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class SanctionOrderComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  acceptedRows = signal<AcceptedCompanyRow[]>([]);
  currentScheme = signal<Scheme | undefined>(undefined);
  selectedIpaCompany = signal<AcceptedCompanyRow | null>(null);

  todayDate = new Date().toLocaleDateString('en-GB');

  readonly availableDistricts: string[] = [
    'Jodhpur', 'Alwar', 'Jaipur', 'Kota', 'Udaipur', 'Sikar', 'Ajmer', 'Bhilwara'
  ];

  readonly availableSectors: string[] = [
    'Textile & Handloom', 'Apparel, Agriculture', 'Healthcare & Paramedical', 'IT-ITeS & Multi-Skills'
  ];

  readonly companyColumns: TableColumn<AcceptedCompanyRow>[] = [
    { key: '$index', label: 'Sr. No', type: 'number', align: 'center', width: 'w-16' },
    { key: 'appId', label: 'Application ID', align: 'center', width: 'w-36', cellClass: 'whitespace-nowrap font-mono font-medium text-slate-900 text-center' },
    { key: 'agencyName', label: 'Name Of the Agency/PIA', width: 'min-w-[220px]', cellClass: 'whitespace-nowrap font-bold text-slate-900' },
    { key: 'district', label: 'Sanction District', align: 'center', width: 'w-36', cellClass: 'whitespace-nowrap text-slate-700 font-medium text-center' },
    { key: 'sector', label: 'Sanction Sector(s)', width: 'min-w-[180px]', cellClass: 'whitespace-nowrap text-slate-700' },
    { key: 'category', label: 'Application Category', align: 'center', type: 'custom', width: 'w-36' },
    { key: 'grade', label: 'Grade', align: 'center', type: 'custom', width: 'w-20' },
    { key: 'target', label: 'Sanction Target', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap font-bold text-slate-900 text-center text-sm' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom', width: 'w-36', cellClass: 'whitespace-nowrap text-center' }
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.loadSchemeAndAcceptedCompanies(sId);
    });
  }

  private loadSchemeAndAcceptedCompanies(schemeId: string): void {
    // Fetch scheme metadata
    this.eoiStateService.getSchemeById(schemeId).subscribe(scheme => {
      this.currentScheme.set(scheme);
    });

    // Fetch accepted responses for this scheme ONLY
    this.eoiStateService.getResponses(schemeId).subscribe(responses => {
      const approved = responses.filter(r => r.status === 'APPROVED');
      
      const rows: AcceptedCompanyRow[] = approved.map((resp, idx) => ({
        srNo: idx + 1,
        appId: resp.id,
        agencyName: resp.actualLegalName || resp.anonymousLabel,
        district: resp.trainingCentres?.[0]?.district || this.availableDistricts[idx % this.availableDistricts.length],
        sector: resp.placementTrackRecord?.[0]?.sector || this.availableSectors[idx % this.availableSectors.length],
        category: 'A-1 (Skill)',
        grade: resp.scrutinyDetails?.grade === 'Grade A' ? 'A' : (resp.scrutinyDetails?.grade === 'Grade B' ? 'B' : 'A'),
        target: 150
      }));

      if (rows.length === 0) {
        this.acceptedRows.set([
          {
            srNo: 1,
            appId: 'APP-2024-001',
            agencyName: 'Company 1',
            district: 'Jaipur',
            sector: 'Electronics & IT',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 300
          },
          {
            srNo: 2,
            appId: 'APP-2024-002',
            agencyName: 'Company 2',
            district: 'Jodhpur',
            sector: 'Apparel & Automotive',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 240
          },
          {
            srNo: 3,
            appId: 'APP-2024-003',
            agencyName: 'Company 3',
            district: 'Udaipur',
            sector: 'Tourism & Hospitality',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 300
          },
          {
            srNo: 4,
            appId: 'APP-2024-004',
            agencyName: 'Company 4',
            district: 'Bikaner',
            sector: 'Beauty & Wellness',
            category: 'A-1 (Skill)',
            grade: 'A',
            target: 480
          }
        ]);
      } else {
        this.acceptedRows.set(rows);
      }
    });
  }

  openIpaModal(row: AcceptedCompanyRow): void {
    const sId = this.currentScheme()?.id || 'MMKVY-01';
    this.router.navigate(['/admin/ipa-editor', sId, row.appId]);
  }

  closeIpaModal(): void {
    this.selectedIpaCompany.set(null);
  }

  printIpaLetter(): void {
    window.print();
  }
}
