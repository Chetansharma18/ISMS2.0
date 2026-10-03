import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, ApplicantResponse } from '../../services/eoi-state.service';
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
  selector: 'app-sanction-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans pb-12 print:bg-white print:p-0 print:pb-0">
      
      <!-- Top Action Header Bar (Hidden during Print) -->
      <div class="p-4 sm:p-5 print:hidden space-y-4 max-w-5xl mx-auto font-sans">
        <app-page-header
          title="Sanction Order Document Editor"
          [breadcrumbs]="[
            { label: 'Home', url: '/' },
            { label: 'EOI Responses', url: '/admin/eoi-view' },
            { label: 'Applicant Submissions', url: '/admin/responses' },
            { label: 'Sanction Order Editor' }
          ]"
          backUrl="/admin/responses"
          backTitle="Back to Applicant Submissions"
        >
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="printSanctionOrder()"
              class="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / Export PDF</span>
            </button>
          </div>
        </app-page-header>

        <!-- Banner Info -->
        <div class="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
          <span>&check; <strong>Live Document Editor Mode:</strong> Edit text, dates, reference numbers, table rows, and clauses directly below before saving or printing.</span>
          <span class="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">PDF Standard RSLDC Letterhead</span>
        </div>
      </div>

      <!-- OFFICIAL SANCTION ORDER LETTERHEAD CONTAINER -->
      <div class="sanction-document-page max-w-4xl mx-auto bg-white p-6 sm:p-10 print:p-0 print:max-w-none text-[#111827] font-serif leading-relaxed text-sm">
        
        <!-- Document Header with Official Logos -->
        <div class="border-b-2 border-slate-800 pb-3 mb-4">
          <div class="flex items-center justify-between gap-4 mb-2">
            <!-- Left Logo Container (PNG Uploadable) -->
            <div class="relative group flex flex-col items-center justify-center w-24 shrink-0">
              <input
                #leftFileInput
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                (change)="onLeftLogoUpload($event)"
                class="hidden"
              />

              <div
                (click)="leftFileInput.click()"
                class="relative w-16 h-16 flex items-center justify-center p-0.5 text-center overflow-hidden cursor-pointer"
                title="Click to Upload Left PNG Logo"
              >
                @if (leftLogoUrl()) {
                  <img [src]="leftLogoUrl()" alt="Left Logo" class="w-full h-full object-contain" />
                } @else {
                  <span class="text-[9px] font-sans font-bold leading-tight uppercase text-slate-800">RSLDC RAJASTHAN</span>
                }

                <!-- Hover overlay edit icon (hidden during print) -->
                <div class="absolute inset-0 bg-slate-900/65 text-white flex items-center justify-center text-[9px] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-center px-1 rounded-full">
                  Upload PNG
                </div>
              </div>

              <div class="mt-1 flex items-center gap-1.5 print:hidden">
                <button
                  type="button"
                  (click)="leftFileInput.click()"
                  class="text-[10px] text-sky-700 hover:text-sky-900 font-medium underline font-sans cursor-pointer"
                >
                  Replace Logo
                </button>
                @if (leftLogoUrl()) {
                  <button
                    type="button"
                    (click)="removeLeftLogo()"
                    class="text-[10px] text-rose-600 hover:text-rose-800 font-medium font-sans cursor-pointer"
                    title="Reset to default logo"
                  >
                    Reset
                  </button>
                }
              </div>
            </div>

            <!-- Header Center Text (Editable) -->
            <div class="text-center flex-1 px-2">
              <input
                type="text"
                [(ngModel)]="headerTitle"
                class="w-full text-center font-bold text-lg sm:text-xl text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none py-0.5"
              />
              <input
                type="text"
                [(ngModel)]="headerSubtitle"
                class="w-full text-center text-xs italic text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none py-0.5"
              />
              <input
                type="text"
                [(ngModel)]="headerAddress"
                class="w-full text-center text-[11px] font-sans text-slate-600 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none py-0.5"
              />
            </div>

            <!-- Right Emblem Logo (PNG Uploadable) -->
            <div class="relative group flex flex-col items-center justify-center w-24 shrink-0">
              <input
                #rightFileInput
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                (change)="onRightLogoUpload($event)"
                class="hidden"
              />

              <div
                (click)="rightFileInput.click()"
                class="relative w-16 h-16 flex items-center justify-center p-0.5 text-center overflow-hidden cursor-pointer"
                title="Click to Upload Right PNG Logo"
              >
                @if (rightLogoUrl()) {
                  <img [src]="rightLogoUrl()" alt="Right Logo" class="w-full h-full object-contain" />
                } @else {
                  <span class="text-[10px] font-sans font-medium text-slate-600">CENSUS 2027</span>
                }

                <!-- Hover overlay edit icon (hidden during print) -->
                <div class="absolute inset-0 bg-slate-900/65 text-white flex items-center justify-center text-[9px] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity print:hidden text-center px-1 rounded-full">
                  Upload PNG
                </div>
              </div>

              <div class="mt-1 flex items-center gap-1.5 print:hidden">
                <button
                  type="button"
                  (click)="rightFileInput.click()"
                  class="text-[10px] text-sky-700 hover:text-sky-900 font-medium underline font-sans cursor-pointer"
                >
                  Replace Logo
                </button>
                @if (rightLogoUrl()) {
                  <button
                    type="button"
                    (click)="removeRightLogo()"
                    class="text-[10px] text-rose-600 hover:text-rose-800 font-medium font-sans cursor-pointer"
                    title="Reset to default logo"
                  >
                    Reset
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- File Reference Line & Auto-fetched Date Line -->
        <div class="flex items-center justify-between gap-4 font-sans text-xs mb-4">
          <div class="flex items-center gap-1 flex-1">
            <span class="font-bold whitespace-nowrap">File No:</span>
            <input
              type="text"
              [(ngModel)]="fileNo"
              class="w-full font-mono text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none px-1"
            />
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span class="font-bold whitespace-nowrap">Date:</span>
            <input
              type="text"
              [(ngModel)]="sanctionDate"
              class="w-32 font-mono text-xs bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none px-1 text-right"
            />
          </div>
        </div>

        <!-- Sanction Order Document Heading -->
        <div class="text-center my-4">
          <input
            type="text"
            [(ngModel)]="documentTitle"
            class="text-center font-bold text-base sm:text-lg underline tracking-wide bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none w-full"
          />
        </div>

        <!-- Subject Line -->
        <div class="mb-3 font-sans text-xs sm:text-sm">
          <div class="flex items-start gap-1">
            <span class="font-bold whitespace-nowrap">Subject:</span>
            <textarea
              rows="2"
              [(ngModel)]="subjectText"
              class="w-full font-medium italic bg-transparent border border-dashed border-slate-300 focus:border-slate-800 focus:outline-none p-1 rounded text-xs leading-snug"
            ></textarea>
          </div>
        </div>

        <!-- Reference Line -->
        <div class="mb-4 font-sans text-xs">
          <div class="flex items-start gap-1">
            <span class="font-bold whitespace-nowrap">Ref:</span>
            <textarea
              rows="1"
              [(ngModel)]="referenceText"
              class="w-full font-normal italic text-slate-700 bg-transparent border border-dashed border-slate-300 focus:border-slate-800 focus:outline-none p-1 rounded text-xs"
            ></textarea>
          </div>
        </div>

        <!-- Opening Preamble Paragraph -->
        <div class="mb-4 text-xs leading-relaxed">
          <textarea
            rows="3"
            [(ngModel)]="preambleText"
            class="w-full font-normal bg-transparent border border-dashed border-slate-300 focus:border-slate-800 focus:outline-none p-1.5 rounded text-xs text-justify"
          ></textarea>
        </div>

        <!-- SANCTION ORDER TARGET TABLE (With District and Sector Dropdowns) -->
        <div class="my-5 overflow-x-auto">
          <div class="flex items-center justify-between mb-1.5 print:hidden">
            <span class="text-xs font-sans font-bold text-slate-800">Allocated Physical Targets Table:</span>
            <button
              type="button"
              (click)="addRow()"
              class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-sans cursor-pointer flex items-center gap-1"
            >
              <span>+ Add Row</span>
            </button>
          </div>

          <table class="w-full border-collapse border border-slate-800 text-xs font-sans">
            <thead>
              <tr class="bg-slate-100 text-slate-900 font-bold border-b border-slate-800 text-center text-[11px]">
                <th class="border border-slate-800 p-1.5 w-10">Sr. No</th>
                <th class="border border-slate-800 p-1.5 w-24">Application ID</th>
                <th class="border border-slate-800 p-1.5 min-w-[140px]">Name Of the Agency/PIA</th>
                <th class="border border-slate-800 p-1.5 min-w-[120px]">Sanction District</th>
                <th class="border border-slate-800 p-1.5 min-w-[140px]">Sanction Sector(s)</th>
                <th class="border border-slate-800 p-1.5 w-24">Application Category</th>
                <th class="border border-slate-800 p-1.5 w-14">Grade</th>
                <th class="border border-slate-800 p-1.5 w-16">Sanction Target</th>
                <th class="border border-slate-800 p-1 w-10 print:hidden">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (row of tableRows; track row.id; let i = $index) {
                <tr class="hover:bg-slate-50/80 border-b border-slate-400 text-xs">
                  <!-- S. No -->
                  <td class="border border-slate-800 p-1.5 text-center font-bold">
                    {{ i + 1 }}
                  </td>

                  <!-- App ID (Auto-fetched / Editable) -->
                  <td class="border border-slate-800 p-1">
                    <input
                      type="text"
                      [(ngModel)]="row.appId"
                      class="w-full font-mono text-center bg-transparent border-none focus:outline-none text-[11px]"
                    />
                  </td>

                  <!-- Agency Name (Sample / Editable) -->
                  <td class="border border-slate-800 p-1">
                    <input
                      type="text"
                      [(ngModel)]="row.agencyName"
                      class="w-full font-medium bg-transparent border-none focus:outline-none px-1 text-xs"
                    />
                  </td>

                  <!-- Sanction District (DROPDOWN IN TABLE per user request) -->
                  <td class="border border-slate-800 p-1">
                    <select
                      [(ngModel)]="row.district"
                      class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-xs p-0.5 font-sans"
                    >
                      <option value="" disabled>-- Select District --</option>
                      @for (dist of availableDistricts; track dist) {
                        <option [value]="dist">{{ dist }}</option>
                      }
                    </select>
                  </td>

                  <!-- Sanction Sector(s) (DROPDOWN IN TABLE per user request) -->
                  <td class="border border-slate-800 p-1">
                    <select
                      [(ngModel)]="row.sector"
                      class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-xs p-0.5 font-sans"
                    >
                      <option value="" disabled>-- Select Sector --</option>
                      @for (sec of availableSectors; track sec) {
                        <option [value]="sec">{{ sec }}</option>
                      }
                    </select>
                  </td>

                  <!-- Category -->
                  <td class="border border-slate-800 p-1">
                    <select
                      [(ngModel)]="row.category"
                      class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-[11px] text-center"
                    >
                      <option value="A-1">A-1 (Skilling)</option>
                      <option value="A-2">A-2 (Non-Skilling)</option>
                      <option value="Cat-I">Category I</option>
                      <option value="Cat-II">Category II</option>
                    </select>
                  </td>

                  <!-- Grade -->
                  <td class="border border-slate-800 p-1 text-center">
                    <select
                      [(ngModel)]="row.grade"
                      class="w-full bg-transparent border-none focus:outline-none cursor-pointer text-xs font-bold text-center"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </td>

                  <!-- Sanction Target -->
                  <td class="border border-slate-800 p-1 text-center">
                    <input
                      type="number"
                      [(ngModel)]="row.target"
                      class="w-full text-center font-semibold bg-transparent border-none focus:outline-none text-xs"
                    />
                  </td>

                  <!-- Remove Row Action -->
                  <td class="border border-slate-800 p-1 text-center print:hidden">
                    <button
                      type="button"
                      (click)="removeRow(i)"
                      class="text-rose-600 hover:text-rose-800 text-xs font-bold px-1"
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

        <!-- Terms and Conditions Section (Fully Editable) -->
        <div class="mt-6 mb-4 font-sans text-xs">
          <p class="font-bold text-slate-900 mb-2">
            The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):
          </p>

          <ol class="list-decimal pl-5 space-y-2 text-slate-800 text-xs leading-normal">
            @for (clause of termsAndConditions; track i; let i = $index) {
              <li class="group relative">
                <div class="flex items-start gap-2">
                  <textarea
                    rows="2"
                    [(ngModel)]="termsAndConditions[i]"
                    class="w-full bg-transparent border border-dashed border-slate-200 hover:border-slate-400 focus:border-slate-800 focus:outline-none p-1 rounded text-xs text-justify font-sans"
                  ></textarea>
                  <button
                    type="button"
                    (click)="removeClause(i)"
                    class="text-rose-600 hover:text-rose-800 text-xs font-bold px-1 mt-1 print:hidden opacity-40 group-hover:opacity-100"
                    title="Remove Clause"
                  >
                    &times;
                  </button>
                </div>
              </li>
            }
          </ol>

          <div class="mt-2 print:hidden">
            <button
              type="button"
              (click)="addClause()"
              class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-sans cursor-pointer flex items-center gap-1"
            >
              <span>+ Add Terms &amp; Conditions Clause</span>
            </button>
          </div>
        </div>

        <!-- Official Signatory Block -->
        <div class="mt-8 pt-4 flex items-end justify-between font-sans text-xs">
          <div>
            <p class="font-bold text-slate-800">Dispatch Reference:</p>
            <p class="text-slate-600 font-mono text-[11px]">RSLDC/Skills/MMKVY/RAJKViK/SO/2026-2027/1359-66</p>
          </div>

          <div class="text-right space-y-1">
            <div class="h-10"></div> <!-- Signature gap -->
            <input
              type="text"
              [(ngModel)]="signatoryTitle"
              class="text-right font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 ml-auto text-xs"
            />
            <input
              type="text"
              [(ngModel)]="signatoryOrg"
              class="text-right font-medium text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-slate-800 focus:outline-none block w-48 ml-auto text-xs"
            />
          </div>
        </div>

        <!-- Copy To (Dispatch Distribution List) -->
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

        <!-- Official Digital Signature Stamp Footer Box -->
        <div class="mt-8 p-3 border border-slate-400 rounded bg-slate-50 flex items-center justify-between font-sans text-[11px] text-slate-700">
          <div>
            <p class="font-bold text-slate-900">Website: https://livelihoods.rajasthan.gov.in/rsldc</p>
            <p>E-mail: md.rsldc-rj&#64;gov.in &bull; Phone: 0141-2701174</p>
          </div>

          <div class="text-right border-l border-slate-300 pl-3">
            <div class="flex items-center gap-1 font-bold text-emerald-700">
              <span>&check; Digitally Signed</span>
            </div>
            <p class="font-medium text-slate-800">{{ signatoryName }}</p>
            <p class="text-[10px] text-slate-500">Managing Director &bull; Date: {{ sanctionDate }} 10:57:03 IST</p>
          </div>
        </div>

        <!-- Bottom Action Bar (Submit & Auto-Save) -->
        <div class="mt-10 pt-6 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans print:hidden">
          <div class="flex items-center gap-2 text-xs text-slate-600">
            @if (isSaved()) {
              <span class="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-300 font-medium">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Document Auto-Saved &amp; Submitted Successfully!
              </span>
            } @else {
              <span class="text-slate-600 font-normal">
                Click <strong>Submit &amp; Save Sanction Order</strong> to auto-save and finalize all document changes.
              </span>
            }
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              (click)="resetToDefaults()"
              class="flex-1 sm:flex-initial px-4 py-2.5 rounded bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs text-center"
            >
              Reset Draft
            </button>
            <button
              type="button"
              (click)="saveSanctionOrder()"
              class="flex-1 sm:flex-initial px-6 py-2.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Submit &amp; Save Sanction Order</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `
})
export class SanctionOrderComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Uploaded PNG Logo Signals
  leftLogoUrl = signal<string | null>(null);
  rightLogoUrl = signal<string | null>(null);

  // Auto-fetched header & reference details
  headerTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  headerSubtitle = '(A Government of Rajasthan Enterprise)';
  headerAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur- 302004 (Rajasthan)';

  fileNo = 'F () RSLDC/Skills/MMKVY/RAJKViK/SO/2026-2027/ 1358';
  sanctionDate = new Date().toLocaleDateString('en-GB');

  documentTitle = 'Sanction Order';
  subjectText = 'Sanction order for allocation of physical targets for Financial Year 2026-27 to PIAs under "Mukhya Mantri Kaushal Vikas Yojna" (MMKVY), Cat: I - RAJKViK.';
  referenceText = 'No. RSLDC/EOI/MMKVY, Cat. I, II, III /2026-27/01, dated 22nd January 2026.';

  preambleText = 'Based on the approved selection criteria of PIA\'s, Sanction Order is accorded to the following empanelled eligible PIAs for FY 2026-27 along with allocation of physical targets under Mukhya Mantri Kaushal Vikas Yojna" (MMKVY), Category. I- RAJKViK as per the details given below:';

  signatoryName = 'RISHAV MANDAL';
  signatoryTitle = 'Managing Director';
  signatoryOrg = '(RSLDC)';

  // Dropdown Options
  readonly availableDistricts: string[] = [
    'Jaipur',
    'Jodhpur',
    'Udaipur',
    'Alwar',
    'Kota',
    'Sikar',
    'Ajmer',
    'Bhilwara',
    'Bikaner',
    'Churu',
    'Dholpur',
    'Jhunjhunu',
    'Sawai Madhopur',
    'Beawar',
    'Chittorgarh',
    'Dungarpur',
    'Nagaur',
    'Khairthal-Tijara',
    'Kotputli-Behror',
    'Salumber'
  ];

  readonly availableSectors: string[] = [
    'Apparel, Agriculture',
    'Media & Entertainment, IT-ITeS',
    'Healthcare, Life Sciences',
    'Electronics, Beauty & Wellness',
    'Food Processing, Handicrafts & Carpet',
    'Retail, Green Jobs',
    'Furniture & Fittings, Apparel',
    'Tourism & Hospitality, Electronics',
    'Textile & Handloom',
    'Solar PV Installation',
    'Automotive & Multi-Skills'
  ];

  // Sample Sanction Table Entries (Dummy PIA names as requested)
  tableRows: SanctionTableRow[] = [
    {
      id: '1',
      appId: 'APP-004661',
      agencyName: 'Company 1',
      district: 'Alwar',
      sector: 'Healthcare, Life Sciences',
      category: 'A-1',
      grade: 'A',
      target: 150
    },
    {
      id: '2',
      appId: 'APP-004662',
      agencyName: 'Company 2',
      district: 'Jodhpur',
      sector: 'Textile & Handloom',
      category: 'A-1',
      grade: 'A',
      target: 150
    },
    {
      id: '3',
      appId: 'APP-004664',
      agencyName: 'Company 4',
      district: 'Kota',
      sector: 'Apparel, Agriculture',
      category: 'A-2',
      grade: 'A',
      target: 105
    },
    {
      id: '4',
      appId: 'APP-003998',
      agencyName: 'Aayushi Contractors Company',
      district: 'Jaipur',
      sector: 'Media & Entertainment, IT-ITeS',
      category: 'A-2',
      grade: 'A',
      target: 150
    },
    {
      id: '5',
      appId: 'APP-003773',
      agencyName: 'All India Computer Saksharta Mission',
      district: 'Kota',
      sector: 'Healthcare, Life Sciences',
      category: 'A-1',
      grade: 'A',
      target: 150
    }
  ];

  // Editable Terms & Conditions Points matching PDF
  termsAndConditions: string[] = [
    'The PIA shall ensure that the total approved IPA budget does not exceed Rs. 70,00,000 (Rupees Seventy Lakh only) for a sanctioned target of 150 candidates and Rs. 50,00,000 (Fifty Lakh only) for a sanctioned target of 105 candidates. The said financial limit shall remain binding throughout the project period.',
    'PIA Shall be allowed to conduct residential training of 45 candidates only against the sanctioned target of 150, and 30 candidates only against the sanctioned target of 105.',
    'PIA shall ensure that only job roles with a duration of 1060 hours or less are selected. Job roles exceeding 1060 hours shall not be allotted under any case.',
    'All PIAs are required to sign the MoU within 10 (ten) working days from the date of issuance of this Sanction Order, failing which the sanction may be liable for cancellation.',
    'PIA will submit a Demand Draft (DD) of Rs. 10,000/- (Ten thousand) issued in favor of Managing Director, Rajasthan Skill and Livelihoods Development Corporation (RSLDC) at the time of MoU signing.',
    'The PIA shall comply to "Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK guidelines applicable from 01 April 2021 (as amended from time to time or revised guideline), branding guidelines and office orders, circulars & directions issued by RSLDC from time to time.',
    'PIA will enroll only targeted beneficiaries as mentioned in scheme guidelines, "Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK", and with reference to the course module.',
    'All PIAs will strictly comply the directives for the Aadhaar enabled Biometric Attendance System (AEBAS) for using the newly developed AEBAS process for marking the attendance of SDCs daily on the ISMS portal.',
    'The following are mandatory for the issuance of In-Principle Approval (IPA) from RSLDC (per batch):- Installation of IP camera-based face recognition system in classrooms and domain labs of SDC.',
    'PIA must hire TOT certified and eligible trainers as per norms laid down in respective job role course modules under Mukhya Mantri Kaushal Vikas Yojana (MMKVY- Category-I) guidelines.',
    'All PIAs must submit inspection reports of at least one SDC along with all required/desired documents within 21 days from date of Sanction order (SO).',
    'PIA shall ensure completion of at least 60% of the allotted target under a particular sanction. Failing which, the remaining target shall be revoked, and the Performance Security Deposit (PSD) of the concerned SDC shall be forfeited.',
    'Mandatory Use of Masked Aadhaar: In compliance with UIDAI Regulations 2021, it is mandatory for all TPs to use masked Aadhaar displaying only the last four digits in all official documentation.'
  ];

  // Copy To Distribution List
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
    const sId = this.route.snapshot.params['schemeId'] || 'ALL';
    this.fetchAcceptedResponses(sId);
  }

  fetchAcceptedResponses(schemeId: string): void {
    this.eoiStateService.getResponses(schemeId).subscribe(responses => {
      const accepted = responses.filter(r => r.status === 'APPROVED');
      if (accepted.length > 0) {
        // Auto-fetch entries from actual accepted responses in state!
        this.tableRows = accepted.map((resp, idx) => ({
          id: resp.id,
          appId: resp.id,
          agencyName: resp.actualLegalName || resp.anonymousLabel,
          district: resp.trainingCentres?.[0]?.district || this.availableDistricts[idx % this.availableDistricts.length],
          sector: resp.placementTrackRecord?.[0]?.sector || this.availableSectors[idx % this.availableSectors.length],
          category: 'A-1',
          grade: resp.scrutinyDetails?.grade === 'Grade A' ? 'A' : (resp.scrutinyDetails?.grade === 'Grade B' ? 'B' : 'A'),
          target: 150
        }));
      }
    });
  }

  addRow(): void {
    const newId = (this.tableRows.length + 1).toString();
    this.tableRows.push({
      id: newId,
      appId: `APP-00${4700 + this.tableRows.length}`,
      agencyName: `Company ${this.tableRows.length + 1}`,
      district: 'Jaipur',
      sector: 'Healthcare, Life Sciences',
      category: 'A-1',
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

  resetToDefaults(): void {
    this.leftLogoUrl.set(null);
    this.rightLogoUrl.set(null);
    this.ngOnInit();
  }

  onLeftLogoUpload(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.leftLogoUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeLeftLogo(): void {
    this.leftLogoUrl.set(null);
  }

  removeRightLogo(): void {
    this.rightLogoUrl.set(null);
  }

  isSaved = signal<boolean>(false);

  saveSanctionOrder(): void {
    this.isSaved.set(true);
    setTimeout(() => {
      this.isSaved.set(false);
    }, 4000);
  }

  printSanctionOrder(): void {
    window.print();
  }
}
