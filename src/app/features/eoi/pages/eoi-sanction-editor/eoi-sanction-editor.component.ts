import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import { LetterheadComponent } from '../../components/document-editor/letterhead.component';
import { FileNoDateRowComponent } from '../../components/document-editor/file-no-date-row.component';
import { ClauseListComponent } from '../../components/document-editor/clause-list.component';
import { DEFAULT_EMBLEM_SVG, DEFAULT_LEFT_LOGO_URL, DEFAULT_RIGHT_LOGO_URL, isLegacyEmblem } from '../../components/document-editor/document-editor.util';
import { SanctionSubjectBlockComponent } from './components/sanction-subject-block.component';
import { SanctionTargetsTableComponent } from './components/sanction-targets-table.component';
import { SanctionSignatoryBlockComponent } from './components/sanction-signatory-block.component';
import { SanctionCopyListComponent } from './components/sanction-copy-list.component';
import { EsignModalComponent } from './components/esign-modal.component';
import { SanctionPdfService } from './sanction-pdf.service';
import type { SanctionOrderDocumentData } from '../../services/eoi-state.models';
import { ButtonComponent, DocumentPageComponent } from '../../../../shared';
import { SanctionTableRow } from './eoi-sanction-editor.model';
import {
  AVAILABLE_DISTRICTS,
  AVAILABLE_SECTORS,
  buildSubjectForScheme,
  syncRowsWithApproved,
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
    DocumentPageComponent,
    ButtonComponent,
    LetterheadComponent,
    FileNoDateRowComponent,
    ClauseListComponent,
    SanctionSubjectBlockComponent,
    SanctionTargetsTableComponent,
    SanctionSignatoryBlockComponent,
    SanctionCopyListComponent,
    EsignModalComponent
  ],
  template: `
    <app-document-page
      title="Draft Sanction Order"
      badge="Draft"
      subtitle="Review and edit the sanction order below, then release it."
      [toast]="toastMessage()"
      (back)="goBack()"
    >

          <!-- Header with Official Logos: Left (RSLDC) & Right (Bharat Sarkar) -->
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
          />

          <!-- COPY TO DISTRIBUTION LIST (Editable) -->
          <app-sanction-copy-list [copyToList]="copyToList" />

      <ng-container actions>
        <button appButton variant="outline" size="lg" (click)="saveDraft()">Save</button>
        <button appButton size="lg" (click)="showEsign.set(true)">E-Sign</button>
      </ng-container>

      @if (showEsign()) {
        <div overlay>
          <app-esign-modal (signed)="onSigned()" (close)="showEsign.set(false)" />
        </div>
      }
    </app-document-page>
  `
})
export class EoiSanctionEditorComponent implements OnInit {
  private eoiStateService = inject(EoiStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pdfService = inject(SanctionPdfService);
  private destroyRef = inject(DestroyRef);

  schemeId = signal<string>('');
  currentScheme = signal<Scheme | undefined>(undefined);
  toastMessage = signal<string>('');
  showEsign = signal<boolean>(false);

  // Logo state: Left Logo is RSLDC, Right Logo is Bharat Sarkar
  defaultEmblemSvg = DEFAULT_EMBLEM_SVG;
  leftLogoUrl = signal<string>(DEFAULT_LEFT_LOGO_URL);
  rightLogoUrl = signal<string>(DEFAULT_RIGHT_LOGO_URL);
  rightLogoText = 'भारत सरकार\nGOVERNMENT OF INDIA';

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
    const savedData =
      this.eoiStateService.getSchemeSanctionOrder(sId) ?? this.eoiStateService.getDefaultSanctionOrderData(sId);
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
      if (savedData.termsAndConditions && savedData.termsAndConditions.length > 0) {
        this.termsAndConditions = [...savedData.termsAndConditions];
      }
      this.dispatchRef = savedData.dispatchRef || this.dispatchRef;
      if (savedData.copyToList && savedData.copyToList.length > 0) {
        this.copyToList = [...savedData.copyToList];
      }
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

    this.eoiStateService.getSchemeById(sId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(scheme => {
      if (scheme) {
        this.currentScheme.set(scheme);
        if (!savedData) {
          this.subjectText = buildSubjectForScheme(scheme.schemeTitle);
        }
      }
    });

    // The table follows the companies approved right now (Company 1, Company 2, ...),
    // keeping any edits that were saved earlier for the same companies.
    this.eoiStateService
      .getResponses(sId)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(responses => {
        const approved = responses.filter(r => r.status === 'APPROVED');
        const rows = syncRowsWithApproved(savedData?.tableRows ?? [], approved, responses);
        this.tableRows = rows.length > 0 ? rows : createFallbackTableRows();
      });
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

  /** Back to the applicant list of this scheme. */
  goBack(): void {
    this.router.navigate(['/admin/responses', this.schemeId() || 'ALL']);
  }

  /** Saves the draft and stays on the page. The order is not released yet. */
  saveDraft(): void {
    const sId = this.schemeId() || 'MMKVY-01';
    this.eoiStateService.saveSanctionOrderDraft(sId, this.documentData(sId));
    this.showToast('Draft saved.');
  }

  /**
   * The OTP was verified: the order is saved and released, the signed PDF opens in a new tab,
   * and this page moves on to the list of sanction orders.
   */
  onSigned(): void {
    // The tab is opened straight away (while the click is still being handled) so the browser allows it.
    const tab = window.open('', '_blank');
    const sId = this.schemeId() || 'MMKVY-01';
    const data: SanctionOrderDocumentData = { ...this.documentData(sId), signedAt: new Date().toISOString() };

    this.showEsign.set(false);
    this.eoiStateService.saveSanctionOrderData(sId, data);
    void this.pdfService.openSignedPdf(data, tab);
    this.showToast('Sanction order e-signed and released.', () => this.router.navigate(['/admin/sanction-orders']));
  }

  private showToast(message: string, afterwards?: () => void): void {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set('');
      afterwards?.();
    }, afterwards ? 1200 : 1500);
  }

  private documentData(sId: string): SanctionOrderDocumentData {
    return {
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
      copyToList: this.copyToList,
      leftLogoUrl: this.leftLogoUrl(),
      rightLogoUrl: this.rightLogoUrl(),
      rightLogoText: this.rightLogoText
    };
  }

  printPdf(): void {
    window.print();
  }
}
