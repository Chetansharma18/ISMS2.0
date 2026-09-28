import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem } from './tenders-page.component';

@Component({
  selector: 'app-scheme-detail-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full min-h-screen bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 space-y-5 animate-in fade-in duration-200">
      
      <!-- ====================================================================
           TOP CONTROLS & NAVIGATION BAR
           ==================================================================== -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 bg-white">
        
        <!-- Back Button (Half Arrow Style) -->
        <button
          type="button"
          (click)="onBack()"
          class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-[#0483AC] active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs text-xs sm:text-[13px] w-fit"
          title="Back to Active Schemes"
        >
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        <!-- Top Action Buttons (View Details [Downloads PDF] + Apply) -->
        <div class="flex items-center flex-wrap gap-2.5">
          <!-- "View Details" button that displays complete information and downloads/prints official PDF -->
          <button
            type="button"
            (click)="handleViewDetailsClick()"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 h-8.5 rounded-md bg-white hover:bg-slate-50 text-[#0B3558] border border-slate-300 hover:border-[#0B3558] text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="View complete scheme details and download PDF"
          >
            <span class="material-icons text-[#0B3558] text-[16px] leading-none shrink-0">visibility</span>
            <span>View Details</span>
          </button>

          <!-- Apply for this Scheme Button -->
          <button
            type="button"
            (click)="onApply()"
            class="inline-flex items-center gap-1.5 px-4 py-1.5 h-8.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <span>Apply for this Scheme</span>
            <span class="material-icons text-white text-[15px] leading-none shrink-0">arrow_forward</span>
          </button>
        </div>

      </div>

      <!-- ====================================================================
           SCHEME OVERVIEW CARD (Pure White Background, Proper Reduced Heading)
           ==================================================================== -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="p-5 sm:p-6 space-y-4 bg-white">
          
          <div class="space-y-1">
            <!-- Scheme Heading with proper, balanced size (not oversized) -->
            <h2 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight leading-snug">
              {{ scheme.schemeTitle || scheme.schemeName }}
            </h2>
            <!-- Scheme Description in simple, clean text -->
            <p class="text-xs sm:text-[12.5px] text-slate-600 leading-relaxed font-normal">
              {{ scheme.eoiDescription }}
            </p>
          </div>

          <!-- Metadata Fields (Exactly the 8 fields already present) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1 break-all">{{ scheme.refNo }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ scheme.schemeName }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ scheme.schemeCategory || 'ALL' }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ scheme.eoiCategory || 'General' }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF EOI PUBLISHED</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">{{ scheme.datePublished }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
              <span class="font-medium text-rose-600 text-[11.5px] block mt-1">{{ scheme.closingDate }}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">
                {{ scheme.emdFee || '₹50,000' }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span>
              </span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
              <span class="font-normal text-slate-700 text-[11.5px] block mt-1">
                {{ scheme.processFee || '₹2,000' }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- ====================================================================
           SECTION A: REQUEST FOR PROPOSAL (RFP) & SOP DOCUMENTS (Tabular Manner)
           (Download button removed, shows "View Details" action)
           ==================================================================== -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h3 class="text-xs sm:text-sm font-semibold tracking-tight text-[#0B3558]">
            Section A: Request for Proposal (RFP) &amp; SOP Documents
          </h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs bg-white">
            <thead>
              <tr class="bg-white text-slate-700 text-[11px] sm:text-[11.5px] font-semibold border-b border-slate-200">
                <th class="py-2.5 px-3 w-14 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                <th class="py-2.5 px-4 border-r border-slate-200">Document Title</th>
                <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">Format</th>
                <th class="py-2.5 px-3 w-28 text-center border-r border-slate-200 whitespace-nowrap">File Size</th>
                <th class="py-2.5 px-4 w-32 text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
              @for (doc of rfpDocs; track doc.sNo) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-2.5 px-3 text-center text-slate-600 font-mono border-r border-slate-100">{{ doc.sNo }}</td>
                  <td class="py-2.5 px-4 text-slate-800 font-medium border-r border-slate-100">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 shrink-0 select-none shadow-2xs" viewBox="0 0 24 24">
                        <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                        <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                      </svg>
                      <span class="text-xs sm:text-[12.5px] text-slate-800 font-medium">{{ doc.name }}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-rose-700 border border-rose-200">PDF Format</span>
                  </td>
                  <td class="py-2.5 px-3 text-center text-slate-500 text-[11.5px] whitespace-nowrap border-r border-slate-100">{{ doc.size }}</td>
                  <td class="py-2.5 px-4 text-center whitespace-nowrap">
                    <!-- Clean View Details action instead of direct download button -->
                    <button
                      type="button"
                      (click)="viewDocDetails(doc)"
                      class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-[#0B3558] border border-slate-300 hover:border-[#0B3558] text-xs font-semibold transition-colors cursor-pointer"
                      title="View details of {{ doc.name }}"
                    >
                      <span class="material-icons text-[#0B3558] text-[14px] leading-none shrink-0">visibility</span>
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ====================================================================
           SECTION B: PRESCRIBED ANNEXURES (Tabular Manner)
           (Shows ONLY Name, with ONE SINGLE BUTTON to download all annexures)
           ==================================================================== -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <!-- Section Header with Single "Download All Annexures" Button -->
        <div class="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <h3 class="text-xs sm:text-sm font-semibold tracking-tight text-[#0B3558]">
              Section B: Prescribed Annexures
            </h3>
            <span class="text-[11px] text-slate-500 font-normal">({{ annexures.length }} formats)</span>
          </div>

          <!-- Single button to download all annexures with one click -->
          <button
            type="button"
            (click)="downloadAllAnnexures()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Download all prescribed annexures in a single package"
          >
            <span class="material-icons text-white text-[15px] leading-none shrink-0">download</span>
            <span>Download All Annexures</span>
          </button>
        </div>

        <!-- Annexure Table: Showing ONLY S.No and Annexure Name -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs bg-white">
            <thead>
              <tr class="bg-white text-slate-700 text-[11px] sm:text-[11.5px] font-semibold border-b border-slate-200">
                <th class="py-2.5 px-3 w-14 text-center border-r border-slate-200 whitespace-nowrap">S. No.</th>
                <th class="py-2.5 px-4">Annexure Name</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-normal text-slate-700">
              @for (ann of annexures; track ann.sNo) {
                <tr class="hover:bg-slate-50/60 transition-colors">
                  <td class="py-2 px-3 text-center text-slate-600 font-mono border-r border-slate-100">{{ ann.sNo }}</td>
                  <td class="py-2 px-4 text-slate-800 font-medium">
                    <div class="flex items-center gap-2">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#0B3558]/40 shrink-0"></span>
                      <span class="text-xs sm:text-[12.5px] text-slate-800 leading-snug">{{ ann.name }}</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ====================================================================
           SECTION C: INFORMATION REQUIRED TO FILL EOI (Pure White Clean View)
           ==================================================================== -->
      <div class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div class="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-xs sm:text-sm font-semibold tracking-tight text-[#0B3558]">
            Section C: Information Required to Fill EOI
          </h3>
          <button
            type="button"
            (click)="generateOfficialPdf(true)"
            class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B3558] hover:text-sky-700 transition-colors cursor-pointer"
          >
            <span class="material-icons text-[14px] leading-none">download</span>
            <span>Download Checklist PDF</span>
          </button>
        </div>

        <div class="p-4 sm:p-5 bg-white">
          <p class="text-xs text-slate-500 mb-3">
            The following documents and information must be prepared and available before you begin filling the online EOI application form.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            @for (req of requiredInfo; track req.sNo) {
              <div class="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {{ req.sNo }}
                </span>
                <div>
                  <p class="text-xs font-medium text-slate-800 leading-snug">{{ req.name }}</p>
                  @if (req.note) {
                    <p class="text-[11px] text-slate-500 mt-0.5">{{ req.note }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- ====================================================================
           MODAL 1: VIEW DETAILS & OFFICIAL SCHEME INFORMATION SUMMARY
           (Triggered by the top "View Details" button)
           ==================================================================== -->
      @if (showSchemeSummaryModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between shrink-0">
              <div class="flex items-center gap-2">
                <span class="material-icons text-[#0B3558] text-xl">description</span>
                <h4 class="text-sm font-bold text-[#0B3558]">Scheme Details &amp; Application Guidelines</h4>
              </div>
              <button
                type="button"
                (click)="closeSchemeSummaryModal()"
                class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md transition-colors"
              >
                <span class="material-icons text-xl leading-none">close</span>
              </button>
            </div>

            <!-- Modal Body (Scrollable) -->
            <div class="p-5 overflow-y-auto space-y-4 text-xs text-slate-700 bg-white">
              
              <!-- Scheme Title & Ref -->
              <div class="p-3 bg-white border border-slate-200 rounded-lg">
                <h3 class="text-sm font-bold text-[#0B3558]">{{ scheme.schemeTitle || scheme.schemeName }}</h3>
                <p class="text-[11.5px] text-slate-600 mt-1 leading-relaxed">{{ scheme.eoiDescription }}</p>
                <div class="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px] font-mono text-slate-600">
                  <span>Ref: <strong>{{ scheme.refNo }}</strong></span>
                  <span>•</span>
                  <span>Category: <strong>{{ scheme.schemeCategory || 'ALL' }}</strong></span>
                  <span>•</span>
                  <span>Closing: <strong class="text-rose-600">{{ scheme.closingDate }}</strong></span>
                </div>
              </div>

              <!-- Particulars Grid -->
              <div class="grid grid-cols-2 gap-2 text-[11.5px]">
                <div class="p-2.5 border border-slate-200 rounded bg-white">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block">Date Published</span>
                  <span class="font-medium text-slate-800 mt-0.5 block">{{ scheme.datePublished }}</span>
                </div>
                <div class="p-2.5 border border-slate-200 rounded bg-white">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block">Date of Closing</span>
                  <span class="font-medium text-rose-600 mt-0.5 block">{{ scheme.closingDate }}</span>
                </div>
                <div class="p-2.5 border border-slate-200 rounded bg-white">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block">EMD Fee</span>
                  <span class="font-medium text-slate-800 mt-0.5 block">{{ scheme.emdFee || '₹50,000' }} (Refundable)</span>
                </div>
                <div class="p-2.5 border border-slate-200 rounded bg-white">
                  <span class="text-[10px] text-slate-400 font-semibold uppercase block">Processing Fee</span>
                  <span class="font-medium text-slate-800 mt-0.5 block">{{ scheme.processFee || '₹2,000' }} (Non-Refundable)</span>
                </div>
              </div>

              <!-- Checklist Summary -->
              <div>
                <h5 class="font-bold text-[#0B3558] text-xs mb-2 uppercase tracking-wide">Required Documents Checklist ({{ requiredInfo.length }} Items)</h5>
                <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
                  @for (req of requiredInfo; track req.sNo) {
                    <div class="flex items-center gap-2 p-1.5 text-[11px] border-b border-slate-100">
                      <span class="w-4 h-4 rounded-full bg-[#0B3558]/10 text-[#0B3558] text-[9px] font-bold flex items-center justify-center shrink-0">
                        {{ req.sNo }}
                      </span>
                      <span class="font-medium text-slate-800">{{ req.name }}</span>
                      @if (req.note) {
                        <span class="text-slate-400 text-[10px]">({{ req.note }})</span>
                      }
                    </div>
                  }
                </div>
              </div>

              <!-- Annexures Summary -->
              <div>
                <h5 class="font-bold text-[#0B3558] text-xs mb-2 uppercase tracking-wide">Prescribed Annexures ({{ annexures.length }} Formats)</h5>
                <div class="space-y-1 max-h-36 overflow-y-auto pr-1">
                  @for (ann of annexures; track ann.sNo) {
                    <div class="flex items-center gap-2 p-1.5 text-[11px] border-b border-slate-100">
                      <span class="text-slate-400 font-mono text-[10px]">{{ ann.sNo }}.</span>
                      <span class="text-slate-700 font-medium">{{ ann.name }}</span>
                    </div>
                  }
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                (click)="closeSchemeSummaryModal()"
                class="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              
              <!-- Direct PDF Download / Print button -->
              <button
                type="button"
                (click)="generateOfficialPdf()"
                class="px-4 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                <span class="material-icons text-white text-[15px] leading-none">download</span>
                <span>Download Official PDF</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ====================================================================
           MODAL 2: DOCUMENT DETAILS MODAL (When user clicks "View Details" on Section A)
           ==================================================================== -->
      @if (activeDocModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div class="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div class="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <h4 class="text-sm font-bold text-[#0B3558]">Document Details</h4>
              <button
                type="button"
                (click)="closeDocModal()"
                class="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-md"
              >
                <span class="material-icons text-lg leading-none">close</span>
              </button>
            </div>
            
            <div class="p-5 space-y-3.5 text-xs text-slate-700 bg-white">
              <div>
                <span class="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Document Title</span>
                <p class="text-sm font-semibold text-slate-800 mt-0.5">{{ activeDocModal()?.name }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <span class="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Format</span>
                  <span class="font-medium text-slate-800 mt-0.5 inline-block">PDF Document</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">File Size</span>
                  <span class="font-medium text-slate-800 mt-0.5 inline-block">{{ activeDocModal()?.size }}</span>
                </div>
              </div>

              <div class="pt-2 border-t border-slate-100">
                <span class="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Applicable For</span>
                <p class="text-slate-600 mt-0.5">
                  Official operational reference document for submission of proposals under <strong>{{ scheme.schemeTitle || scheme.schemeName }}</strong>.
                </p>
              </div>
            </div>

            <div class="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="closeDocModal()"
                class="px-3.5 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                (click)="downloadActiveDoc()"
                class="px-4 py-1.5 rounded-md bg-[#0B3558] hover:bg-[#082842] text-white text-xs font-semibold cursor-pointer flex items-center gap-1.5"
              >
                <span class="material-icons text-white text-[15px] leading-none">download</span>
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SchemeDetailViewComponent {
  @Input({ required: true }) scheme!: SchemeTender;
  @Input() rfpDocs: EoiDocumentItem[] = [];
  @Input() annexures: EoiDocumentItem[] = [];
  @Input() requiredInfo: Array<{ sNo: number; name: string; note?: string }> = [];

  @Output() back = new EventEmitter<void>();
  @Output() apply = new EventEmitter<SchemeTender>();
  @Output() download = new EventEmitter<string>();

  readonly activeDocModal = signal<EoiDocumentItem | null>(null);
  readonly showSchemeSummaryModal = signal<boolean>(false);

  onBack(): void {
    this.back.emit();
  }

  onApply(): void {
    this.apply.emit(this.scheme);
  }

  viewDocDetails(doc: EoiDocumentItem): void {
    this.activeDocModal.set(doc);
  }

  closeDocModal(): void {
    this.activeDocModal.set(null);
  }

  downloadActiveDoc(): void {
    const doc = this.activeDocModal();
    if (doc) {
      this.download.emit(doc.name);
      this.closeDocModal();
    }
  }

  // Top "View Details" button handler: shows modal and triggers official PDF generation
  handleViewDetailsClick(): void {
    this.showSchemeSummaryModal.set(true);
    // Also auto-open the official print/PDF generation window
    this.generateOfficialPdf(false);
  }

  closeSchemeSummaryModal(): void {
    this.showSchemeSummaryModal.set(false);
  }

  // Download all annexures
  downloadAllAnnexures(): void {
    const s = this.scheme;
    const annexureList = this.annexures.map(a => `${a.sNo}. ${a.name} (${a.size})`).join('\n');
    const content = `================================================================================
PRESCRIBED ANNEXURES PACKAGE - ${s.schemeTitle || s.schemeName}
EOI Reference: ${s.refNo}
================================================================================

Total Annexures Included (${this.annexures.length}):
${annexureList}

Note: All prescribed formats must be filled, stamped, and signed by the Authorized Signatory before submission.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(s.schemeName || 'Scheme').replace(/[^a-zA-Z0-9]/g, '_')}_All_Annexures_Package.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Generate and print/download clean, official PDF
  generateOfficialPdf(checklistOnly = false): void {
    const s = this.scheme;
    const printWindow = window.open('', '_blank', 'width=950,height=900,top=50,left=100');
    
    if (!printWindow) {
      window.print();
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${s.schemeTitle || s.schemeName} - Official Scheme Details</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            padding: 24px;
            line-height: 1.45;
            font-size: 11.5px;
          }
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0b3558;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .gov-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #0b3558;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .gov-sub {
            font-size: 11px;
            color: #475569;
            font-weight: 500;
          }
          .scheme-heading {
            font-size: 15px;
            font-weight: 700;
            color: #0b3558;
            margin-bottom: 4px;
          }
          .scheme-desc {
            font-size: 11px;
            color: #334155;
            margin-bottom: 14px;
            line-height: 1.4;
          }
          .meta-table, .doc-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 11px;
          }
          .meta-table td, .meta-table th, .doc-table td, .doc-table th {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
          }
          .meta-table th, .doc-table th {
            background-color: #f8fafc;
            color: #0b3558;
            font-weight: 600;
          }
          .label-cell {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
            width: 25%;
          }
          .value-cell {
            color: #0f172a;
            width: 25%;
          }
          .section-title {
            font-size: 12px;
            font-weight: 700;
            color: #0b3558;
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-bottom: none;
            padding: 5px 8px;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          .checklist-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            margin-bottom: 14px;
          }
          .check-item {
            border: 1px solid #cbd5e1;
            padding: 5px 7px;
            font-size: 10.5px;
            border-radius: 4px;
            background: #ffffff;
          }
          .check-num {
            font-weight: 700;
            color: #0b3558;
            margin-right: 4px;
          }
          .footer {
            margin-top: 18px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 9.5px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 14px; display: flex; justify-content: flex-end; gap: 8px;">
          <button onclick="window.print()" style="background: #0b3558; color: white; border: none; padding: 7px 14px; border-radius: 4px; font-weight: 600; font-size: 12px; cursor: pointer;">
            Save as PDF / Print
          </button>
        </div>

        <div class="header">
          <div>
            <div class="gov-title">Government of Rajasthan</div>
            <div class="gov-sub">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</div>
            <div class="gov-sub">Integrated Skill Management System (ISMS 2.0)</div>
          </div>
          <div style="text-align: right; font-size: 10.5px; color: #475569;">
            <div>EOI Ref: <strong>${s.refNo}</strong></div>
            <div>Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div>Status: <span style="color: #059669; font-weight: 600;">${s.status || 'Open'}</span></div>
          </div>
        </div>

        <div class="scheme-heading">${s.schemeTitle || s.schemeName}</div>
        <div class="scheme-desc">${s.eoiDescription}</div>

        <div class="section-title">Scheme &amp; EOI Particulars</div>
        <table class="meta-table">
          <tr>
            <td class="label-cell">EOI Reference No.</td>
            <td class="value-cell"><strong>${s.refNo}</strong></td>
            <td class="label-cell">Scheme Name</td>
            <td class="value-cell">${s.schemeName}</td>
          </tr>
          <tr>
            <td class="label-cell">Scheme Category</td>
            <td class="value-cell">${s.schemeCategory || 'ALL'}</td>
            <td class="label-cell">EOI Category</td>
            <td class="value-cell">${s.eoiCategory || 'General'}</td>
          </tr>
          <tr>
            <td class="label-cell">Date of EOI Published</td>
            <td class="value-cell">${s.datePublished}</td>
            <td class="label-cell">Date of Closing</td>
            <td class="value-cell" style="color: #dc2626; font-weight: 600;">${s.closingDate}</td>
          </tr>
          <tr>
            <td class="label-cell">EMD Fee</td>
            <td class="value-cell">${s.emdFee || '₹50,000'} (Refundable)</td>
            <td class="label-cell">Processing Fee</td>
            <td class="value-cell">${s.processFee || '₹2,000'} (Non-Refundable)</td>
          </tr>
        </table>

        ${!checklistOnly ? `
        <div class="section-title">Section A: Request for Proposal (RFP) &amp; SOP Documents</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">S.No.</th>
              <th>Document Title</th>
              <th style="width: 90px; text-align: center;">Format</th>
              <th style="width: 80px; text-align: center;">File Size</th>
            </tr>
          </thead>
          <tbody>
            ${this.rfpDocs.map(d => `
              <tr>
                <td style="text-align: center;">${d.sNo}</td>
                <td style="font-weight: 500;">${d.name}</td>
                <td style="text-align: center;">PDF Format</td>
                <td style="text-align: center;">${d.size}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">Section B: Prescribed Annexures (${this.annexures.length} Formats)</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 45px; text-align: center;">S.No.</th>
              <th>Annexure Name</th>
            </tr>
          </thead>
          <tbody>
            ${this.annexures.map(a => `
              <tr>
                <td style="text-align: center;">${a.sNo}</td>
                <td>${a.name}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="section-title">Section C: Mandatory Information &amp; Documents Required to Fill EOI</div>
        <div class="checklist-grid" style="margin-top: 6px;">
          ${this.requiredInfo.map(r => `
            <div class="check-item">
              <span class="check-num">${r.sNo}.</span>
              <strong>${r.name}</strong>
              ${r.note ? `<div style="color: #64748b; font-size: 9.5px; margin-top: 2px;">Note: ${r.note}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          <div>Rajasthan Skill and Livelihoods Development Corporation, EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur</div>
          <div>Portal: isms.rajasthan.gov.in | Helpline: 0141-2713800</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
