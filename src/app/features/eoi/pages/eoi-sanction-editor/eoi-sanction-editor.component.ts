import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, ApplicantResponse, Scheme } from '../../services/eoi-state.service';
import { PageHeaderComponent } from '../../../../shared';

export interface SanctionTableRow {
  id: string;
  appId: string;
  agencyName: string;
  district: string;
  sector: string;
  category: string;
  grade: string;
  target: number;
}

@Component({
  selector: 'app-eoi-sanction-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans pb-12 print:bg-white print:p-0 print:pb-0">
      
      <!-- Top Header & Action Bar (Hidden during Print) -->
      <div class="p-4 sm:p-5 print:hidden space-y-4 max-w-5xl mx-auto font-sans">
        <app-page-header
          title="Editable Sanction Order PDF Editor"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'EOI Responses', url: '/admin/eoi-view' },
            { label: 'Applicant Submissions', url: '/admin/responses/' + schemeId() },
            { label: 'Sanction Order PDF Editor' }
          ]"
          [backUrl]="'/admin/responses/' + schemeId()"
          backTitle="Back to Applicant Submissions"
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="saveDraftAndNotify()"
              class="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ isSubmitted() ? '✓ Submitted' : 'Auto-Save &amp; Finalize' }}</span>
            </button>

            <button
              type="button"
              (click)="printPdf()"
              class="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Export PDF</span>
            </button>
          </div>
        </app-page-header>

        <!-- Notification Banner -->
        @if (savedNotification()) {
          <div class="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
            <span class="font-semibold flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Sanction Order Submitted &amp; Saved Successfully! Redirecting to EOI Responses...
            </span>
            <span class="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Submitted</span>
          </div>
        } @else {
          <div class="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
            <span>&check; <strong>Live PDF Editor Mode (sanctionorder2.pdf format):</strong> Click any text, date, reference number, allocated target row, or clause below to edit directly before saving or exporting.</span>
            <span class="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">RSLDC Official Letterhead Format</span>
          </div>
        }
      </div>

      <!-- EDITABLE SANCTION ORDER DOCUMENT / PDF INTERFACE -->
      <div class="sanction-pdf-container max-w-4xl mx-auto bg-white p-6 sm:p-10 print:p-0 print:max-w-none text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-md rounded-sm print:border-none print:shadow-none">
        
        <!-- Header with Official Logos & Government Title -->
        <div class="border-b-2 border-slate-800 pb-3 mb-4 text-center font-sans">
          <div class="flex items-center justify-between gap-4 mb-2">
            <!-- Left Emblem Logo (Editable & Uploadable) -->
            <div class="relative group w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
              <img [src]="leftLogoUrl()" alt="Emblem Logo" class="max-w-full max-h-full object-contain" (error)="onLeftLogoError()" />
              <label class="absolute inset-0 bg-slate-900/75 text-white text-[10px] font-sans font-semibold flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded print:hidden">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change Logo</span>
                <input type="file" accept="image/*" class="hidden" (change)="onLeftLogoUpload($event)" />
              </label>
            </div>

            <!-- Header Titles (Editable) -->
            <div class="flex-1 space-y-1">
              <input
                type="text"
                [(ngModel)]="headerTitle"
                class="w-full text-center font-bold text-slate-900 text-base sm:text-lg uppercase bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
              <input
                type="text"
                [(ngModel)]="headerSubtitle"
                class="w-full text-center font-medium text-slate-700 text-xs bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
              <input
                type="text"
                [(ngModel)]="headerAddress"
                class="w-full text-center text-[11px] text-slate-600 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none px-1"
              />
            </div>

            <!-- Right Organization Logo (Editable & Uploadable) -->
            <div class="relative group w-20 h-20 shrink-0 flex items-center justify-center p-1 bg-transparent">
              @if (rightLogoUrl()) {
                <img [src]="rightLogoUrl()" alt="Right Logo" class="max-w-full max-h-full object-contain" />
              } @else {
                <div class="text-center font-bold text-[#0B3558] leading-tight text-[11px] font-sans px-1">
                  RSLDC<br>JAIPUR
                </div>
              }
              <label class="absolute inset-0 bg-slate-900/75 text-white text-[10px] font-sans font-semibold flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded print:hidden">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Change Logo</span>
                <input type="file" accept="image/*" class="hidden" (change)="onRightLogoUpload($event)" />
              </label>
            </div>
          </div>
        </div>

        <!-- File No & Date (Editable) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-sans text-xs font-semibold mb-4 border-b border-slate-200 pb-2">
          <div class="flex items-center gap-1.5 w-full sm:w-auto">
            <span class="text-slate-600 shrink-0">File No:</span>
            <input
              type="text"
              [(ngModel)]="fileNo"
              class="w-full sm:w-96 font-mono text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none px-1 text-xs"
            />
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span class="text-slate-600">Date:</span>
            <input
              type="text"
              [(ngModel)]="sanctionDate"
              class="w-32 text-right font-mono text-slate-900 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none px-1 text-xs"
            />
          </div>
        </div>

        <!-- Document Main Heading -->
        <div class="text-center my-3">
          <input
            type="text"
            [(ngModel)]="documentTitle"
            class="w-full text-center font-bold text-slate-900 text-base tracking-wide uppercase bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none underline"
          />
        </div>

        <!-- Subject & Reference Section (Editable) -->
        <div class="space-y-2 mb-4 font-sans text-xs">
          <div class="flex items-start gap-2">
            <span class="font-bold text-slate-900 shrink-0">Subject:</span>
            <textarea
              [(ngModel)]="subjectText"
              rows="2"
              class="w-full font-medium text-slate-800 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded resize-y"
            ></textarea>
          </div>

          <div class="flex items-start gap-2">
            <span class="font-bold text-slate-900 shrink-0">Ref:</span>
            <textarea
              [(ngModel)]="referenceText"
              rows="1"
              class="w-full text-slate-700 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded"
            ></textarea>
          </div>
        </div>

        <!-- Preamble Paragraph (Editable) -->
        <div class="mb-4 text-justify">
          <textarea
            [(ngModel)]="preambleText"
            rows="3"
            class="w-full text-slate-800 bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs sm:text-sm leading-relaxed rounded resize-y font-serif"
          ></textarea>
        </div>

        <!-- ALLOCATED PHYSICAL TARGETS TABLE (Editable) -->
        <div class="my-6">
          <div class="flex items-center justify-between mb-2 font-sans">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-tight">
              Allocated Physical Targets Table (Approved PIAs &amp; Agencies):
            </h4>
            <button
              type="button"
              (click)="addRow()"
              class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-sans font-medium cursor-pointer flex items-center gap-1 print:hidden"
            >
              <span>+ Add Row</span>
            </button>
          </div>

          <div class="w-full">
            <table class="w-full text-left border-collapse font-sans text-[10.5px] sm:text-[11px] table-fixed">
              <thead>
                <tr class="bg-slate-100 text-slate-900 border border-slate-800 font-bold text-center">
                  <th class="p-1 border border-slate-800 w-[5%]">Sr. No</th>
                  <th class="p-1 border border-slate-800 w-[13%]">Application ID</th>
                  <th class="p-1 border border-slate-800 w-[21%]">Name Of the Agency/PIA</th>
                  <th class="p-1 border border-slate-800 w-[12%]">Sanction District</th>
                  <th class="p-1 border border-slate-800 w-[16%]">Sanction Sector(s)</th>
                  <th class="p-1 border border-slate-800 w-[13%]">Application Category</th>
                  <th class="p-1 border border-slate-800 w-[5%]">Grade</th>
                  <th class="p-1 border border-slate-800 w-[9%]">Sanction Target</th>
                  <th class="p-1 border border-slate-800 w-[6%] print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (row of tableRows; track row.id; let i = $index) {
                  <tr class="border border-slate-800 hover:bg-slate-50 transition-colors">
                    <td class="border border-slate-800 p-0.5 text-center font-bold">
                      {{ i + 1 }}
                    </td>
                    <td class="border border-slate-800 p-0.5">
                      <input
                        type="text"
                        [(ngModel)]="row.appId"
                        class="w-full font-mono text-center bg-transparent border-none focus:outline-none text-[10px] leading-tight"
                      />
                    </td>
                    <td class="border border-slate-800 p-0.5">
                      <input
                        type="text"
                        [(ngModel)]="row.agencyName"
                        class="w-full font-medium bg-transparent border-none focus:outline-none px-0.5 text-[11px] truncate"
                      />
                    </td>
                    <td class="border border-slate-800 p-0.5">
                      <select
                        [(ngModel)]="row.district"
                        class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-[10.5px] p-0 font-sans truncate"
                      >
                        @for (dist of availableDistricts; track dist) {
                          <option [value]="dist">{{ dist }}</option>
                        }
                      </select>
                    </td>
                    <td class="border border-slate-800 p-0.5">
                      <select
                        [(ngModel)]="row.sector"
                        class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-[10.5px] p-0 font-sans truncate"
                      >
                        @for (sec of availableSectors; track sec) {
                          <option [value]="sec">{{ sec }}</option>
                        }
                      </select>
                    </td>
                    <td class="border border-slate-800 p-0.5 text-center">
                      <input
                        type="text"
                        [(ngModel)]="row.category"
                        class="w-full text-center bg-transparent border-none focus:outline-none text-[10.5px]"
                      />
                    </td>
                    <td class="border border-slate-800 p-0.5 text-center font-bold">
                      <input
                        type="text"
                        [(ngModel)]="row.grade"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none text-[11px]"
                      />
                    </td>
                    <td class="border border-slate-800 p-0.5 text-center">
                      <input
                        type="number"
                        [(ngModel)]="row.target"
                        class="w-full text-center font-bold bg-transparent border-none focus:outline-none text-[11px]"
                      />
                    </td>
                    <td class="border border-slate-800 p-0.5 text-center print:hidden">
                      <button
                        type="button"
                        (click)="removeRow(i)"
                        class="text-rose-600 hover:text-rose-800 text-xs font-bold px-0.5"
                        title="Delete Row"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- TERMS AND CONDITIONS SECTION (Editable points from sanctionorder2.pdf) -->
        <div class="mt-6 mb-4 font-sans text-xs">
          <p class="font-bold text-slate-900 mb-2">
            The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):
          </p>
          <ol class="list-decimal pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs">
            @for (clause of termsAndConditions; track i; let i = $index) {
              <li class="group flex items-start gap-2">
                <span class="font-semibold shrink-0 text-slate-700">{{ i + 1 }}.</span>
                <textarea
                  [(ngModel)]="termsAndConditions[i]"
                  rows="2"
                  class="w-full bg-transparent border border-dashed border-transparent hover:border-slate-300 focus:border-slate-800 focus:outline-none p-1 text-xs rounded leading-relaxed resize-y font-serif"
                ></textarea>
                <button
                  type="button"
                  (click)="removeClause(i)"
                  class="opacity-0 group-hover:opacity-100 text-rose-600 hover:text-rose-800 text-xs font-bold px-1 print:hidden shrink-0 mt-1"
                  title="Remove Clause"
                >
                  &times;
                </button>
              </li>
            }
          </ol>

          <div class="mt-3 print:hidden">
            <button
              type="button"
              (click)="addClause()"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-sans cursor-pointer flex items-center gap-1"
            >
              <span>+ Add Terms &amp; Conditions Clause</span>
            </button>
          </div>
        </div>

        <!-- DISPATCH & SIGNATORY BLOCK (Editable) -->
        <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs border-t border-slate-300">
          <div>
            <p class="font-bold text-slate-800">Dispatch Reference:</p>
            <input
              type="text"
              [(ngModel)]="dispatchRef"
              class="font-mono text-[11px] text-slate-700 bg-transparent border-b border-dashed border-slate-300 hover:border-slate-500 focus:border-slate-800 focus:outline-none w-64 block"
            />
          </div>

          <div class="text-right space-y-1">
            <div class="flex flex-col items-end">
              <input
                type="text"
                [(ngModel)]="signatoryName"
                class="text-right font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
              />
              <input
                type="text"
                [(ngModel)]="signatoryTitle"
                class="text-right font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 text-xs"
              />
              <input
                type="text"
                [(ngModel)]="signatoryOrg"
                class="text-right text-slate-500 text-[10px] bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48"
              />
            </div>
          </div>
        </div>

        <!-- COPY TO DISTRIBUTION LIST (Editable) -->
        <div class="mt-6 pt-4 border-t border-slate-300 font-sans text-xs">
          <p class="font-bold text-slate-800 mb-1.5">Copy to:</p>
          <ol class="list-decimal pl-5 space-y-1 text-slate-700 text-[11px]">
            @for (item of copyToList; track i; let i = $index) {
              <li class="group flex items-center gap-2">
                <input
                  type="text"
                  [(ngModel)]="copyToList[i]"
                  class="w-full bg-transparent border-b border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none px-1 text-[11px]"
                />
              </li>
            }
          </ol>
        </div>

      </div>

      <!-- Bottom Action Bar -->
      <div class="mt-8 max-w-4xl mx-auto flex items-center justify-between gap-4 font-sans print:hidden">
        <button
          type="button"
          (click)="saveDraftAndNotify()"
          class="px-5 py-2 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow transition-colors cursor-pointer flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ isSubmitted() ? '✓ Submitted' : 'Submit &amp; Save Sanction Order' }}</span>
        </button>

        <button
          type="button"
          (click)="printPdf()"
          class="px-4 py-2 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium shadow transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print Document</span>
        </button>
      </div>

    </div>
  `
})
export class EoiSanctionEditorComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  schemeId = signal<string>('');
  currentScheme = signal<Scheme | undefined>(undefined);
  savedNotification = signal<boolean>(false);
  isSubmitted = computed(() => this.savedNotification() || this.eoiStateService.isSanctionSubmitted(this.schemeId()));

  // Logo state and SVG fallbacks (Border-free emblem logo)
  defaultEmblemSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 16 L54 28 L67 28 L56 36 L60 48 L50 40 L40 48 L44 36 L33 28 L46 28 Z" fill="%230b3558"/><path d="M25 65 Q50 55 75 65 Q50 72 25 65 Z" fill="%23b91c1c"/><text x="50" y="83" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230b3558">GOVT OF RAJASTHAN</text></svg>`;
  leftLogoUrl = signal<string>('https://upload.wikimedia.org/wikipedia/commons/8/84/Government_of_Rajasthan_Logo.svg');
  rightLogoUrl = signal<string>('');
  rightLogoText = 'RSLDC\nJAIPUR';

  // Editable Document Fields matching sanctionorder2.pdf
  headerTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  headerSubtitle = '(A Government of Rajasthan Enterprise)';
  headerAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur - 302004 (Rajasthan)';

  fileNo = 'F () RSLDC/Skills/MMKVY/RAJKViK/SO/2026-2027/ 1358';
  sanctionDate = '30/07/2026';

  documentTitle = 'Sanction Order';
  subjectText = 'Sanction order for allocation of physical targets for Financial Year 2026-27 to PIAs under "Mukhya Mantri Kaushal Vikas Yojna" (MMKVY), Cat: I - RAJKViK.';
  referenceText = 'No. RSLDC/EOI/MMKVY, Cat. I, II, III /2026-27/01, dated 22nd January 2026.';
  preambleText = 'Based on the approved selection criteria of PIA\'s, Sanction Order is accorded to the following empanelled eligible PIAs for FY 2026-27 along with allocation of physical targets under Mukhya Mantri Kaushal Vikas Yojna" (MMKVY), Category. I- RAJKViK as per the details given below:';

  dispatchRef = 'RSLDC/Skills/MMKVY/RAJKViK/SO/2026-2027/1359-66';
  signatoryName = 'RISHAV MANDAL';
  signatoryTitle = 'Managing Director';
  signatoryOrg = 'RSLDC, Jaipur (GoR)';

  readonly availableDistricts: string[] = [
    'Jaipur', 'Jodhpur', 'Udaipur', 'Alwar', 'Kota', 'Sikar', 'Ajmer', 'Bhilwara', 'Beawar', 'Chittorgarh'
  ];

  readonly availableSectors: string[] = [
    'Apparel, Agriculture', 'Media & Entertainment, IT-ITeS', 'Healthcare, Life Sciences', 'Electronics, Beauty & Wellness', 'Textile & Handloom'
  ];

  tableRows: SanctionTableRow[] = [];

  termsAndConditions: string[] = [
    'PIA shall be allowed to conduct training in any one of the given two sectors or in both sectors, but PIA cannot exceed the ceiling given as above.',
    'PIA Shall be allowed to conduct residential training of 45 candidates only against the sanctioned target of 150, and 30 candidates only against the sanctioned target of 105.',
    'PIA shall ensure that only job roles with a duration of 1060 hours or less are selected. Job roles exceeding 1060 hours shall not be allotted under any case.',
    'All PIAs are required to sign the MoU within 10 (ten) working days from the date of issuance of this Sanction Order, failing which the sanction may be liable for cancellation.',
    'PIA will submit a Demand Draft (DD) of Rs. 10,000/- (Ten thousand) issued in the favor of Managing Director, Rajasthan Skill and Livelihoods Development Corporation (RSLDC) at the time of MoU signing.',
    'The PIA shall comply to Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK guidelines applicable from 01 April 2021 (as amended from time to time or revised guideline), branding guidelines and office orders, circulars & directions issued by RSLDC from time to time which can be downloaded from www.livelihoods.rajasthan.gov.in or may be taken from RSLDC, Jaipur office.',
    'PIA will enroll only targeted beneficiaries as mentioned in scheme guidelines, "Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK", and with reference to the course module.',
    'All PIAs will strictly comply the directives for the Aadhaar enabled Biometric Attendance System (AEBAS) for using the newly developed AEBAS process for marking the attendance of SDCs daily on the ISMS portal (Ref. No. : RSLDC/MIS/AEBAS/2024-25/18796-01 dated 03.12.2024) and the IP Camera Monitoring System (Kaushal Darpan) Order no: DSEE/RSLDC/MD/2024-25/153 dated 21.10.2024 and other orders issued by RSLDC time to time.',
    'The following are mandatory for the issuance of In-Principle Approval (IPA) from RSLDC (per batch):- Installation of IP camera-based face recognition system in classrooms and domain labs of SDC.',
    'To install IRIS / latest version of Aadhar Enabled Biometric Attendance System (AEBAS) for daily attendance (in & out) at the SDC and Hostel, as applicable, which has to be integrated with ISMS system of RSLDC.',
    'Mandatory Use of Masked Aadhaar: In compliance with UIDAI Regulations 2021, it is mandatory for all TPs to use masked Aadhaar displaying only the last four digits in all official documentation.'
  ];

  copyToList: string[] = [
    'PS to Hon\'ble Minister, DSEE, GoR',
    'PS to ACS, DSEE, GoR',
    'PS to Managing Director, RSLDC',
    'CAO, RSLDC',
    'GM-I (Admin.)',
    'OIC-MIS to upload on RSLDC website',
    'PM, PMCA',
    'Respective (Project Implementing Agencies) via mail',
    'File Copy'
  ];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.schemeId.set(sId);
      this.loadSchemeDetails(sId);
    });
  }

  private loadSchemeDetails(sId: string): void {
    this.eoiStateService.getSchemeById(sId).subscribe(scheme => {
      if (scheme) {
        this.currentScheme.set(scheme);
        this.subjectText = `Sanction order for allocation of physical targets for Financial Year 2026-27 to PIAs under "${scheme.schemeTitle}".`;
      }
    });

    this.eoiStateService.getResponses(sId).subscribe(responses => {
      const approved = responses.filter(r => r.status === 'APPROVED');
      if (approved.length > 0) {
        this.tableRows = approved.map((resp, idx) => ({
          id: resp.id,
          appId: resp.id,
          agencyName: resp.actualLegalName || resp.anonymousLabel,
          district: resp.trainingCentres?.[0]?.district || this.availableDistricts[idx % this.availableDistricts.length],
          sector: resp.placementTrackRecord?.[0]?.sector || this.availableSectors[idx % this.availableSectors.length],
          category: 'A-1 (Skill)',
          grade: resp.scrutinyDetails?.grade === 'Grade A' ? 'A' : (resp.scrutinyDetails?.grade === 'Grade B' ? 'B' : 'A'),
          target: 150
        }));
      } else {
        // Fallback sample target rows from sanctionorder2.pdf
        this.tableRows = [
          { id: '1', appId: 'APP-004752', agencyName: 'Aariya Enterprises', district: 'Jaipur', sector: 'Apparel, Agriculture', category: 'A-1 (Skill)', grade: 'A', target: 150 },
          { id: '2', appId: 'APP-003003', agencyName: 'Aayushi Contractors Company', district: 'Jodhpur', sector: 'Media & Entertainment, IT-ITeS', category: 'A-2', grade: 'B', target: 150 },
          { id: '3', appId: 'APP-003773', agencyName: 'All India Computer Saksharta Mission', district: 'Kota', sector: 'Healthcare, Life Sciences', category: 'A-1 (Skill)', grade: 'A', target: 150 }
        ];
      }
    });
  }

  addRow(): void {
    const newId = (this.tableRows.length + 1).toString();
    this.tableRows.push({
      id: newId,
      appId: `APP-00${4750 + this.tableRows.length}`,
      agencyName: `Agency ${this.tableRows.length + 1}`,
      district: 'Jaipur',
      sector: 'Healthcare, Life Sciences',
      category: 'A-1 (Skill)',
      grade: 'A',
      target: 150
    });
  }

  removeRow(index: number): void {
    if (this.tableRows.length > 1) {
      this.tableRows.splice(index, 1);
    }
  }

  addClause(): void {
    this.termsAndConditions.push('New terms and conditions clause inserted by administrator.');
  }

  removeClause(index: number): void {
    if (this.termsAndConditions.length > 1) {
      this.termsAndConditions.splice(index, 1);
    }
  }

  onLeftLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.leftLogoUrl.set(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onRightLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.rightLogoUrl.set(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onLeftLogoError(): void {
    this.leftLogoUrl.set(this.defaultEmblemSvg);
  }

  saveDraftAndNotify(): void {
    const sId = this.schemeId();
    if (sId) {
      this.eoiStateService.markSanctionSubmitted(sId);
    }
    this.savedNotification.set(true);
    setTimeout(() => {
      this.savedNotification.set(false);
      this.router.navigate(['/admin/eoi-view']);
    }, 1200);
  }

  printPdf(): void {
    window.print();
  }
}
