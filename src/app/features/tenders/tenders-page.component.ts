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
    ActionModalComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-slate-800 font-sans" style="font-family: 'Inter', sans-serif;">
      
      <!-- ====================================================================
           VIEW 1: ACTIVE EOI TABLE (Using Reusable PageHeader & DataTable)
           ==================================================================== -->
      @if (!selectedScheme()) {
        <div class="p-4 sm:p-5 space-y-3 font-sans">
          
          <!-- Themed Header Bar via Reusable PageHeaderComponent -->
          <app-page-header
            title="Active Schemes"
            bgColor="#0B3558"
          ></app-page-header>

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
                  class="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-semibold rounded-md shadow-xs whitespace-nowrap transition-all flex items-center gap-1.5 justify-center shrink-0 cursor-pointer active:scale-95"
                  style="color: #ffffff !important;"
                >
                  <span class="text-white font-semibold" style="color: #ffffff !important;">Complete Registration</span>
                  <svg class="w-3.5 h-3.5 text-white" style="stroke: #ffffff !important; color: #ffffff !important;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          }

          <!-- Schemes Table via Reusable TableComponent -->
          <app-table
            [columns]="schemeColumns"
            [data]="schemes"
            [pagination]="true"
            [pageSize]="pageSize"
            itemUnit="schemes"
            [customTemplates]="{
              eoiDescription: descTemplate,
              viewAction: viewActionTemplate
            }"
          >
          </app-table>

          <ng-template #descTemplate let-item>
            <span class="line-clamp-2 text-slate-600 text-[11px] leading-relaxed">{{ item.eoiDescription }}</span>
          </ng-template>

          <ng-template #viewActionTemplate let-item>
            <app-button
              variant="pdf-view"
              size="sm"
              (btnClick)="viewSchemeDetails(item)"
              title="View EOI Details"
            >
              View
            </app-button>
          </ng-template>

        </div>
      }

      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      <!-- ====================================================================
           VIEW 2: SCHEME DETAILS & EOI DOCUMENTS VIEW (Matching Screenshot 1 & 2)
           ==================================================================== -->
      @if (selectedScheme(); as s) {
        <div class="p-6 sm:p-8 space-y-5 animate-in fade-in duration-200">
          
          <!-- Back Navigation: Half Arrow Only -->
          <div class="flex items-center -mt-5 mb-2">
            <button
              type="button"
              (click)="backToList()"
              class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0483AC] active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs"
              title="Back to Active Schemes"
            >
              <svg class="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span class="font-semibold text-sm">Back</span>
            </button>
          </div>

          <!-- SCHEME HEADER & DETAILS (Clean Background Presentation) -->
          <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <!-- Header Row: Title, Description & Light Theme Apply Button -->
            <div class="p-5 sm:p-6 space-y-4">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div class="space-y-1.5 max-w-4xl">
                  <!-- Scheme Heading -->
                  <h2 class="text-lg sm:text-xl font-bold text-[#0B3558] tracking-tight">
                    {{ s.schemeTitle || s.schemeName }}
                  </h2>
                  <!-- Scheme Description at bottom of heading -->
                  <p class="text-xs sm:text-[12.5px] text-slate-600 leading-relaxed font-normal">
                    {{ s.eoiDescription }}
                  </p>
                </div>

                <!-- Apply for this Scheme Button (Light Theme) -->
                <button
                  type="button"
                  (click)="handleApplyForScheme()"
                  class="px-4 py-2 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs sm:text-[13px] font-semibold shadow-2xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <span>Apply for this Scheme</span>
                  <span class="material-icons text-[#0B3558] text-[16px] leading-none shrink-0 select-none">arrow_forward</span>
                </button>
              </div>

              <!-- Table Fields Clean Presentation (Clean non-bold Inter font, Date of Closing, EMD Fee, Process Fee) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1 break-all">{{ s.refNo }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.schemeName }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.schemeCategory }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.eoiCategory }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF EOI PUBLISHED</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.datePublished }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
                  <span class="font-medium text-rose-600 text-[11.5px] block mt-1">{{ s.closingDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.emdFee || '₹50,000' }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span></span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
                  <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ s.processFee || '₹2,000' }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               SECTION A: REQUEST FOR PROPOSAL (RFP) & SOP DOCUMENTS
               ================================================================ -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <!-- Header -->
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
             
                <h3 class="text-sm font-semibold tracking-tight text-[#0B3558]">
                  Section A: Request for Proposal (RFP) &amp; SOP Documents
                </h3>
              </div>
           
            </div>

            <!-- Documents Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-semibold border-b border-slate-200">
                    <th class="py-2.5 px-3 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                    <th class="py-2.5 px-4 border-r border-slate-200">Document Title</th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">Format</th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">File Size</th>
                    <th class="py-2.5 px-4 w-36 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                  @for (doc of rfpDocuments; track doc.sNo) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3 text-center text-slate-600 font-normal border-r border-slate-100">{{ doc.sNo }}</td>
                      <td class="py-3 px-4 text-slate-800 font-medium border-r border-slate-100">
                        <div class="flex items-center gap-2.5">
                          <svg class="w-4 h-4 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <span class="text-xs sm:text-[12.5px] text-slate-800 font-semibold leading-relaxed">{{ doc.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">PDF Format</span>
                      </td>
                      <td class="py-3 px-3 text-center text-slate-500 font-normal text-[11.5px] whitespace-nowrap border-r border-slate-100">{{ doc.size }}</td>
                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          (click)="downloadDoc(doc.name)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                          title="Download {{ doc.name }}"
                        >
                          <span class="material-icons text-[#0B3558] text-[15px] leading-none shrink-0 select-none">download</span>
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- ================================================================
               SECTION B: PRESCRIBED ANNEXURE FORMATS (Download Templates)
               ================================================================ -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <!-- Header -->
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold tracking-tight text-[#0B3558]">
                  Section B: Prescribed Annexure Formats
                </h3>
              </div>
        
            </div>

            <!-- Annexures Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="bg-[#F4F7FB] text-slate-700 text-[11px] sm:text-[11.5px] font-semibold border-b border-slate-200">
                    <th class="py-2.5 px-3 w-12 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                    <th class="py-2.5 px-4 border-r border-slate-200">Annexure &amp; Format Title</th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">Format</th>
                    <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">File Size</th>
                    <th class="py-2.5 px-4 w-36 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
                  @for (doc of annexureDocuments; track doc.sNo) {
                    <tr class="hover:bg-slate-50/80 transition-colors">
                      <td class="py-3 px-3 text-center text-slate-600 font-normal border-r border-slate-100">{{ doc.sNo }}</td>
                      <td class="py-3 px-4 text-slate-800 font-normal border-r border-slate-100">
                        <div class="flex items-center gap-2.5">
                          <svg class="w-4 h-4 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <span class="text-xs sm:text-[12.5px] text-slate-800 font-normal leading-relaxed">{{ doc.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/70">PDF / Word</span>
                      </td>
                      <td class="py-3 px-3 text-center text-slate-500 font-normal text-[11.5px] whitespace-nowrap border-r border-slate-100">{{ doc.size }}</td>
                      <td class="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          (click)="downloadDoc(doc.name)"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-50 hover:bg-sky-100 text-[#0B3558] border border-sky-200 hover:border-sky-300 text-xs font-normal transition-colors cursor-pointer shadow-2xs"
                          title="Download {{ doc.name }}"
                        >
                          <span class="material-icons text-[#0B3558] text-[15px] leading-none shrink-0 select-none">download</span>
                          <span>Download Format</span>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- ================================================================
               SECTION C: INFORMATION REQUIRED TO FILL EOI
               ================================================================ -->
          <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <!-- Header -->
            <div class="bg-[#F4F7FB] border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-semibold tracking-tight text-[#0B3558]">
                  Section C: Information Required to Fill EOI
                </h3>
              </div>
            </div>

            <!-- Informational Requirements List -->
            <div class="p-4">
              <p class="text-xs text-slate-500 mb-3">The following documents and information must be prepared and available before you begin filling the online EOI application form.</p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for (req of eoiRequiredInfo; track req.sNo) {
                  <div class="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{{ req.sNo }}</span>
                    <div>
                      <p class="text-xs font-medium text-slate-800 leading-snug">{{ req.name }}</p>
                      @if (req.note) {
                        <p class="text-[10.5px] text-slate-500 mt-0.5">{{ req.note }}</p>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

        </div>
      }

      <!-- ====================================================================
           MODAL: REUSABLE ONE-TIME REGISTRATION (OTR) POPUP PROMPT
           ==================================================================== -->
      <app-action-modal
        [isOpen]="showOtrPromptModal()"
        [showCloseButton]="false"
        title="Complete Profile to be Eligible for EOI"
        description="To be eligible to participate and submit Expression of Interest (EOI) proposals under RSLDC schemes, please complete your One-Time Registration (OTR) and organization profile first."
        primaryLabel="Complete Registration"
        secondaryLabel="Skip for Now"
        (primaryAction)="goToProfile()"
        (secondaryAction)="dismissOtrPrompt()"
        (close)="dismissOtrPrompt()"
      >
        <!-- Information Highlights Box -->
        <div class="w-full mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-left text-xs text-slate-700 space-y-2">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Verified Partner Status:</strong> Upload PAN, GST, and legal incorporation documents.</span>
          </div>
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <span><strong>Scheme EOI Access:</strong> Unlocks direct online application for all open flagship tenders.</span>
          </div>
        </div>
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
    { sNo: 1, name: 'Annexure-1: Covering Letter Format as per Annexure-1', size: '245 KB' },
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
    { sNo: 12, name: 'Annexure-13: Supporting Documents Checklist & Format as per Annexure-13', size: '850 KB' }
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
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'refNo', label: 'EOI Reference No.', cellClass: 'whitespace-nowrap font-normal text-slate-800' },
    { key: 'schemeName', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-medium text-slate-800' },
    { key: 'schemeCategory', label: 'Scheme Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'datePublished', label: 'Date of EOI Published', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'closingDate', label: 'Date of Closing', align: 'center', cellClass: 'whitespace-nowrap font-normal text-rose-600' },
    { key: 'eoiCategory', label: 'EOI Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'eoiDescription', label: 'EOI Description', width: 'min-w-[200px] max-w-sm', type: 'custom' },
    { key: 'viewAction', label: 'View', align: 'center', width: 'w-20', type: 'custom' }
  ];

  // Exact 10 schemes from Screenshot 2
  schemes: SchemeTender[] = [
    {
      sNo: 1,
      refNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-2026',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '23/01/2026',
      closingDate: '10/03/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
      status: 'Open',
      rfpDocSize: '2.4 MB',
      sopDocSize: '1.8 MB',
      preBidDate: '10-Feb-2026 11:30 AM',
      techBidDate: '18-Mar-2026 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 2,
      refNo: 'RSLDC/EOI/MNSKSY/2025-26/01',
      schemeName: 'MNSKSY',
      schemeTitle: 'Mukhyamantri Nishulk Solar Krishi Sinchayee Yojana (MNSKSY)',
      code: 'MNSKSY-2025',
      schemeCategory: 'NA',
      category: 'NA',
      datePublished: '17/02/2026',
      closingDate: '09/03/2026',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest (EOI) MNSKSY in RSLDC.',
      status: 'Open',
      rfpDocSize: '3.1 MB',
      sopDocSize: '2.0 MB',
      preBidDate: '25-Feb-2026 11:00 AM',
      techBidDate: '15-Mar-2026 03:30 PM',
      emdFee: '₹75,000',
      processFee: '₹2,500'
    },
    {
      sNo: 3,
      refNo: 'RSLDC/EOI/MMKVY Cat I II III/2024-25/01',
      schemeName: 'MMKVY',
      schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
      code: 'MMKVY-2024',
      schemeCategory: 'ALL',
      category: 'ALL',
      datePublished: '26/09/2024',
      closingDate: '07/12/2024',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
      status: 'Closed',
      rfpDocSize: '2.8 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '10-Oct-2024 02:00 PM',
      techBidDate: '15-Dec-2024 04:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 4,
      refNo: 'RSLDC/EOI/IMSHAKTI/2024-25/01',
      schemeName: 'IM_Shakti',
      schemeTitle: 'Indira Mahila Shakti Prashikshan Va Kaushal Samvardhan Yojana (IM_Shakti)',
      code: 'IM_SHAKTI',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '26/09/2024',
      closingDate: '23/10/2024',
      eoiCategory: 'General',
      eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme',
      status: 'Closed',
      rfpDocSize: '4.2 MB',
      sopDocSize: '2.2 MB',
      preBidDate: '05-Oct-2024 11:00 AM',
      techBidDate: '28-Oct-2024 02:00 PM',
      emdFee: '₹1,00,000',
      processFee: '₹3,000'
    },
    {
      sNo: 5,
      refNo: 'RSLDC/EOI/2023-24/Cat-III/RAJKVIK RTD',
      schemeName: 'RAJKVIKRTD',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram RTD (RAJKVIK RTD)',
      code: 'RAJKVIK-RTD',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '02/05/2023',
      closingDate: '31/03/2024',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
      status: 'Closed',
      rfpDocSize: '2.1 MB',
      sopDocSize: '1.4 MB',
      preBidDate: '15-May-2023 03:00 PM',
      techBidDate: '05-Apr-2024 03:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 6,
      refNo: 'RSLDC/MMYKY2/Eol23-24/01',
      schemeName: 'MMYKY',
      schemeTitle: 'Mukhya Mantri Yuva Kaushal Yojana (MMYKY 2.0)',
      code: 'MMYKY-2.0',
      schemeCategory: 'General',
      category: 'General',
      datePublished: '05/07/2023',
      closingDate: '25/07/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for MMYKY 2.0 for RSLDC',
      status: 'Closed',
      rfpDocSize: '3.6 MB',
      sopDocSize: '2.5 MB',
      preBidDate: '12-Jul-2023 11:00 AM',
      techBidDate: '28-Jul-2023 03:00 PM',
      emdFee: '₹60,000',
      processFee: '₹2,000'
    },
    {
      sNo: 7,
      refNo: 'RSLDC/Eol/2023-24/1/MMKVYSAMARTH',
      schemeName: 'SAMARTH',
      schemeTitle: 'SAMARTH Skill Development Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAMARTH',
      schemeCategory: 'SAMARTH',
      category: 'SAMARTH',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAMARTH) scheme of RSLDC',
      status: 'Closed',
      rfpDocSize: '2.5 MB',
      sopDocSize: '1.6 MB',
      preBidDate: '25-Apr-2023 11:30 AM',
      techBidDate: '20-May-2023 02:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 8,
      refNo: 'RSLDC/Eol/2023-24/1-RAJKVIK General',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK General)',
      code: 'RAJKVIK-GEN',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.',
      status: 'Closed',
      rfpDocSize: '3.0 MB',
      sopDocSize: '1.9 MB',
      preBidDate: '26-Apr-2023 02:00 PM',
      techBidDate: '20-May-2023 03:30 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    },
    {
      sNo: 9,
      refNo: 'RSLDC/Eol/2023-24/1/MMKVYSAKSHM',
      schemeName: 'SAKSHM',
      schemeTitle: 'SAKSHAM Skill Training Scheme (MMKVY Cat-II)',
      code: 'MMKVY-SAKSHM',
      schemeCategory: 'SAKSHM',
      category: 'SAKSHM',
      datePublished: '18/04/2023',
      closingDate: '15/05/2023',
      eoiCategory: 'General',
      eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAKSHM) scheme of RSLDC',
      status: 'Closed',
      rfpDocSize: '2.2 MB',
      sopDocSize: '1.5 MB',
      preBidDate: '25-Apr-2023 03:00 PM',
      techBidDate: '20-May-2023 04:00 PM',
      emdFee: '₹40,000',
      processFee: '₹1,500'
    },
    {
      sNo: 10,
      refNo: 'RSLDC/EOI/2022-23/1MMKVYRTD',
      schemeName: 'RAJKVIK',
      schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK RTD 2022-23)',
      code: 'RAJKVIK-RTD-22',
      schemeCategory: 'RAJKVIK',
      category: 'RAJKVIK',
      datePublished: '08/07/2022',
      closingDate: '31/03/2023',
      eoiCategory: 'General',
      eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
      status: 'Closed',
      rfpDocSize: '2.9 MB',
      sopDocSize: '1.7 MB',
      preBidDate: '18-Jul-2022 11:00 AM',
      techBidDate: '05-Apr-2023 03:00 PM',
      emdFee: '₹50,000',
      processFee: '₹2,000'
    }
  ];

  viewSchemeDetails(scheme: SchemeTender): void {
    this.selectedScheme.set(scheme);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  readonly Math = Math;
  readonly currentPage = signal<number>(1);
  readonly pageSize = 10;

  readonly totalPages = computed(() => Math.ceil(this.schemes.length / this.pageSize));
  readonly totalPagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  readonly paginatedSchemes = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.schemes.slice(start, start + this.pageSize);
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }


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
        datePublished: scheme?.datePublished || '23/01/2026',
        closingDate: scheme?.closingDate || '10/03/2026',
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
    alert(`Downloading ${docType} for ${s?.schemeTitle || s?.schemeName} (${s?.refNo})...`);
  }

  getSchemeDescription(scheme: SchemeTender | null): string {
    if (!scheme) return '';
    if (scheme.eoiDescription) return scheme.eoiDescription;
    return `Expression of Interest for Empanelment of Training Providers / PIAs to implement state skill development initiatives under ${scheme.schemeTitle || scheme.schemeName}.`;
  }
}

