import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import {
  PageHeaderComponent,
  TableComponent,
  ButtonComponent,
  ActionModalComponent,
  TableColumn
} from '../../shared';
import { SchemeDetailViewComponent } from './scheme-detail-view.component';

export interface SchemeTender {
  sNo: number;
  refNo: string;
  schemeName: string;
  schemeTitle?: string;
  schemeCategory: string;
  datePublished: string;
  closingDate: string;
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
}

export interface EoiDocumentItem {
  sNo: number;
  name: string;
  size: string;
}

@Component({
  selector: 'app-tenders-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    ActionModalComponent,
    SchemeDetailViewComponent
  ],
  template: `
    <div class="w-full min-h-full text-slate-800 font-sans" style="background-color: #ffffff; font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE EOI TABLE (Using Reusable PageHeader & DataTable)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-4 sm:p-5 space-y-4 font-sans" style="background-color: #ffffff;">
          
          <!-- Themed Header Bar via Reusable PageHeaderComponent with Rajasthan Banner -->
          <app-page-header
            title="Active Schemes"
            [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Active Schemes' }]"
          >
            <!-- Integrated Search Bar (Matching User Screenshot) -->
            <div class="w-full sm:w-auto min-w-[280px] sm:min-w-[360px] md:min-w-[420px]">
              <div class="relative flex items-center bg-white rounded-lg border border-slate-300 shadow-2xs overflow-hidden focus-within:border-[#174A6E] focus-within:ring-2 focus-within:ring-[#174A6E]/20 transition-all">
                <input
                  type="text"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                  placeholder="Search schemes by name, reference no. or keyword..."
                  class="w-full px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  class="px-3.5 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  title="Search"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </app-page-header>

          <!-- Incomplete Profile Notice Banner (if applicable) -->
          @if (isProfileIncomplete()) {
            <div class="bg-amber-50/90 border border-amber-300/80 rounded-md p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 class="text-xs sm:text-[13px] font-medium text-amber-900">
                  Please complete your profile first
                </h4>
                <p class="text-[11px] sm:text-xs text-amber-800 mt-0.5 font-normal">
                  Your profile is currently incomplete. Please complete your profile to submit EOI.
                </p>
              </div>

              <div class="flex items-center gap-2">
                <a
                  routerLink="/profile"
                  class="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-lg shadow-md whitespace-nowrap transition-all flex items-center gap-2 justify-center shrink-0 cursor-pointer active:scale-95"
                  style="color: #ffffff !important;"
                >
                  <span class="text-white font-bold" style="color: #ffffff !important;">Complete Registration</span>
                  <svg class="w-4 h-4 text-white" style="stroke: #ffffff !important; color: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          }

          <!-- Schemes Table via Reusable TableComponent -->
          <app-table
            [columns]="schemeColumns"
            [data]="filteredSchemes()"
            [pagination]="true"
            [pageSize]="pageSize"
            [rowClass]="getRowClass"
            (rowClick)="onRowClick($event)"
            itemUnit="schemes"
            [customTemplates]="{
              closingDate: closingDateTemplate,
              eoiDescription: descTemplate,
              viewAction: viewActionTemplate
            }"
          >
          </app-table>

          <!-- Custom Template for Closing Date (with prominent highlight for Closed / Expired schemes) -->
          <ng-template #closingDateTemplate let-item>
            @if (isSchemeClosed(item)) {
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-semibold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs select-none"
                title="Application deadline has expired"
              >
                <span class="font-semibold text-rose-700">{{ item.closingDate }}</span>
                <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-2xs leading-none">
                  Closed
                </span>
              </div>
            } @else {
              <span class="text-slate-800 font-medium text-[12.5px]">{{ item.closingDate }}</span>
            }
          </ng-template>

          <ng-template #descTemplate let-item>
            <span
              class="line-clamp-2 text-[11px] leading-relaxed"
              [ngClass]="isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-600'"
            >
              {{ item.eoiDescription }}
            </span>
          </ng-template>

          <ng-template #viewActionTemplate let-item>
            @if (isSchemeClosed(item)) {
              <button
                type="button"
                (click)="$event.stopPropagation(); viewSchemeDetails(item)"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold text-[#0483AC] hover:text-white hover:bg-[#0483AC] border border-[#0483AC]/40 hover:border-[#0483AC] bg-white cursor-pointer transition-all select-none"
                title="View scheme details (closed)"
              >
                <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>View</span>
              </button>
            } @else {
              <app-button
                variant="pdf-view"
                size="sm"
                (btnClick)="$event.stopPropagation(); viewSchemeDetails(item)"
                title="View EOI Details"
              >
                View
              </app-button>
            }
          </ng-template>

        </div>
      }

      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Tabular Layout matching Government eProcurement)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <app-scheme-detail-view
          [scheme]="s"
          [rfpDocs]="rfpDocuments"
          [annexures]="annexureDocuments"
          [requiredInfo]="eoiRequiredInfo"
          (back)="backToList()"
          (apply)="handleApplyForScheme()"
          (download)="downloadDoc($event)"
        ></app-scheme-detail-view>
      }

      <!-- ====================================================================
           MODAL: REUSABLE ONE-TIME REGISTRATION (OTR) POPUP PROMPT
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showOtrPromptModal()"
        [showCloseButton]="false"
        title="Complete Your Profile to Apply for EOI"
        description="To participate in RSLDC schemes and submit an Expression of Interest (EOI), please complete your One-Time Registration (OTR) and organization profile."
        primaryLabel="Complete Registration"
        secondaryLabel="Skip for Now"
        (primaryAction)="goToProfile()"
        (secondaryAction)="dismissOtrPrompt()"
        (close)="dismissOtrPrompt()"
      >
      </app-action-modal>

    </div>
  `
})
export class TendersPageComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly currentUser = this.authService.currentUser;

  readonly isProfileIncomplete = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === 'new_user';
  });

  selectedScheme = signal<SchemeTender | null>(null);
  readonly showOtrPromptModal = signal<boolean>(false);
  private promptDismissed = false;

  pageSize = 10;
  searchQuery = signal<string>('');

  readonly filteredSchemes = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.schemes;
    return this.schemes.filter(s =>
      s.schemeName.toLowerCase().includes(q) ||
      s.refNo.toLowerCase().includes(q) ||
      s.eoiDescription.toLowerCase().includes(q) ||
      (s.schemeTitle && s.schemeTitle.toLowerCase().includes(q))
    );
  });

  onSearchChange(val: string): void {
    this.searchQuery.set(val);
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      const fromLogin = params['fromLogin'] === 'true';
      const promptOtr = params['promptOtr'] === 'true';
      if (fromLogin || promptOtr) {
        this.promptDismissed = false;
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('isms_otr_prompt_dismissed');
        }
      }
      this.evaluateOtrModalPrompt();
    });

    effect(() => {
      // Re-evaluate whenever currentUser signal changes
      this.evaluateOtrModalPrompt();
    });
  }

  private evaluateOtrModalPrompt(): void {
    const user = this.currentUser();
    const isNewUser = user?.role === 'new_user';
    const isDismissed = (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('isms_otr_prompt_dismissed') === 'true') || this.promptDismissed;

    // Show popup strictly for new_user role on their first visit / fresh login
    if (isNewUser && !isDismissed) {
      this.showOtrPromptModal.set(true);
    } else {
      this.showOtrPromptModal.set(false);
    }
  }

  dismissOtrPrompt(): void {
    this.showOtrPromptModal.set(false);
    this.promptDismissed = true;
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('isms_otr_prompt_dismissed', 'true');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('isms_eoi_prompt_shown_new_user', 'true');
    }
  }

  // Section A: Core RFP & Policy Guidelines Documents
  readonly rfpDocuments: EoiDocumentItem[] = [
    { sNo: 1, name: 'Request for Proposal (RFP)', size: '2.4 MB' },
    { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: '1.8 MB' }
  ];

  // Section B: Official Prescribed Annexure Formats & Templates (Download to fill & execute)
  readonly annexureDocuments: EoiDocumentItem[] = [
    { sNo: 1, name: 'Annexure-1: Covering Letter  ', size: '245 KB' },
    { sNo: 2, name: 'Annexure-3: Audited Financial Statements Format for Last Three Consecutive Financial Years', size: '1.2 MB' },
    { sNo: 3, name: 'Annexure-4: Details of Active Skill Development Centre Format', size: '380 KB' },
    { sNo: 4, name: 'Annexure-5: Training and Placement Details Format', size: '520 KB' },
    { sNo: 5, name: 'Annexure-6: Affidavit Format for Not Being Blacklisted by Govt. / PSU', size: '180 KB' },
    { sNo: 6, name: 'Annexure-7: Self-Certificate / Declaration Format as per Annexure-7', size: '195 KB' },
    { sNo: 7, name: 'Annexure-8: Details of Board of Directors Format', size: '290 KB' },
    { sNo: 8, name: 'Annexure-9: Details of Placement Partnership / Industry Tie-ups Format', size: '440 KB' },
    { sNo: 9, name: 'Annexure-10: Details of Working Experience in Relevant Sector Format', size: '610 KB' },
    { sNo: 10, name: 'Annexure-11: List of Divisions and Group of District', size: '310 KB' },
    { sNo: 11, name: 'Annexure-12: Proposed Evaluation Matrix Template', size: '420 KB' },
    { sNo: 12, name: 'Annexure-13: Supporting Documents Checklist', size: '850 KB' }
  ];

  // Informational requirements — what the applicant must have ready before filling the online EOI form
  readonly eoiRequiredInfo: Array<{ sNo: number; name: string; note?: string }> = [
    { sNo: 1, name: 'Company PAN Card', note: 'Self-attested copy' },
    { sNo: 2, name: 'GST Registration Certificate', note: 'If registered' },
    { sNo: 3, name: 'Certificate of Incorporation / Registration', note: 'Issued by respective authority' },
    { sNo: 4, name: 'MSME / Udyam Registration Certificate', note: 'If applicable' },
    { sNo: 5, name: 'Audited Financial Statements (Last 3 years)', note: 'Signed by CA with UDIN' },
    { sNo: 6, name: 'CA-Certified Turnover Certificate', note: 'For total & skill-sector turnover' },
    { sNo: 7, name: 'Affidavit for not being blacklisted by any Govt. / PSU', note: 'Notarized' },
    { sNo: 8, name: 'Authorized Person / Signatory Details', note: 'PAN, Aadhaar, Board resolution / authorization letter' },
    { sNo: 9, name: 'Details of Officer In-Charge (OIC)', note: 'PAN, Aadhaar, appointment letter' },
    { sNo: 10, name: 'Bank Account Details with Cancelled Cheque', note: 'IFSC code required' },
    { sNo: 11, name: 'Training Centre Infrastructure Details', note: 'As per Annexure-4 format' },
    { sNo: 12, name: 'Placement & Training Track Record', note: 'Sector-wise data as per Annexure-5' },
    { sNo: 13, name: 'NSDC Partnership Certificate', note: 'If applicable' },
    { sNo: 14, name: 'EOI Document with Sign & Seal on each page', note: 'By Company Secretary or Authorized Representative' }
  ];



  readonly schemeColumns: TableColumn<SchemeTender>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-20 min-w-[75px]' },
    {
      key: 'refNo',
      label: 'EOI Reference No.',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-800'}`
    },
    {
      key: 'schemeName',
      label: 'Scheme Name',
      cellClass: (_val, item) => `whitespace-nowrap font-medium ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-800'}`
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'datePublished',
      label: 'Date of EOI Published',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'closingDate',
      label: 'Date of Closing',
      align: 'center',
      type: 'custom',
      cellClass: 'whitespace-nowrap'
    },
    {
      key: 'eoiCategory',
      label: 'EOI Category',
      align: 'center',
      cellClass: (_val, item) => `whitespace-nowrap font-normal ${this.isSchemeClosed(item) ? 'text-slate-400' : 'text-slate-700'}`
    },
    {
      key: 'eoiDescription',
      label: 'EOI Description',
      width: 'min-w-[200px] max-w-sm',
      type: 'custom'
    },
    {
      key: 'viewAction',
      label: 'Action',
      align: 'center',
      width: 'w-24',
      type: 'custom'
    }
  ];

  isSchemeClosed(scheme: SchemeTender | null | undefined): boolean {
    if (!scheme) return false;
    if (scheme.status === 'Closed') return true;
    if (!scheme.closingDate) return false;

    const parts = scheme.closingDate.includes('/')
      ? scheme.closingDate.split('/')
      : scheme.closingDate.split('-');

    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const closeDate = new Date(year, month, day, 23, 59, 59);
      if (!isNaN(closeDate.getTime())) {
        return closeDate.getTime() < Date.now();
      }
    }
    return false;
  }

  getRowClass = (item: SchemeTender): string => {
    if (this.isSchemeClosed(item)) {
      return 'opacity-65 bg-white cursor-pointer hover:bg-slate-50 transition-colors';
    }
    return 'bg-white cursor-pointer hover:bg-slate-100/90 transition-colors';
  };

  onRowClick(scheme: SchemeTender): void {
    this.viewSchemeDetails(scheme);
  }

  // 10 Schemes for demo: 8 active with current/latest dates (2026/2027) & 2 closed past date schemes
  schemes: SchemeTender[] = [
    {
      sNo: 1,
      refNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-2026',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '15/09/2026',
      closingDate: '30/11/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
      status: 'Open',
      rfpDocSize: '2.4 MB',
      sopDocSize: '1.8 MB',
      preBidDate: '05-Oct-2026 11:30 AM',
      techBidDate: '05-Dec-2026 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 2,
      refNo: 'RSLDC/EOI/MNSKSY/2026-27/01',
      schemeName: 'MNSKSY',
      schemeTitle: 'Mukhyamantri Nishulk Solar Krishi Sinchayee Yojana (MNSKSY)',
      code: 'MNSKSY-2026',
      schemeCategory: 'NA',
      category: 'NA',
      datePublished: '18/09/2026',
      closingDate: '25/11/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest (EOI) MNSKSY in RSLDC.',
      status: 'Open',
      rfpDocSize: '3.1 MB',
      sopDocSize: '2.0 MB',
      preBidDate: '08-Oct-2026 11:00 AM',
      techBidDate: '01-Dec-2026 03:30 PM',
      emdFee: '₹75,000',
      processFee: '₹2,500'
    },
    {
      sNo: 3,
      refNo: 'RSLDC/EOI/IMSHAKTI/2026-27/01',
      schemeName: 'IM_Shakti',
      schemeTitle: 'Indira Mahila Shakti Prashikshan Va Kaushal Samvardhan Yojana (IM_Shakti)',
      code: 'IM_SHAKTI-2026',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '20/09/2026',
      closingDate: '15/12/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme',
      status: 'Open',
      rfpDocSize: '4.2 MB',
      sopDocSize: '2.2 MB',
      preBidDate: '10-Oct-2026 11:00 AM',
      techBidDate: '20-Dec-2026 02:00 PM',
      emdFee: '₹1,00,000',
      processFee: '₹3,000'
    },
    {
      sNo: 4,
      refNo: 'RSLDC/EOI/2026-27/Cat-III/RAJKVIK RTD',
      schemeName: 'RAJKVIKRTD',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram RTD (RAJKVIK RTD)',
      code: 'RAJKVIK-RTD-2026',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '22/09/2026',
      closingDate: '10/12/2026',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
      status: 'Open',
      rfpDocSize: '2.1 MB',
      sopDocSize: '1.4 MB',
      preBidDate: '12-Oct-2026 03:00 PM',
      techBidDate: '15-Dec-2026 03:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 5,
      refNo: 'RSLDC/MMYKY2/Eol26-27/01',
      schemeName: 'MMYKY',
      schemeTitle: 'Mukhya Mantri Yuva Kaushal Yojana (MMYKY 2.0)',
      code: 'MMYKY-2026',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '24/09/2026',
      closingDate: '20/12/2026',
      eoiCategory: 'General',
      eoiDescription: 'Eol for MMYKY 2.0 for RSLDC',
      status: 'Open',
      rfpDocSize: '3.6 MB',
      sopDocSize: '2.5 MB',
      preBidDate: '14-Oct-2026 11:00 AM',
      techBidDate: '28-Dec-2026 03:00 PM',
      emdFee: '₹60,000',
      processFee: '₹2,000'
    },
    {
      sNo: 6,
      refNo: 'RSLDC/Eol/2026-27/1/MMKVYSAMARTH',
      schemeName: 'SAMARTH',
      schemeTitle: 'SAMARTH Skill Development Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAMARTH-2026',
      schemeCategory: 'SAMARTH',
      category: 'SAMARTH',
      datePublished: '25/09/2026',
      closingDate: '31/12/2026',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAMARTH) scheme of RSLDC',
      status: 'Open',
      rfpDocSize: '2.5 MB',
      sopDocSize: '1.6 MB',
      preBidDate: '15-Oct-2026 11:30 AM',
      techBidDate: '08-Jan-2027 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 7,
      refNo: 'RSLDC/Eol/2026-27/1-RAJKVIK General',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK General)',
      code: 'RAJKVIK-GEN-2026',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '26/09/2026',
      closingDate: '05/01/2027',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.',
      status: 'Open',
      rfpDocSize: '3.0 MB',
      sopDocSize: '1.9 MB',
      preBidDate: '18-Oct-2026 02:00 PM',
      techBidDate: '12-Jan-2027 03:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 8,
      refNo: 'RSLDC/Eol/2026-27/1/MMKVYSAKSHM',
      schemeName: 'SAKSHM',
      schemeTitle: 'SAKSHAM Skill Training Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAKSHM-2026',
      schemeCategory: 'SAKSHM',
      category: 'SAKSHM',
      datePublished: '27/09/2026',
      closingDate: '15/01/2027',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAKSHM) scheme of RSLDC',
      status: 'Open',
      rfpDocSize: '2.2 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '20-Oct-2026 03:00 PM',
      techBidDate: '22-Jan-2027 04:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 9,
      refNo: 'RSLDC/EOI/MMKVY-SPL/2026-27/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY - Special Window)',
      code: 'MMKVY-SPL-2026',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '10/06/2026',
      closingDate: '15/08/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for Special Window Skill Training under MMKVY Scheme (Application window closed).',
      status: 'Closed',
      rfpDocSize: '2.8 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '20-Jun-2026 02:00 PM',
      techBidDate: '20-Aug-2026 04:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 10,
      refNo: 'RSLDC/EOI/2026/Cat-III/RAJKVIK-PILOT',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK Pilot Batch)',
      code: 'RAJKVIK-PILOT-26',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '01/07/2026',
      closingDate: '10/09/2026',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-Train-Deploy (RTD) Pilot Batch under RAJKVIK Scheme (Bid submission period ended).",
      status: 'Closed',
      rfpDocSize: '2.9 MB',
      sopDocSize: '1.7 MB',
      preBidDate: '15-Jul-2026 11:00 AM',
      techBidDate: '15-Sep-2026 03:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    }
  ];

  viewSchemeDetails(scheme: SchemeTender): void {
    this.selectedScheme.set(scheme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly Math = Math;


  backToList(): void {
    this.selectedScheme.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handleApplyForScheme(): void {
    // Check if profile is incomplete
    if (this.isProfileIncomplete()) {
      this.showOtrPromptModal.set(true);
      return;
    }

    // Direct navigation to scheme proposal form without showing the registration preview modal
    const scheme = this.selectedScheme();
    this.router.navigate(['/scheme-form'], {
      queryParams: {
        refNo: scheme?.refNo || 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
        title: scheme?.schemeTitle || scheme?.schemeName || 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
        schemeName: scheme?.schemeName || 'MMKVY',
        category: scheme?.schemeCategory || scheme?.category || 'ALL',
        eoiCategory: scheme?.eoiCategory || 'General',
        datePublished: scheme?.datePublished || '15/09/2026',
        closingDate: scheme?.closingDate || '30/11/2026',
        emdFee: scheme?.emdFee || '₹50,000',
        processFee: scheme?.processFee || '₹2,000',
        eoiDescription: scheme?.eoiDescription || 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
      }
    });
  }

  goToProfile(): void {
    this.dismissOtrPrompt();
    this.router.navigate(['/profile']);
  }

  goToRegistration(): void {
    this.goToProfile();
  }

  downloadDoc(docType: string): void {
    const s = this.selectedScheme();
    console.log(`Downloading ${docType} for ${s?.schemeTitle || s?.schemeName} (${s?.refNo})`);
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    if (!scheme) return '';
    if (scheme.eoiDescription) return scheme.eoiDescription;
    return `Expression of Interest for Empanelment of Training Providers / PIAs to implement state skill development initiatives under ${scheme.schemeTitle || scheme.schemeName}.`;
  }
}

