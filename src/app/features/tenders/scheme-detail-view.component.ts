import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem, EoiRequiredInfoItem } from './tenders.models';
import { SchemeDetailPdfService } from './scheme-detail-view/scheme-detail-pdf.service';
import { DocumentViewerService } from '../../core/services/document-viewer.service';
import { isSubmissionClosed } from './scheme-detail-view/scheme-detail-view.util';
import { SchemeDetailToolbarComponent } from './scheme-detail-view/scheme-detail-toolbar.component';
import { SchemeDetailSummaryComponent } from './scheme-detail-view/scheme-detail-summary.component';
import { SchemeDocumentsPanelComponent } from './scheme-detail-view/scheme-documents-panel.component';
import { SchemeAnnexuresListComponent } from './scheme-detail-view/scheme-annexures-list.component';
import { RequiredDocumentsListComponent } from './scheme-detail-view/required-documents-list.component';

@Component({
  selector: 'app-scheme-detail-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SchemeDetailToolbarComponent,
    SchemeDetailSummaryComponent,
    SchemeDocumentsPanelComponent,
    SchemeAnnexuresListComponent,
    RequiredDocumentsListComponent
  ],
  template: `
    <div class="w-full bg-white text-slate-800 font-sans p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200" >

      <!-- 1. TOP CONTROLS & NAVIGATION BAR -->
      <app-scheme-detail-toolbar
        [isClosed]="isClosed"
        [hideApplyButton]="hideApplyButton"
        (back)="onBack()"
        (downloadDetails)="handleViewDetailsClick()"
        (apply)="onApply()"
      ></app-scheme-detail-toolbar>

      <!-- 2 & 3. SCHEME TITLE, DESCRIPTION & METADATA STATS BAR -->
      <app-scheme-detail-summary [scheme]="scheme"></app-scheme-detail-summary>

      <!-- 4. MIDDLE SECTION: SCHEME DOCUMENTS & ANNEXURES -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 pt-3">
        
        <!-- Left Column: Scheme Documents (4 of 12 columns) -->
        <div class="md:col-span-5 lg:col-span-4 md:pr-6 md:border-r border-slate-200">
          <app-scheme-documents-panel
            [scheme]="scheme"
            (downloadRfp)="downloadRfp()"
            (downloadSop)="downloadSop()"
          ></app-scheme-documents-panel>
        </div>

        <!-- Right Column: Annexures (Numbered List, No Download Buttons) -->
        <div class="md:col-span-7 lg:col-span-8">
          <app-scheme-annexures-list [annexures]="annexures"></app-scheme-annexures-list>
        </div>

      </div>

      <!-- 5. BOTTOM SECTION: REQUIRED SUPPORTING DOCUMENTS -->
      <div class="border-t border-slate-200 mt-6 pt-5">
        <app-required-documents-list [requiredInfo]="requiredInfo"></app-required-documents-list>
      </div>

    </div>
  `
})
export class SchemeDetailViewComponent {
  private pdfService = inject(SchemeDetailPdfService);
  private docViewer = inject(DocumentViewerService);

  @Input({ required: true }) scheme!: SchemeTender;
  @Input() rfpDocs: EoiDocumentItem[] = [];
  @Input() annexures: EoiDocumentItem[] = [];
  @Input() requiredInfo: EoiRequiredInfoItem[] = [];
  @Input() hideApplyButton = false;

  @Output() back = new EventEmitter<void>();
  @Output() apply = new EventEmitter<SchemeTender>();
  @Output() download = new EventEmitter<string>();

  get isClosed(): boolean {
    return isSubmissionClosed(this.scheme);
  }

  onBack(): void {
    this.back.emit();
  }

  onApply(): void {
    this.apply.emit(this.scheme);
  }

  handleViewDetailsClick(): void {
    this.generateOfficialPdf();
  }

  downloadRfp(): void {
    this.downloadRfpOrSop({
      sNo: 1,
      name: 'Request for Proposal (RFP)',
      size: this.scheme?.rfpDocSize || '2.4 MB'
    });
  }

  downloadSop(): void {
    this.downloadRfpOrSop({
      sNo: 2,
      name: 'Standard Operating Procedure (SOP) for Training Partners',
      size: this.scheme?.sopDocSize || '1.8 MB'
    });
  }

  downloadRfpOrSop(docItem: EoiDocumentItem): void {
    this.docViewer.openDocument({
      fileName: 'ISMS RFP.pdf',
      title: docItem.name
    });
    this.download.emit(docItem.name);
  }

  /** Direct PDF download of the full scheme details (see SchemeDetailPdfService). */
  async generateOfficialPdf(): Promise<void> {
    await this.pdfService.generateOfficialPdf(this.scheme, this.annexures, this.requiredInfo);
    this.download.emit('Scheme Details PDF');
  }
}
