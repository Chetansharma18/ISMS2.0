import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import {
  ButtonComponent,
  IconComponent,
  ModalComponent,
  PageHeaderComponent,
  PageShellComponent,
  TableComponent,
  TableColumn,
  formatDate
} from '../../../../shared';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, PageHeaderComponent, TableComponent, PageShellComponent, ButtonComponent, IconComponent, ModalComponent],
  template: `
    <app-page-shell>
        <!-- Top Action Header -->
        <app-page-header
          title="Allocate Target"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'Sanction Order', url: '/admin/sanction-orders' },
            { label: 'Allocate Target' }
          ]"
          [searchable]="true"
          searchPlaceholder="Search agency, district, sector, appId..."
          [(searchQuery)]="searchQuery"
        >
        </app-page-header>

        <!-- Back Button & Scheme Context Banner -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Back button matching remaining pages -->
          <button appButton variant="outline" class="shrink-0" (click)="goBack()" title="Back to Sanction Orders">
            <app-icon name="chevron-left" size="sm" />
            <span>Back</span>
          </button>

          @if (currentScheme()) {
            <div class="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div>
                <span class="font-semibold text-slate-800 text-sm block sm:inline">{{ currentScheme()?.schemeTitle }}</span>
                <span class="text-slate-500 sm:ml-2 font-mono text-[11px]">Ref: {{ currentScheme()?.refNo }}</span>
              </div>
            </div>
          }
        </div>

        <!-- Allocated Physical Targets Table (Using Reusable TableComponent) -->
        <app-table
          [columns]="companyColumns"
          [data]="filteredAcceptedRows()"
          [pagination]="true"
          [pageSize]="10"
          itemUnit="companies"
          emptyMessage="No approved companies found for this scheme."
          [customTemplates]="{
            grade: gradeTemplate,
            action: actionTemplate
          }"
        >
        </app-table>

        <ng-template #gradeTemplate let-row>
          <span class="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
            {{ row.grade }}
          </span>
        </ng-template>

        <ng-template #actionTemplate let-row>
          <button appButton size="sm" class="shrink-0" (click)="openIpaModal(row)">
            <app-icon name="document-download" size="sm" [stroke]="2" />
            <span>Generate IPA</span>
          </button>
        </ng-template>

    </app-page-shell>

    <!-- IN-PRINCIPLE APPROVAL (IPA) DOCUMENT PREVIEW MODAL -->
    @if (selectedIpaCompany()) {
      <app-modal title="In-Principle Approval (IPA) Letter" widthOverride="max-w-3xl" (close)="closeIpaModal()">
          <!-- Printable IPA Document Content -->
          <div id="ipa-letter-content" class="space-y-5 text-slate-800 text-xs font-serif leading-relaxed bg-white">
            
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
              <p class="font-bold text-navy text-sm">{{ selectedIpaCompany()?.agencyName }}</p>
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
                <dl class="grid grid-cols-[9rem_1fr] gap-y-2 m-0 text-left font-sans">
                  <dt class="font-semibold text-slate-700">Sanctioned Sector:</dt>
                  <dd class="m-0 font-bold text-slate-900">{{ selectedIpaCompany()?.sector }}</dd>

                  <dt class="font-semibold text-slate-700">Sanctioned District:</dt>
                  <dd class="m-0 font-bold text-slate-900">{{ selectedIpaCompany()?.district }}</dd>

                  <dt class="font-semibold text-slate-700">Empanelment Grade:</dt>
                  <dd class="m-0 font-bold text-emerald-800">Grade {{ selectedIpaCompany()?.grade }}</dd>

                  <dt class="font-semibold text-slate-700">Sanctioned Target:</dt>
                  <dd class="m-0 font-bold text-slate-900 text-sm">{{ selectedIpaCompany()?.target }} Candidates</dd>
                </dl>
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

          <ng-container modalFooter>
            <span class="mr-auto text-xs text-slate-500 font-medium">IPA Status: Active &amp; Issued</span>
            <button appButton (click)="printIpaLetter()">
              <app-icon name="print-ipa" [stroke]="2" />
              <span>Print IPA Letter</span>
            </button>
            <button appButton variant="outline" (click)="closeIpaModal()">Close</button>
          </ng-container>
      </app-modal>
    }
  `
})
export class SanctionOrderComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  acceptedRows = signal<AcceptedCompanyRow[]>([]);
  currentScheme = signal<Scheme | undefined>(undefined);
  selectedIpaCompany = signal<AcceptedCompanyRow | null>(null);
  searchQuery = signal<string>('');

  filteredAcceptedRows = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.acceptedRows();
    return this.acceptedRows().filter(r =>
      (r.agencyName && r.agencyName.toLowerCase().includes(q)) ||
      (r.appId && r.appId.toLowerCase().includes(q)) ||
      (r.district && r.district.toLowerCase().includes(q)) ||
      (r.sector && r.sector.toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q))
    );
  });

  todayDate = formatDate(new Date());

  readonly availableDistricts: string[] = [
    'Jodhpur', 'Alwar', 'Jaipur', 'Kota', 'Udaipur', 'Sikar', 'Ajmer', 'Bhilwara'
  ];

  readonly availableSectors: string[] = [
    'Textile & Handloom', 'Apparel, Agriculture', 'Healthcare & Paramedical', 'IT-ITeS & Multi-Skills'
  ];

  readonly companyColumns: TableColumn<AcceptedCompanyRow>[] = [
    { key: '$index', label: 'Sr. No', type: 'number', align: 'center', width: 'w-16' },
    { key: 'appId', label: 'Application ID', align: 'center', width: 'w-36', cellClass: 'whitespace-nowrap font-mono font-normal text-slate-800 text-center' },
    { key: 'agencyName', label: 'Name Of the Agency/PIA', width: 'min-w-[220px]', cellClass: 'whitespace-nowrap font-normal text-slate-800' },
    { key: 'district', label: 'Sanction District', align: 'center', width: 'w-36', cellClass: 'whitespace-nowrap text-slate-700 font-normal text-center' },
    { key: 'sector', label: 'Sanction Sector(s)', width: 'min-w-[180px]', cellClass: 'whitespace-nowrap text-slate-700 font-normal' },
    { key: 'grade', label: 'Grade', align: 'center', type: 'custom', width: 'w-20' },
    { key: 'target', label: 'Sanction Target', align: 'center', width: 'w-32', cellClass: 'whitespace-nowrap font-normal text-slate-800 text-center text-[13px]' },
    { key: 'action', label: 'Action', align: 'center', type: 'custom', width: 'w-36', cellClass: 'whitespace-nowrap text-center' }
  ];

  goBack(): void {
    this.router.navigate(['/admin/sanction-orders']);
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.loadSchemeAndAcceptedCompanies(sId);
    });
  }

  private loadSchemeAndAcceptedCompanies(schemeId: string): void {
    // Fetch scheme metadata
    this.eoiStateService.getSchemeById(schemeId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(scheme => {
      this.currentScheme.set(scheme);
    });

    // Fetch accepted responses for this scheme ONLY
    this.eoiStateService.getResponses(schemeId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(responses => {
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
