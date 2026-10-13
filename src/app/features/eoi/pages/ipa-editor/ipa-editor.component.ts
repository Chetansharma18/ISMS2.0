import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService } from '../../services/eoi-state.service';
import { LetterheadComponent } from '../../components/document-editor/letterhead.component';
import { FileNoDateRowComponent } from '../../components/document-editor/file-no-date-row.component';
import { ClauseListComponent } from '../../components/document-editor/clause-list.component';
import { DEFAULT_EMBLEM_SVG, DEFAULT_LEFT_LOGO_URL, DEFAULT_RIGHT_LOGO_URL, isLegacyEmblem } from '../../components/document-editor/document-editor.util';
import { IpaRecipientBlockComponent } from './components/ipa-recipient-block.component';
import { IpaSubjectBlockComponent } from './components/ipa-subject-block.component';
import { IpaCourseTableComponent } from './components/ipa-course-table.component';
import { IpaTargetSummaryTableComponent } from './components/ipa-target-summary-table.component';
import { IpaSignatoryBlockComponent } from './components/ipa-signatory-block.component';
import { EsignModalComponent } from '../eoi-sanction-editor/components/esign-modal.component';
import { IpaPdfService } from './ipa-pdf.service';
import type { IpaDocumentData } from '../../services/eoi-state.models';
import { IpaCourseRow, TargetSummaryRow } from './ipa-editor.model';
import {
  createDefaultCopyTo,
  createDefaultCourseRows,
  createDefaultTargetSummary,
  createDefaultTerms,
  createNewCourseRow,
  sumCourseRows
} from './ipa-editor.util';

export type { IpaCourseRow, TargetSummaryRow } from './ipa-editor.model';

/** Names and address that earlier versions of the template carried; they are not shown any more. */
const STALE_NAMES = ['Apex Technical & Infrastructure Solutions Pvt Ltd', 'M/s. Gupta Brothers'];
const STALE_ADDRESS = 'GROUND FLOOR, KHASRA NO-5/24, GALI NO-7, SOUTH PART-II, SWAROOP NAGAR EXTN, North Delhi, Delhi, 110042';
const isStaleName = (name: string): boolean => !name.trim() || STALE_NAMES.includes(name.trim());

@Component({
  selector: 'app-ipa-editor',
  standalone: true,
  imports: [
    LetterheadComponent,
    FileNoDateRowComponent,
    ClauseListComponent,
    IpaRecipientBlockComponent,
    IpaSubjectBlockComponent,
    IpaCourseTableComponent,
    IpaTargetSummaryTableComponent,
    IpaSignatoryBlockComponent,
    EsignModalComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-slate-50 text-[#1F2933] font-sans py-6 px-3 sm:px-6 lg:px-8 print:bg-white print:p-0">

      <!-- Success Notification Toast -->
      @if (toastMessage()) {
        <div class="fixed top-5 right-5 z-50 px-4 py-3 bg-navy text-white rounded-lg shadow-xl text-xs sm:text-sm font-semibold animate-in fade-in duration-200" role="status">
          {{ toastMessage() }}
        </div>
      }

      <!-- Responsive Document Wrapper fitting full screen without excessive side margins -->
      <div class="w-full max-w-6xl mx-auto space-y-4">

        <!-- Page header: this is a draft until it is finalized -->
        <div class="font-sans print:hidden space-y-3">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>

          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">Draft IPA</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Draft</span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
            Review and edit the In-Principle Approval below, then release it.
          </p>
        </div>

        <!-- EDITABLE IPA DOCUMENT CONTAINER (Matches IPA.pdf layout exactly) -->
        <div class="ipa-pdf-container w-full bg-white p-6 sm:p-10 lg:p-12 print:p-0 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-sm rounded-lg print:border-none print:shadow-none">

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
          <app-file-no-date-row [(fileNo)]="fileNo" [(date)]="ipaDate" marginClass="mb-3" />

          <!-- Recipient Details Block (To, PIA Name, Address, SAR) -->
          <app-ipa-recipient-block
            [(recipientName)]="recipientName"
            [(recipientAddress1)]="recipientAddress1"
            [(recipientAddress2)]="recipientAddress2"
            [(recipientSar)]="recipientSar"
          />

          <!-- Reference, Subject, Preamble and PIA / SDC block -->
          <app-ipa-subject-block
            [(referenceNo)]="referenceNo"
            [(subjectText)]="subjectText"
            [(preambleText)]="preambleText"
            [(piaName)]="piaName"
            [(sdcAddress)]="sdcAddress"
          />

          <!-- MAIN COURSE APPROVAL TABLE (Matching IPA.pdf layout exactly) -->
          <app-ipa-course-table
            [rows]="courseRows"
            [totalTrainees]="totalTraineesCount()"
            [totalCostPerBatch]="totalCostPerBatchSum()"
            [totalCycles]="totalCyclesCount()"
            [totalBudget]="totalBudgetSum()"
            (addRow)="addCourseRow()"
            (removeRow)="removeCourseRow($event)"
          />

          <!-- TARGET ALLOCATION SUMMARY TABLE (Matching IPA.pdf) -->
          <app-ipa-target-summary-table [rows]="targetSummary" />

          <!-- TERMS AND CONDITIONS CLAUSES (Editable a to h from IPA.pdf) -->
          <app-clause-list
            [clauses]="termsAndConditions"
            intro="IPA is issued subject to following terms and conditions: -"
            listClass="list-alpha pl-5 space-y-2 text-slate-800 leading-relaxed text-[11px] sm:text-xs"
            labelClass="font-bold shrink-0 text-slate-800"
            labelFormat="alpha"
            (add)="addClause()"
            (remove)="removeClause($event)"
          />

          <!-- SIGNATORY & DISTRIBUTION BLOCK (Editable) -->
          <app-ipa-signatory-block
            [copyToList]="copyToList"
            [(signatoryTitle)]="signatoryTitle"
            [(signatorySub)]="signatorySub"
          />

        </div>

        <!-- Bottom action bar -->
        <div class="flex items-center justify-end gap-2.5 font-sans print:hidden pt-2">
          <button
            type="button"
            (click)="saveDraft()"
            class="px-6 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer active:scale-95"
          >
            Save
          </button>
          <button
            type="button"
            (click)="showEsign.set(true)"
            class="px-6 py-2.5 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer active:scale-95"
            style="color: #ffffff !important;"
          >
            <span style="color: #ffffff !important;">E-Sign</span>
          </button>
        </div>

      </div>

      @if (showEsign()) {
        <app-esign-modal documentName="IPA" (signed)="onSigned()" (close)="showEsign.set(false)" />
      }

    </div>
  `
})
export class IpaEditorComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private pdfService = inject(IpaPdfService);

  schemeId = signal<string>('');
  appId = signal<string>('');
  toastMessage = signal<string>('');
  showEsign = signal<boolean>(false);

  // Logo state and SVG fallbacks (Border-free emblem logo)
  defaultEmblemSvg = DEFAULT_EMBLEM_SVG;
  leftLogoUrl = signal<string>(DEFAULT_LEFT_LOGO_URL);
  rightLogoUrl = signal<string>(DEFAULT_RIGHT_LOGO_URL);
  rightLogoText = 'RSLDC\nJAIPUR';

  // Header & Ref Fields matching IPA.pdf
  headerTitle = 'Rajasthan Skill and Livelihoods Development Corporation';
  headerSubtitle = '(A Government of Rajasthan Enterprise)';
  headerAddress = 'EMI Campus, J-8-A, Jhalana Institutional Area, Jaipur- 302004 (Rajasthan)';

  fileNo = 'FORSLDC/Skills/MMKVY-Cat.II: SAKSHM/2026-27/2895-97';
  ipaDate = '15/9/26';

  recipientName = '';
  recipientAddress1 = '';
  recipientAddress2 = 'Sri Ganganagar, Rajasthan, Pin Code-335001';
  recipientSar = 'SAR: 2200-099-001';

  referenceNo = 'F () RSLDC/SKILL/MMKVY-Cat.-II: SAKSHM/2026-27/535, Dated: 15/07/2026';
  subjectText = 'In-Principal Approval (IPA-1)- MMKVY-Cat. II / SAKSHM sponsored by RSLDC for F.Y. 2026-27.';
  preambleText = 'In reference to your request and based on the recommendation from inspection team, in-principal approval is hereby accorded for conducting cycles (as detailed below) for following courses during financial year 2026-27, as per the terms and conditions stipulated in relevant guidelines.';

  piaName = '';
  sdcAddress = 'Near Panchayati Mandir, Opposite Government Hospital, Kesisinghpur, Sriganganagar, 335027';

  // Course Approval Table matching IPA.pdf exactly
  courseRows: IpaCourseRow[] = createDefaultCourseRows();

  // Target Summary Table matching IPA.pdf exactly
  targetSummary: TargetSummaryRow[] = createDefaultTargetSummary();

  // Terms and Conditions Clauses (a to h) matching IPA.pdf exactly
  termsAndConditions: string[] = createDefaultTerms();

  signatoryTitle = 'Scheme OIC';
  signatorySub = 'SAKSHM, RSLDC';

  copyToList: string[] = createDefaultCopyTo();

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const sId = params['schemeId'] || 'MMKVY-01';
      const aId = params['appId'] || 'APP-004661';
      this.schemeId.set(sId);
      this.appId.set(aId);
      this.loadIpaDetails(sId, aId);
    });
  }

  private loadIpaDetails(sId: string, aId: string): void {
    // This company's own saved IPA, if any. Otherwise the last saved IPA (or the default) is only a template.
    const ownData = this.eoiStateService.getAppIpa(sId, aId);
    const savedData = ownData ?? this.eoiStateService.getIpaData(sId, aId);
    if (savedData) {
      this.headerTitle = savedData.headerTitle || this.headerTitle;
      this.headerSubtitle = savedData.headerSubtitle || this.headerSubtitle;
      this.headerAddress = savedData.headerAddress || this.headerAddress;
      this.fileNo = savedData.fileNo || this.fileNo;
      this.ipaDate = savedData.ipaDate || this.ipaDate;
      this.recipientName = savedData.recipientName || this.recipientName;
      this.recipientAddress1 = savedData.recipientAddress1 || this.recipientAddress1;
      this.recipientAddress2 = savedData.recipientAddress2 || this.recipientAddress2;
      this.recipientSar = savedData.sarNumber || this.recipientSar;
      this.referenceNo = savedData.referenceNo || this.referenceNo;
      this.subjectText = savedData.subjectText || this.subjectText;
      this.preambleText = savedData.preambleText || this.preambleText;
      this.piaName = savedData.piaName || this.piaName;
      this.sdcAddress = savedData.sdcAddress || this.sdcAddress;
      if (savedData.courseRows && savedData.courseRows.length > 0) {
        this.courseRows = [...savedData.courseRows];
      }
      if (savedData.targetSummary && savedData.targetSummary.length > 0) {
        this.targetSummary = [...savedData.targetSummary];
      }
      if (savedData.termsAndConditions && savedData.termsAndConditions.length > 0) {
        this.termsAndConditions = [...savedData.termsAndConditions];
      }
      if (savedData.ccList && savedData.ccList.length > 0) {
        this.copyToList = [...savedData.ccList];
      }
      this.signatoryTitle = savedData.signatoryTitle || this.signatoryTitle;
      this.signatorySub = savedData.signatorySub || this.signatorySub;
      if (savedData.leftLogoUrl && !isLegacyEmblem(savedData.leftLogoUrl) && (savedData.leftLogoUrl.startsWith('data:') || savedData.leftLogoUrl.includes('rsldc-logo'))) {
        this.leftLogoUrl.set(savedData.leftLogoUrl);
      } else {
        this.leftLogoUrl.set(DEFAULT_LEFT_LOGO_URL);
      }
      if (savedData.rightLogoUrl && (savedData.rightLogoUrl.startsWith('data:') || savedData.rightLogoUrl.includes('Rajasthan-Sarkar'))) {
        this.rightLogoUrl.set(savedData.rightLogoUrl);
      } else {
        this.rightLogoUrl.set(DEFAULT_RIGHT_LOGO_URL);
      }
    }

    // The saved copy is an IPA that was already e-signed, so this page starts the next one (IPA-2, IPA-3, ...).
    if (ownData?.signedAt) {
      const next = this.eoiStateService.getIssuedIpaCount(sId, aId) + 1;
      this.subjectText = this.subjectText.replace(/IPA-\d+/i, `IPA-${next}`);
    }

    // The letter is addressed to this company, named as in the sanction order. A name left over from an
    // earlier template (or an empty one) is replaced; a name typed into this company's own IPA is kept.
    const companyName = this.eoiStateService.getSchemeSanctionOrder(sId)?.tableRows.find(row => row.appId === aId)?.agencyName;
    if (companyName) {
      if (!ownData || isStaleName(this.recipientName)) this.recipientName = companyName;
      if (!ownData || isStaleName(this.piaName)) this.piaName = companyName;
    }
    if (this.recipientAddress1 === STALE_ADDRESS) this.recipientAddress1 = '';

  }

  // NOTE: these computeds read a plain array (no signal dependency), so they are evaluated once;
  // behaviour intentionally preserved from the original component.
  totalTraineesCount = computed(() => sumCourseRows(this.courseRows, 'approvedTrainees'));

  totalCostPerBatchSum = computed(() => sumCourseRows(this.courseRows, 'costPerBatch'));

  totalCyclesCount = computed(() => sumCourseRows(this.courseRows, 'cycles'));

  totalBudgetSum = computed(() => sumCourseRows(this.courseRows, 'totalBudget'));

  addCourseRow(): void {
    const nextNo = (this.courseRows.length + 1).toString();
    this.courseRows.push(createNewCourseRow(nextNo));
  }

  removeCourseRow(index: number): void {
    if (this.courseRows.length > 1) {
      this.courseRows.splice(index, 1);
    }
  }

  addClause(): void {
    this.termsAndConditions.push('TP shall comply with all updated operational guidelines and office orders issued by RSLDC.');
  }

  removeClause(index: number): void {
    if (this.termsAndConditions.length > 1) {
      this.termsAndConditions.splice(index, 1);
    }
  }

  onLeftLogoError(): void {
    this.leftLogoUrl.set(this.defaultEmblemSvg);
  }

  /** Back to the approved companies of this scheme. */
  goBack(): void {
    void this.router.navigate(['/admin/ipa', this.schemeId() || 'ALL']);
  }

  /** Saves the draft and stays on the page. */
  saveDraft(): void {
    this.persist();
    this.showToast('Draft saved.');
  }

  /**
   * The OTP was verified: the IPA is saved and released, the signed PDF opens in a new tab,
   * and this page moves on to the approved companies of the scheme.
   */
  onSigned(): void {
    // The tab is opened straight away (while the click is still being handled) so the browser allows it.
    const tab = window.open('', '_blank');
    const sId = this.schemeId() || 'MMKVY-01';
    const aId = this.appId() || 'APP-004661';
    const data: IpaDocumentData = { ...this.documentData(sId, aId), signedAt: new Date().toISOString() };

    this.showEsign.set(false);
    this.eoiStateService.saveIpaReleased(sId, aId, data);
    void this.pdfService.openSignedPdf(data, tab);
    this.showToast('IPA e-signed and released.', () => this.goBack());
  }

  private showToast(message: string, afterwards?: () => void): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set('');
      afterwards?.();
    }, afterwards ? 1200 : 1500);
  }

  private persist(): void {
    const sId = this.schemeId() || 'MMKVY-01';
    const aId = this.appId() || 'APP-004661';
    this.eoiStateService.saveIpaData(sId, aId, this.documentData(sId, aId));
  }

  private documentData(sId: string, aId: string): IpaDocumentData {
    return {
      schemeId: sId,
      appId: aId,
      headerTitle: this.headerTitle,
      headerSubtitle: this.headerSubtitle,
      headerAddress: this.headerAddress,
      fileNo: this.fileNo,
      ipaDate: this.ipaDate,
      recipientName: this.recipientName,
      recipientAddress1: this.recipientAddress1,
      recipientAddress2: this.recipientAddress2,
      sarNumber: this.recipientSar,
      referenceNo: this.referenceNo,
      subjectText: this.subjectText,
      preambleText: this.preambleText,
      piaName: this.piaName,
      sdcAddress: this.sdcAddress,
      courseRows: this.courseRows,
      targetSummary: this.targetSummary,
      termsAndConditions: this.termsAndConditions,
      ccList: this.copyToList,
      signatoryTitle: this.signatoryTitle,
      signatorySub: this.signatorySub,
      leftLogoUrl: this.leftLogoUrl(),
      rightLogoUrl: this.rightLogoUrl()
    };
  }

  printPdf(): void {
    window.print();
  }
}
