import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { LetterheadComponent } from '../../components/document-editor/letterhead.component';
import { FileNoDateRowComponent } from '../../components/document-editor/file-no-date-row.component';
import { ClauseListComponent } from '../../components/document-editor/clause-list.component';
import { DEFAULT_EMBLEM_SVG, DEFAULT_LEFT_LOGO_URL } from '../../components/document-editor/document-editor.util';
import { SanctionActionBarComponent } from './components/sanction-action-bar.component';
import { SanctionSubjectBlockComponent } from './components/sanction-subject-block.component';
import { SanctionTargetsTableComponent } from './components/sanction-targets-table.component';
import { SanctionSignatoryBlockComponent } from './components/sanction-signatory-block.component';
import { SanctionCopyListComponent } from './components/sanction-copy-list.component';
import { SanctionTableRow } from './eoi-sanction-editor.model';
import {
  AVAILABLE_DISTRICTS,
  AVAILABLE_SECTORS,
  buildRowsFromApproved,
  buildSubjectForScheme,
  createDefaultCopyTo,
  createDefaultTerms,
  createFallbackTableRows,
  createNewTableRow
} from './eoi-sanction-editor.util';

export type { SanctionTableRow } from './eoi-sanction-editor.model';

@Component({
  selector: 'app-eoi-sanction-editor',
  standalone: true,
  imports: [
    LetterheadComponent,
    FileNoDateRowComponent,
    ClauseListComponent,
    SanctionActionBarComponent,
    SanctionSubjectBlockComponent,
    SanctionTargetsTableComponent,
    SanctionSignatoryBlockComponent,
    SanctionCopyListComponent
  ],
  template: `
    <div class="w-full min-h-full bg-white text-[#1F2933] font-sans pb-12 print:bg-white print:p-0 print:pb-0">

      <!-- Top Header & Action Bar (Hidden during Print) -->
      <app-sanction-action-bar
        [schemeId]="schemeId()"
        [isSubmitted]="isSubmitted()"
        [savedNotification]="savedNotification()"
        (save)="saveDraftAndNotify()"
        (print)="printPdf()"
      />

      <!-- EDITABLE SANCTION ORDER DOCUMENT / PDF INTERFACE -->
      <div class="sanction-pdf-container max-w-4xl mx-auto bg-white p-6 sm:p-10 print:p-0 print:max-w-none text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-md rounded-sm print:border-none print:shadow-none">

        <!-- Header with Official Logos & Government Title -->
        <app-letterhead
          [(headerTitle)]="headerTitle"
          [(headerSubtitle)]="headerSubtitle"
          [(headerAddress)]="headerAddress"
          [leftLogoUrl]="leftLogoUrl()"
          [rightLogoUrl]="rightLogoUrl()"
          (leftLogoUpload)="leftLogoUrl.set($event)"
          (rightLogoUpload)="rightLogoUrl.set($event)"
          (leftLogoError)="onLeftLogoError()"
        />

        <!-- File No & Date (Editable) -->
        <app-file-no-date-row [(fileNo)]="fileNo" [(date)]="sanctionDate" />

        <!-- Document title, Subject, Reference and Preamble -->
        <app-sanction-subject-block
          [(documentTitle)]="documentTitle"
          [(subjectText)]="subjectText"
          [(referenceText)]="referenceText"
          [(preambleText)]="preambleText"
        />

        <!-- ALLOCATED PHYSICAL TARGETS TABLE (Editable) -->
        <app-sanction-targets-table
          [rows]="tableRows"
          [districts]="availableDistricts"
          [sectors]="availableSectors"
          (addRow)="addRow()"
          (removeRow)="removeRow($event)"
        />

        <!-- TERMS AND CONDITIONS SECTION (Editable points from sanctionorder2.pdf) -->
        <app-clause-list
          [clauses]="termsAndConditions"
          intro="The above sanction order is issued subject to complying with the following terms and conditions by Project Implementing Agencies (PIAs):"
          listClass="list-decimal pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs"
          labelClass="font-semibold shrink-0 text-slate-700"
          labelFormat="decimal"
          (add)="addClause()"
          (remove)="removeClause($event)"
        />

        <!-- DISPATCH & SIGNATORY BLOCK (Editable) -->
        <app-sanction-signatory-block
          [(dispatchRef)]="dispatchRef"
          [(signatoryName)]="signatoryName"
          [(signatoryTitle)]="signatoryTitle"
          [(signatoryOrg)]="signatoryOrg"
        />

        <!-- COPY TO DISTRIBUTION LIST (Editable) -->
        <app-sanction-copy-list [copyToList]="copyToList" />

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
  private destroyRef = inject(DestroyRef);

  schemeId = signal<string>('');
  currentScheme = signal<Scheme | undefined>(undefined);
  savedNotification = signal<boolean>(false);
  isSubmitted = computed(() => this.savedNotification() || this.eoiStateService.isSanctionSubmitted(this.schemeId()));

  // Logo state and SVG fallbacks (Border-free emblem logo)
  defaultEmblemSvg = DEFAULT_EMBLEM_SVG;
  leftLogoUrl = signal<string>(DEFAULT_LEFT_LOGO_URL);
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

  readonly availableDistricts: readonly string[] = AVAILABLE_DISTRICTS;

  readonly availableSectors: readonly string[] = AVAILABLE_SECTORS;

  tableRows: SanctionTableRow[] = [];

  termsAndConditions: string[] = createDefaultTerms();

  copyToList: string[] = createDefaultCopyTo();

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      this.schemeId.set(sId);
      this.loadSchemeDetails(sId);
    });
  }

  private loadSchemeDetails(sId: string): void {
    const savedData = this.eoiStateService.getSanctionOrderData(sId);
    if (savedData) {
      this.headerTitle = savedData.headerTitle || this.headerTitle;
      this.headerSubtitle = savedData.headerSubtitle || this.headerSubtitle;
      this.headerAddress = savedData.headerAddress || this.headerAddress;
      this.fileNo = savedData.fileNo || this.fileNo;
      this.sanctionDate = savedData.sanctionDate || this.sanctionDate;
      this.documentTitle = savedData.documentTitle || this.documentTitle;
      this.subjectText = savedData.subjectText || this.subjectText;
      this.referenceText = savedData.referenceText || this.referenceText;
      this.preambleText = savedData.preambleText || this.preambleText;
      if (savedData.tableRows && savedData.tableRows.length > 0) {
        this.tableRows = [...savedData.tableRows];
      }
      if (savedData.termsAndConditions && savedData.termsAndConditions.length > 0) {
        this.termsAndConditions = [...savedData.termsAndConditions];
      }
      this.dispatchRef = savedData.dispatchRef || this.dispatchRef;
      this.signatoryName = savedData.signatoryName || this.signatoryName;
      this.signatoryTitle = savedData.signatoryTitle || this.signatoryTitle;
      this.signatoryOrg = savedData.signatoryOrg || this.signatoryOrg;
      if (savedData.copyToList && savedData.copyToList.length > 0) {
        this.copyToList = [...savedData.copyToList];
      }
      if (savedData.leftLogoUrl) {
        this.leftLogoUrl.set(savedData.leftLogoUrl);
      }
      if (savedData.rightLogoUrl) {
        this.rightLogoUrl.set(savedData.rightLogoUrl);
      }
    }

    this.eoiStateService.getSchemeById(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(scheme => {
      if (scheme) {
        this.currentScheme.set(scheme);
        if (!savedData) {
          this.subjectText = buildSubjectForScheme(scheme.schemeTitle);
        }
      }
    });

    if (!savedData || !savedData.tableRows || savedData.tableRows.length === 0) {
      this.eoiStateService.getResponses(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(responses => {
        const approved = responses.filter(r => r.status === 'APPROVED');
        if (approved.length > 0) {
          this.tableRows = buildRowsFromApproved(approved);
        } else {
          // Fallback sample target rows from sanctionorder2.pdf
          this.tableRows = createFallbackTableRows();
        }
      });
    }
  }

  addRow(): void {
    this.tableRows.push(createNewTableRow(this.tableRows.length));
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

  onLeftLogoError(): void {
    this.leftLogoUrl.set(this.defaultEmblemSvg);
  }

  saveDraftAndNotify(): void {
    const sId = this.schemeId() || 'MMKVY-01';
    const data = {
      schemeId: sId,
      headerTitle: this.headerTitle,
      headerSubtitle: this.headerSubtitle,
      headerAddress: this.headerAddress,
      fileNo: this.fileNo,
      sanctionDate: this.sanctionDate,
      documentTitle: this.documentTitle,
      subjectText: this.subjectText,
      referenceText: this.referenceText,
      preambleText: this.preambleText,
      tableRows: this.tableRows,
      termsAndConditions: this.termsAndConditions,
      dispatchRef: this.dispatchRef,
      signatoryName: this.signatoryName,
      signatoryTitle: this.signatoryTitle,
      signatoryOrg: this.signatoryOrg,
      copyToList: this.copyToList,
      leftLogoUrl: this.leftLogoUrl(),
      rightLogoUrl: this.rightLogoUrl(),
      rightLogoText: this.rightLogoText
    };
    this.eoiStateService.saveSanctionOrderData(sId, data);
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
