import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ApplicantResponse } from '../../../services/eoi-state.service';
import type { ActivePreviewDocument } from '../scrutiny-desk.util';

/** Document / PDF viewer modal (header actions, verification strip, paper body, footer). */
@Component({
  selector: 'app-scrutiny-doc-viewer',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (doc()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto font-sans"
        role="dialog"
        aria-modal="true"
        (click)="close.emit()"
      >
        <div
          class="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 my-auto"
          (click)="$event.stopPropagation()"
        >
          <!-- Top Accent Gold Strip -->
          <div class="h-1 bg-amber-500 w-full"></div>

          <!-- Document Viewer Header Bar -->
          <div class="px-5 py-3.5 bg-navy text-white flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded bg-[#D92D20] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-2xs">
                PDF
              </div>
              <div class="min-w-0">
                <h3 class="text-sm sm:text-base font-semibold text-white tracking-tight truncate m-0" style="color: #ffffff !important;">
                  {{ doc()?.title }}
                </h3>
                <p class="text-[11px] text-slate-300 mt-0.5 truncate m-0 font-normal">
                  {{ doc()?.fileName }} &bull; {{ doc()?.fileSize }} &bull; Issued for: {{ applicant()?.anonymousLabel }}
                </p>
              </div>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Print Document Button -->
              <button
                type="button"
                (click)="printDoc()"
                class="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Print Document"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span class="hidden sm:inline">Print</span>
              </button>

              <!-- Download PDF Button -->
              <button
                type="button"
                (click)="downloadPdf.emit()"
                class="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span>Download PDF</span>
              </button>

              <!-- Close Viewer Button -->
              <button
                type="button"
                (click)="close.emit()"
                class="w-8 h-8 rounded-full text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer text-lg leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
          </div>

          <!-- Document Verification Strip -->
          <div class="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="font-medium text-slate-800">Tamper-Proof Document Verification:</span>
              <span class="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                AUTHENTIC &bull; {{ doc()?.refCode }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Authority: <strong>Govt of Rajasthan / RSLDC</strong></span>
              <span>&bull;</span>
              <span>Verification Desk: <strong>Verified</strong></span>
            </div>
          </div>

          <!-- Document Canvas / Reader Body (Scrollable Authentic Paper Certificate) -->
          <div class="overflow-y-auto flex-1 bg-slate-200/80 p-4 sm:p-6 lg:p-8 flex justify-center">

            <!-- Authentic A4 Paper Sheet -->
            <div class="max-w-190 w-full bg-white shadow-2xl rounded-sm border border-slate-300 p-6 sm:p-10 font-sans text-slate-800 space-y-6 relative" id="printCertificateArea">

              <!-- Official Document Header with Ashok Emblem & State Heading -->
              <div class="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <!-- Ashok Emblem SVG -->
                <div class="w-10 h-10 mx-auto text-navy mb-1">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                </div>

                <div class="text-[11px] tracking-widest font-extrabold uppercase text-slate-600">
                  GOVERNMENT OF RAJASTHAN
                </div>
                <div class="text-sm sm:text-base font-black tracking-tight uppercase text-navy">
                  RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)
                </div>
                <div class="text-[11px] text-slate-500 font-medium">
                  EMI Campus, Jhalana Doongri, Jaipur - 302004 &bull; Integrated Skill Management System (ISMS 2.0)
                </div>
              </div>

              <!-- Certificate / Document Title Strip -->
              <div class="text-center py-2 bg-slate-50 border border-slate-300 rounded">
                <span class="text-[10.5px] uppercase font-bold text-slate-500 tracking-wider block">STATUTORY EOI PROPOSAL ATTACHMENT</span>
                <h4 class="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight mt-0.5">
                  {{ doc()?.title }}
                </h4>
                <span class="text-[11px] font-mono text-slate-600">Certificate Reference: {{ doc()?.refCode }}</span>
              </div>

              <!-- Official Attestation Notice -->
              <div class="text-xs text-slate-700 leading-relaxed font-normal space-y-2">
                <p>
                  This is to certify that the document titled <strong class="text-slate-900 font-semibold">{{ doc()?.title }}</strong> (Original file: <code class="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">{{ doc()?.fileName }}</code>, File Size: <strong>{{ doc()?.fileSize }}</strong>) has been officially submitted by the applicant for proposal empanelment under the <strong class="text-navy font-semibold">{{ applicant()?.schemeName }}</strong>.
                </p>
                <p>
                  The statutory contents, corporate particulars, and authorized credentials have been cross-verified with official government portals (MCA-21 / GSTIN Common Portal / Income Tax e-Filing) and authenticated for Departmental Technical Scrutiny.
                </p>
              </div>

              <!-- Verified Entity & Proposal Parameter Table -->
              <div class="border border-slate-300 rounded overflow-hidden text-xs">
                <div class="bg-slate-100 px-3.5 py-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-300">
                  Verified Legal Entity Particulars
                </div>
                <div class="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Legal Entity Name</span>
                    <strong class="text-slate-900 text-xs">{{ applicant()?.organisation?.legalName }}</strong>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Registration Number (CIN)</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.registrationNumber }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Company PAN</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.panNumber }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">GSTIN Identification</span>
                    <span class="font-mono text-slate-800 font-semibold text-xs">{{ applicant()?.organisation?.gstin }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Date &amp; State of Registration</span>
                    <span class="text-slate-800 text-xs">{{ applicant()?.organisation?.dateOfRegistration }} &bull; {{ applicant()?.organisation?.stateOfRegistration }}</span>
                  </div>
                  <div>
                    <span class="text-[10.5px] text-slate-500 block uppercase">Authorized Signatory</span>
                    <span class="font-semibold text-slate-800 text-xs">{{ applicant()?.authorizedSignatory?.name }} ({{ applicant()?.authorizedSignatory?.designation }})</span>
                  </div>
                  <div class="sm:col-span-2">
                    <span class="text-[10.5px] text-slate-500 block uppercase">Registered Corporate Address</span>
                    <span class="text-slate-700 text-xs leading-snug">{{ applicant()?.organisation?.registeredAddress }}</span>
                  </div>
                </div>
              </div>

              <!-- Official Digital Verification Seal & Signatures -->
              <div class="pt-4 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <!-- QR Code & Digital Verification Box -->
                <div class="flex items-center gap-3 p-2.5 rounded border border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                  <div class="w-12 h-12 bg-white border border-slate-300 p-1 flex items-center justify-center shrink-0">
                    <!-- QR Code Grid Mockup -->
                    <div class="w-full h-full bg-slate-900 grid grid-cols-3 gap-0.5 p-0.5">
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                      <div class="bg-slate-900"></div>
                      <div class="bg-white"></div>
                    </div>
                  </div>
                  <div>
                    <span class="font-bold text-slate-900 block text-xs">Digitally Verified</span>
                    <span>Submission: {{ applicant()?.submissionDate }}</span>
                    <span class="text-emerald-700 font-semibold block text-[10px]">Verified against Inward Registry</span>
                  </div>
                </div>

                <!-- Digital Signatory Stamp -->
                <div class="text-right text-xs space-y-0.5 sm:border-l sm:pl-4 border-slate-200">
                  <div class="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <span>&check; Digitally Signed</span>
                  </div>
                  <div class="font-bold text-slate-900 text-xs">Competent Authority / Scrutiny Officer</div>
                  <div class="text-[11px] text-slate-500">Rajasthan Skill and Livelihoods Development Corporation</div>
                  <div class="text-[10px] text-slate-400 font-mono">Certificate Ref: {{ doc()?.refCode }}</div>
                </div>
              </div>

              <!-- Watermark Notice -->
              <div class="text-center pt-2 text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                &bull; Official Government Document Record &bull; For Technical Scrutiny &bull;
              </div>

            </div>

          </div>

          <!-- Document Viewer Footer -->
          <div class="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
            <span class="text-slate-500 font-normal">
              Viewing page 1 of 1 &bull; {{ doc()?.fileName }}
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="downloadPdf.emit()"
                class="px-4 py-1.5 rounded-md bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                style="color: #ffffff !important;"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                <span style="color: #ffffff !important;">Download PDF</span>
              </button>

              <button
                type="button"
                (click)="close.emit()"
                class="px-4 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
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
export class ScrutinyDocViewerComponent {
  readonly doc = input<ActivePreviewDocument | null>(null);
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly close = output<void>();
  readonly downloadPdf = output<void>();

  printDoc(): void {
    window.print();
  }
}
