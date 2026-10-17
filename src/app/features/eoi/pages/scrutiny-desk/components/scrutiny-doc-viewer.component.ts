import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, ModalComponent } from '../../../../../shared';
import type { ApplicantResponse } from '../../../services/eoi-state.service';
import type { ActivePreviewDocument } from '../scrutiny-desk.util';

/** Document / PDF viewer modal (header actions, verification strip, paper body, footer). */
@Component({
  selector: 'app-scrutiny-doc-viewer',
  standalone: true,
  imports: [ButtonComponent, IconComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (doc()) {
      <app-modal [title]="doc()?.title ?? ''" [subtitle]="subtitle()" size="xl" (close)="close.emit()">
          <!-- Document Verification Strip -->
          <div class="px-5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 shrink-0 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="font-medium text-slate-800">Document Registry Record:</span>
              <span class="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                RECORD &bull; {{ doc()?.refCode }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[11px] text-slate-500">
              <span>Authority: <strong>Govt of Rajasthan / RSLDC</strong></span>
              <span>&bull;</span>
              <span>Status: <strong>Submitted</strong></span>
            </div>
          </div>

          <!-- Document Canvas / Reader Body (Scrollable Authentic Paper Certificate) -->
          <div class="bg-slate-200/80 p-4 sm:p-6 lg:p-8 flex justify-center">

            <!-- Authentic A4 Paper Sheet -->
            <div class="max-w-190 w-full bg-white shadow-2xl rounded-sm border border-slate-300 p-6 sm:p-10 font-sans text-slate-800 space-y-6 relative" id="printCertificateArea">

              <!-- Official Document Header with Ashok Emblem & State Heading -->
              <div class="text-center pb-4 border-b-2 border-slate-800 space-y-1">
                <!-- Ashok Emblem SVG -->
                <div class="w-10 h-10 mx-auto text-navy mb-1">
                  <app-icon name="emblem-star" size="auto" solid class="w-full h-full" />
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
                  The statutory contents, corporate particulars, and authorized credentials have been recorded from official application submission for Departmental Technical Scrutiny.
                </p>
              </div>

              <!-- Entity & Proposal Parameter Table -->
              <div class="border border-slate-300 rounded overflow-hidden text-xs">
                <div class="bg-slate-100 px-3.5 py-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider border-b border-slate-300">
                  Legal Entity Particulars
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
                    <span class="font-bold text-slate-900 block text-xs">Digitally Submitted</span>
                    <span>Submission: {{ applicant()?.submissionDate }}</span>
                    <span class="text-slate-600 font-medium block text-[10px]">Recorded in Inward Registry</span>
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

          <ng-container modalFooter>
            <span class="mr-auto text-xs text-slate-500 font-normal">
              Viewing page 1 of 1 &bull; {{ doc()?.fileName }}
            </span>

            <!-- Print Document Button -->
            <button appButton variant="outline" (click)="printDoc()" title="Print Document">
              <app-icon name="print-simple" size="sm" [stroke]="2" />
              <span class="hidden sm:inline">Print</span>
            </button>

            <button appButton (click)="downloadPdf.emit()">
              <app-icon name="download" size="sm" />
              <span>Download PDF</span>
            </button>

            <button appButton variant="outline" (click)="close.emit()">Close</button>
          </ng-container>
      </app-modal>
    }
  `
})
export class ScrutinyDocViewerComponent {
  readonly doc = input<ActivePreviewDocument | null>(null);
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly close = output<void>();
  readonly downloadPdf = output<void>();

  protected readonly subtitle = computed(
    () => `${this.doc()?.fileName} \u2022 ${this.doc()?.fileSize} \u2022 Issued for: ${this.applicant()?.anonymousLabel}`
  );

  printDoc(): void {
    window.print();
  }
}
