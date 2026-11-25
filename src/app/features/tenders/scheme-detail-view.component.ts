import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchemeTender, EoiDocumentItem, EoiRequiredInfoItem } from './tenders.models';
import { SchemeDetailPdfService } from './scheme-detail-view/scheme-detail-pdf.service';
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
        (apply)="onApply()"
      ></app-scheme-detail-toolbar>

      <!-- 2. SCHEME TITLE & DESCRIPTION -->
      <div class="mt-4">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
          {{ scheme.schemeTitle || scheme.schemeName }}
        </h1>
        <p class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">
          {{ scheme.eoiDescription }}
        </p>
      </div>

      <!-- 3. TWO 2-COLUMN TABLES: SCHEME DETAILS & SCHEME DOCUMENTS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4 items-stretch">
        <!-- Table 1: Scheme Details -->
        <app-scheme-detail-summary [scheme]="scheme"></app-scheme-detail-summary>

        <!-- Table 2: Scheme Documents (PDF) -->
        <app-scheme-documents-panel
          [docs]="rfpDocs"
          (view)="download.emit($event)"
        ></app-scheme-documents-panel>
      </div>

      <!-- Custom form fields configured on the EOI (Publish Details / Uploading Details) -->
      @if (customFields.length > 0) {
        <div class="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <div class="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200">
            <h3 class="text-sm font-bold text-slate-900 m-0">Additional Form Fields</h3>
          </div>
          <div class="divide-y divide-slate-200 text-xs sm:text-[13px]">
            @for (f of customFields; track $index) {
              <div class="grid grid-cols-12">
                <div class="col-span-5 px-4 py-2.5 font-medium text-slate-900">
                  {{ f.label || 'Untitled Field' }}
                  @if (f.mandatory) { <span class="text-rose-600">*</span> }
                </div>
                <div class="col-span-7 px-4 py-2.5 text-slate-600">{{ f.section }} &middot; {{ f.type }}</div>
              </div>
            }
          </div>
        </div>
      }

      <!-- 4. ANNEXURES (DROPDOWN ACCORDION) -->
      <div class="mt-4">
        <app-scheme-annexures-list [annexures]="annexures"></app-scheme-annexures-list>
      </div>

      <!-- 5. REQUIRED SUPPORTING DOCUMENTS (DROPDOWN ACCORDION) -->
      <div class="mt-3">
        <app-required-documents-list [requiredInfo]="requiredInfo"></app-required-documents-list>
      </div>

    </div>
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

  /** Custom fields added on the Configure EOI form, with the step they were added on. */
  get customFields(): { label: string; type: string; mandatory: boolean; section: string }[] {
    const row = (section: string) => (f: { label?: string; type?: string; mandatory?: boolean }) => ({
      label: f.label ?? '', type: f.type ?? '', mandatory: !!f.mandatory, section
    });
    return [
      ...(this.scheme.publishFields ?? []).map(row('Publish Details')),
      ...(this.scheme.uploadFields ?? []).map(row('Uploading Details'))
    ];
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
