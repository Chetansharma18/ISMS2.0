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
            Uploaded Supporting Documents
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
            title="Download all verified supporting documents in a single ZIP file"
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
            class="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-navy hover:shadow-xs transition-all flex flex-col justify-between gap-2.5 text-xs cursor-pointer group"
            title="Click to view {{ doc.title }}"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <!-- Authentic Adobe Red PDF Badge -->
                <app-icon name="pdf-badge" solid size="auto" class="w-7 h-7 text-[#E5252A] select-none shrink-0 mt-0.5 group-hover:scale-105 transition-transform" />

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
              <button appButton variant="ghost" size="sm" iconOnly class="shrink-0" (click)="viewDocument.emit(doc); $event.stopPropagation()" title="View Document" aria-label="View Document">
                <app-icon name="eye" size="sm" />
              </button>
            </div>

            @if (doc.comment) {
              <div class="px-2.5 py-1.5 rounded bg-[#FCF8FA] border border-[#EADCE2] text-[11.5px] text-[#25212A] leading-snug">
                <span class="font-semibold text-[#7C0E44]">Comment:</span>
                <span class="ml-1 break-words">{{ doc.comment }}</span>
              </div>
            }
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
