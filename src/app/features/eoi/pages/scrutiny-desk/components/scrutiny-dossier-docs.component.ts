import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import type { ApplicantResponse, DossierDocument } from '../../../services/eoi-state.service';

/** Uploaded proposal documents grid with the "Download All (ZIP)" action. */
@Component({
  selector: 'app-scrutiny-dossier-docs',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="border-t border-slate-200 mt-6 pt-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div class="flex items-center gap-2 flex-wrap">
          <h2 class="text-base font-bold text-slate-900 m-0">
            Uploaded Proposal Documents
          </h2>
          <span class="text-slate-500 font-normal text-xs sm:text-sm">
            ({{ applicant()?.uploadedDocuments?.length || 7 }} Documents Verified)
          </span>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <!-- Download All Documents in ZIP format -->
          <button
            appButton
            size="sm"
            class="shrink-0"
            [loading]="isDownloadingZip()"
            (click)="downloadZip.emit()"
            [disabled]="isDownloadingZip() || !applicant()?.uploadedDocuments?.length"
            title="Download all verified proposal documents in a single ZIP file"
          >
            @if (isDownloadingZip()) {
              <span>Creating ZIP...</span>
            } @else {
              <app-icon name="upload" size="sm" />
              <span>Download All (ZIP)</span>
            }
          </button>
        </div>
      </div>

      <!-- Document Cards Grid (Image 4 Style with Red PDF Icon & Clean Layout) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-2">
        @for (doc of applicant()?.uploadedDocuments; track doc.id; let idx = $index) {
          <div
            (click)="viewDocument.emit(doc)"
            class="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-navy hover:shadow-xs transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group"
            title="Click to view {{ doc.title }}"
          >
            <div class="flex items-start gap-3 min-w-0">
              <!-- Red PDF Icon matching Image 4 -->
              <div class="w-8 h-8 rounded bg-[#D92D20] flex items-center justify-center text-white text-[10px] font-bold tracking-tight shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                PDF
              </div>

              <div class="min-w-0">
                <span class="font-semibold text-slate-900 group-hover:text-navy transition-colors block text-[13px] leading-snug truncate" [title]="doc.title">
                  {{ doc.title }}
                </span>
                <span class="text-[11px] text-slate-500 mt-0.5 block">
                  PDF ({{ doc.fileSize }}) &bull; <span class="text-emerald-700 font-medium">Verified</span>
                </span>
              </div>
            </div>

            <!-- View Document Button -->
            <button appButton variant="secondary" size="sm" class="shrink-0" (click)="viewDocument.emit(doc); $event.stopPropagation()">View</button>
          </div>
        }
      </div>
    </div>
  `
})
export class ScrutinyDossierDocsComponent {
  readonly applicant = input<ApplicantResponse | undefined>();
  readonly isDownloadingZip = input<boolean>(false);
  readonly viewDocument = output<DossierDocument>();
  readonly downloadZip = output<void>();
}
