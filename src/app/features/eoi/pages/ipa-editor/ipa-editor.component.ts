import { Component, DestroyRef, inject, signal, computed, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService } from '../../services/eoi-state.service';
import { LetterheadComponent } from '../../components/document-editor/letterhead.component';
import { FileNoDateRowComponent } from '../../components/document-editor/file-no-date-row.component';
import { ClauseListComponent } from '../../components/document-editor/clause-list.component';
import { DEFAULT_EMBLEM_SVG, DEFAULT_LEFT_LOGO_URL, DEFAULT_RIGHT_LOGO_URL } from '../../components/document-editor/document-editor.util';
import { IpaRecipientBlockComponent } from './components/ipa-recipient-block.component';
import { IpaSubjectBlockComponent } from './components/ipa-subject-block.component';
import { IpaCourseTableComponent } from './components/ipa-course-table.component';
import { IpaTargetSummaryTableComponent } from './components/ipa-target-summary-table.component';
import { IpaSignatoryBlockComponent } from './components/ipa-signatory-block.component';
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
    IpaSignatoryBlockComponent
  ],
  template: `
    <div class="w-full min-h-screen bg-slate-50 text-[#1F2933] font-sans py-6 px-3 sm:px-6 lg:px-8 print:bg-white print:p-0">

      <!-- Success Notification Toast -->
      @if (savedNotification()) {
        <div class="fixed top-5 right-5 z-50 p-4 bg-emerald-600 text-white rounded-lg shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>In-Principle Approval (IPA) Saved &amp; Finalized Successfully!</span>
        </div>
      }

      <!-- Responsive Document Wrapper fitting full screen without excessive side margins -->
      <div class="w-full max-w-6xl mx-auto space-y-4">

        <!-- EDITABLE IPA DOCUMENT CONTAINER (Matches IPA.pdf layout exactly) -->
        <div class="ipa-pdf-container w-full bg-white p-6 sm:p-8 lg:p-10 print:p-0 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-sm rounded-lg print:border-none print:shadow-none">

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

        <!-- Bottom Action Bar: Save & Finalize shifted to right, Print removed -->
        <div class="flex items-center justify-end font-sans print:hidden pt-2">
          <button
            type="button"
            (click)="saveIpaAndNotify()"
            class="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Save &amp; Finalize IPA Letter</span>
          </button>
        </div>

      </div>

    </div>
  `
})
export class IpaEditorComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  schemeId = signal<string>('');
  appId = signal<string>('');
  savedNotification = signal<boolean>(false);
  isSaved = signal<boolean>(false);

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

  recipientName = 'M/s. Gupta Brothers';
  recipientAddress1 = 'D-5, Subzi Mandi Yard, Sri Ganganagar';
  recipientAddress2 = 'Sri Ganganagar, Rajasthan, Pin Code-335001';
  recipientSar = 'SAR: 2200-099-001';

  referenceNo = 'F () RSLDC/SKILL/MMKVY-Cat.-II: SAKSHM/2026-27/535, Dated: 15/07/2026';
  subjectText = 'In-Principal Approval (IPA-1)- MMKVY-Cat. II / SAKSHM sponsored by RSLDC for F.Y. 2026-27.';
  preambleText = 'In reference to your request and based on the recommendation from inspection team, in-principal approval is hereby accorded for conducting cycles (as detailed below) for following courses during financial year 2026-27, as per the terms and conditions stipulated in relevant guidelines.';

  piaName = 'M/s. Gupta Brothers';
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
    const savedData = this.eoiStateService.getIpaData(sId, aId);
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
      if (savedData.leftLogoUrl && (savedData.leftLogoUrl.startsWith('data:') || savedData.leftLogoUrl.includes('rsldc-logo'))) {
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

    this.eoiStateService.getResponseById(aId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(resp => {
      if (resp && !savedData) {
        this.recipientName = resp.actualLegalName || resp.anonymousLabel;
        this.piaName = resp.actualLegalName || resp.anonymousLabel;
        if (resp.organisation?.registeredAddress) {
          this.recipientAddress1 = resp.organisation.registeredAddress;
        }
      }
    });
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

  saveIpaAndNotify(): void {
    const sId = this.schemeId() || 'MMKVY-01';
    const aId = this.appId() || 'APP-004661';
    const data = {
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
    this.eoiStateService.saveIpaData(sId, aId, data);
    this.savedNotification.set(true);
    this.isSaved.set(true);
    setTimeout(() => {
      this.savedNotification.set(false);
      this.router.navigate(['/admin/sanction-order', this.schemeId()]);
    }, 1200);
  }

  printPdf(): void {
    window.print();
  }
}
