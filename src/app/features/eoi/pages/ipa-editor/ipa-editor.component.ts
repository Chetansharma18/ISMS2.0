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
import { IpaQualificationBlockComponent } from './components/ipa-qualification-block.component';
import { SanctionFooterComponent } from '../eoi-sanction-editor/components/sanction-footer.component';
import { EsignModalComponent } from '../eoi-sanction-editor/components/esign-modal.component';
import { ButtonComponent, DocumentPageComponent } from '../../../../shared';
import { IpaPdfService } from './ipa-pdf.service';
import type { IpaDocumentData } from '../../services/eoi-state.models';
import { IpaCourseRow, TargetSummaryRow } from './ipa-editor.model';
import {
  createDefaultCopyTo,
  createDefaultCourseRows,
  createDefaultQualification,
  createDefaultTargetSummary,
  createDefaultTerms,
  createNewCourseRow,
  isLegacyIpaTerms,
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
    DocumentPageComponent,
    ButtonComponent,
    LetterheadComponent,
    FileNoDateRowComponent,
    ClauseListComponent,
    IpaRecipientBlockComponent,
    IpaSubjectBlockComponent,
    IpaCourseTableComponent,
    IpaTargetSummaryTableComponent,
    IpaSignatoryBlockComponent,
    IpaQualificationBlockComponent,
    SanctionFooterComponent,
    EsignModalComponent
  ],
  template: `
    <app-document-page
      title="Draft IPA"
      badge="Draft"
      subtitle="Review and edit the In-Principal Approval below, then release it."
      [toast]="toastMessage()"
      (back)="goBack()"
    >

          <!-- Header with Official Logos & Government Title -->
          <app-letterhead
            [official]="true"
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
          <app-file-no-date-row [official]="true" [showFileLabel]="false" [(fileNo)]="fileNo" [(date)]="ipaDate" marginClass="mb-3" />

          <!-- Recipient Details Block (To, PIA Name, Address, SAR) -->
          <app-ipa-recipient-block
            [(recipientName)]="recipientName"
            [(recipientAddress1)]="recipientAddress1"
            [(recipientAddress2)]="recipientAddress2"
            [(recipientSar)]="recipientSar"
          />

          <!-- Reference, Subject and opening paragraph -->
          <app-ipa-subject-block
            [(referenceNo)]="referenceNo"
            [(subjectText)]="subjectText"
            [(preambleText)]="preambleText"
          />

          <!-- MAIN COURSE APPROVAL TABLE, with the agency and its SDC address across the top -->
          <app-ipa-course-table
            [(piaName)]="piaName"
            [(sdcAddress)]="sdcAddress"
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

          <!-- Minimum qualification of the trainees -->
          <app-ipa-qualification-block
            [(note)]="qualificationNote"
            [(title)]="qualificationTitle"
            [(text)]="qualificationText"
          />

          <!-- TERMS AND CONDITIONS CLAUSES (Editable, a to j) -->
          <app-clause-list
            [official]="true"
            [clauses]="termsAndConditions"
            intro="IPA is issued subject to following terms and conditions: -"
            listClass="list-none m-0 p-0 space-y-1.5 text-slate-900"
            labelClass="shrink-0 w-6"
            labelFormat="alpha"
            (add)="addClause()"
            (remove)="removeClause($event)"
          />

          <!-- CC DISTRIBUTION LIST (Editable); the signer's name and signature come from the e-sign -->
          <app-ipa-signatory-block [copyToList]="copyToList" />

          <!-- Website, e-mail and telephone of RSLDC, as in the footer of the printed IPA -->
          <app-sanction-footer />

      <ng-container actions>
        <button appButton variant="outline" size="lg" (click)="saveDraft()">Save</button>
        <button appButton size="lg" (click)="showEsign.set(true)">E-Sign</button>
      </ng-container>

      @if (showEsign()) {
        <div overlay>
          <app-esign-modal documentName="IPA" (signed)="onSigned()" (close)="showEsign.set(false)" />
        </div>
      }
    </app-document-page>
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

  fileNo = 'F () RSLDC/Skills/MMKVY: Cat-I/RAJKViK/IPA/2026-27/';
  ipaDate = '28/09/2026';

  recipientName = '';
  recipientAddress1 = '';
  recipientAddress2 = 'Sri Ganganagar, Rajasthan, Pin Code-335001';
  recipientSar = 'SAR: 2200-099-001';

  referenceNo = '-Sanction order no. F()RSLDC/Skills/MMKVY/RAJKViK/2026-27/1358 dated: 30.07.2026';
  subjectText = 'In-Principal Approval (IPA-1)-MMKVY/RAJKViK sponsored by RSLDC for F.Y 2026-27';
  preambleText = 'In reference to your request and based on the recommendation from inspection team, 1st in-principal approval is hereby accorded for conducting cycles (as detailed below) for following courses during financial year 2026-27, as per the terms and conditions stipulated in relevant guidelines.';

  piaName = '';
  sdcAddress = 'Near Panchayati Mandir, Opposite Government Hospital, Kesisinghpur, Sriganganagar, 335027';

  // Course Approval Table matching IPA.pdf exactly
  courseRows: IpaCourseRow[] = createDefaultCourseRows();

  // Target Summary Table matching IPA.pdf exactly
  targetSummary: TargetSummaryRow[] = createDefaultTargetSummary();

  // Minimum qualification of the trainees (note and box); filled from the first course until edited
  qualificationNote = '';
  qualificationTitle = '';
  qualificationText = '';

  // Terms and Conditions Clauses (a to j) worded as in the printed IPA
  termsAndConditions: string[] = createDefaultTerms();

  // Not shown on the draft: the e-sign adds the signer. They are printed in the signature box of the PDF.
  signatoryTitle = 'Scheme OIC';
  signatorySub = 'RAJKViK, RSLDC';

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
      // The letterhead is in normal case on the printed IPA; a title saved in capitals falls back to the normal-case one.
      if (savedData.headerTitle && savedData.headerTitle !== savedData.headerTitle.toUpperCase()) {
        this.headerTitle = savedData.headerTitle;
      }
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
      // A draft saved with the earlier terms takes the wording of the printed IPA; an IPA already signed keeps its own.
      const upgradeTerms = !savedData.signedAt && isLegacyIpaTerms(savedData.termsAndConditions ?? []);
      if (savedData.termsAndConditions && savedData.termsAndConditions.length > 0 && !upgradeTerms) {
        this.termsAndConditions = [...savedData.termsAndConditions];
      }
      if (savedData.ccList && savedData.ccList.length > 0 && !upgradeTerms) {
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

    // Every course row names the district it is allowed in; default to this company's sanctioned district.
    const sanctionDistrict = this.eoiStateService.getSchemeSanctionOrder(sId)?.tableRows
      .find(row => row.appId === aId)?.district?.split(',')[0]?.trim() ?? '';
    this.defaultDistrict = sanctionDistrict;
    this.courseRows = this.courseRows.map(row => ({ ...row, district: row.district || sanctionDistrict }));

    // The qualification note and box start from the first course, unless this IPA already has its own.
    const qualification = createDefaultQualification(this.courseRows);
    this.qualificationNote = savedData?.qualificationNote ?? qualification.note;
    this.qualificationTitle = savedData?.qualificationTitle ?? qualification.title;
    this.qualificationText = savedData?.qualificationText ?? qualification.text;
  }

  private defaultDistrict = '';

  // NOTE: these computeds read a plain array (no signal dependency), so they are evaluated once;
  // behaviour intentionally preserved from the original component.
  totalTraineesCount = computed(() => sumCourseRows(this.courseRows, 'approvedTrainees'));

  totalCostPerBatchSum = computed(() => sumCourseRows(this.courseRows, 'costPerBatch'));

  totalCyclesCount = computed(() => sumCourseRows(this.courseRows, 'cycles'));

  totalBudgetSum = computed(() => sumCourseRows(this.courseRows, 'totalBudget'));

  addCourseRow(): void {
    // Ids stay unique after deletions: SDC allocations point at a course row by id.
    const nextNo = (Math.max(0, ...this.courseRows.map(r => Number(r.id) || 0)) + 1).toString();
    this.courseRows.push(createNewCourseRow(nextNo, this.defaultDistrict));
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
      qualificationNote: this.qualificationNote,
      qualificationTitle: this.qualificationTitle,
      qualificationText: this.qualificationText,
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
