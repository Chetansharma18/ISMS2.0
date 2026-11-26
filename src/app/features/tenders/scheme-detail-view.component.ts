import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem, EoiRequiredInfoItem } from './tenders.models';
import { SchemeDetailPdfService } from './scheme-detail-view/scheme-detail-pdf.service';
import { isSubmissionClosed } from './scheme-detail-view/scheme-detail-view.util';
import { SchemeDetailSummaryComponent } from './scheme-detail-view/scheme-detail-summary.component';
import { SchemeDocumentsPanelComponent } from './scheme-detail-view/scheme-documents-panel.component';
import { SchemeAnnexuresListComponent } from './scheme-detail-view/scheme-annexures-list.component';
import { RequiredDocumentsListComponent } from './scheme-detail-view/required-documents-list.component';
import { ButtonComponent, IconComponent, PageHeaderComponent, PageShellComponent } from '../../shared';

@Component({
  selector: 'app-scheme-detail-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PageShellComponent,
    PageHeaderComponent,
    ButtonComponent,
    IconComponent,
    SchemeDetailSummaryComponent,
    SchemeDocumentsPanelComponent,
    SchemeAnnexuresListComponent,
    RequiredDocumentsListComponent
  ],
  template: `
    <app-page-shell>
      <!-- 1. STANDARD PAGE HEADER WITH SCHEME NAME & ACTION -->
      <app-page-header
        [title]="scheme.schemeTitle || scheme.schemeName"
        [showBack]="true"
        backTitle="Back to Active EOI"
        (back)="onBack()"
      >
        @if (!hideApplyButton) {
          @if (!isClosed) {
            <button appButton size="sm" type="button" (click)="onApply()">
              <span>Apply for EOI</span>
              <app-icon name="forward" size="sm" />
            </button>
          } @else {
            <span class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
              Submission Closed
            </span>
          }
        }
      </app-page-header>

      <!-- 2. SCHEME OVERVIEW & PARAMETERS (Clean 3-Column Grid) -->
      <app-scheme-detail-summary [scheme]="scheme"></app-scheme-detail-summary>

      <!-- 3. PUBLISHED EOI DOCUMENTS (Clean Card Grid) -->
      <app-scheme-documents-panel
        [docs]="rfpDocs"
        (view)="download.emit($event)"
      ></app-scheme-documents-panel>

      <!-- 4. PRESCRIBED ANNEXURES -->
      <app-scheme-annexures-list [annexures]="annexures"></app-scheme-annexures-list>

      <!-- 5. REQUIRED SUPPORTING DOCUMENTS -->
      <app-required-documents-list [requiredInfo]="requiredInfo"></app-required-documents-list>
    </app-page-shell>
  `
})
export class SchemeDetailViewComponent {
  private pdfService = inject(SchemeDetailPdfService);

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

  /** Direct PDF download of the full scheme details (see SchemeDetailPdfService). */
  async generateOfficialPdf(): Promise<void> {
    await this.pdfService.generateOfficialPdf(this.scheme, this.annexures, this.requiredInfo);
    this.download.emit('Scheme Details PDF');
  }
}
