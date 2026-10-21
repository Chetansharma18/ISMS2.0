import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ShortfallRequest, ShortfallResponse, ShortfallSharedDoc } from '../../../core/models/tender.model';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import { FileDoc } from '../../registration/models/otr-form.model';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { ButtonComponent, InputDirective } from '../../../shared';
import { FormFileUploadComponent } from '../../../shared/components/form-controls/form-file-upload/form-file-upload.component';
import { formatDateMedium } from '../../../shared/utils';
import { isShortfallOverdue, isShortfallResponseComplete } from './tender-shortfall.util';

/** What the applicant submits for one shortfall notice. */
export interface ShortfallSubmission {
  shortfallId: string;
  response: ShortfallResponse;
}

/**
 * Reply form for a department revert (shortfall) notice: shows the notice and the files the
 * department shared, and asks the applicant for one upload per document requested.
 */
@Component({
  selector: 'app-shortfall-response-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, FormFileUploadComponent, ButtonComponent, InputDirective],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="true"
      accentBarClass="bg-amber-500"
      title="Shortfall Request"
      primaryLabel="Submit"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-2xl"
      [disablePrimary]="!canSubmit()"
      (primaryAction)="submit()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (request(); as req) {
        <div class="space-y-4 text-left text-xs max-h-[62vh] overflow-y-auto pr-1">
          <!-- Request details -->
          <div class="p-3.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 space-y-1.5">
            <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
              <span>Raised on {{ req.raisedOn }}</span>
              <span [class.text-rose-700]="overdue()">Respond by {{ req.dueDate }}</span>
            </div>
            <p class="m-0 text-xs leading-relaxed whitespace-pre-line">{{ req.remarks }}</p>
          </div>

          <!-- Files shared by the department -->
          @if (req.sharedDocs.length > 0) {
            <div class="space-y-2">
              <h4 class="m-0 text-xs font-semibold text-slate-800">Supporting Documents</h4>
              <ul class="m-0 p-0 list-none border border-slate-200 rounded-lg divide-y divide-slate-200 bg-white">
                @for (doc of req.sharedDocs; track doc.fileName) {
                  <li class="flex items-center justify-between gap-3 px-3 py-2">
                    <span class="min-w-0">
                      <span class="block font-medium text-slate-800 truncate">{{ doc.title }}</span>
                      <span class="block text-[11px] text-slate-500 truncate">{{ doc.fileName }} &bull; {{ doc.fileSize }}</span>
                    </span>
                    <button appButton variant="outline" size="sm" type="button" (click)="viewShared(doc)" class="shrink-0">
                      View
                    </button>
                  </li>
                }
              </ul>
            </div>
          }

          <!-- One upload per requested document -->
          <div class="space-y-3">
            <h4 class="m-0 text-xs font-semibold text-slate-800">Upload Documents</h4>
            @for (docTitle of req.requiredDocs; track docTitle) {
              <div class="p-3 border border-slate-200 rounded-lg bg-white">
                <app-form-file-upload
                  [label]="docTitle"
                  [required]="true"
                  [fileDoc]="uploads()[docTitle] ?? null"
                  (fileChange)="setUpload(docTitle, $event)"
                />
              </div>
            }
          </div>

          <!-- Remarks -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-800" for="shortfall-remarks">Remarks</label>
            <textarea
              appInput
              id="shortfall-remarks"
              rows="3"
              [value]="remarks()"
              (input)="remarks.set($any($event.target).value)"
              placeholder="Add a remark (optional)"
              class="w-full"
            ></textarea>
          </div>
        </div>
      }
    </app-action-modal>
  `
})
export class ShortfallResponseModalComponent {
  private readonly docViewer = inject(DocumentViewerService);

  readonly isOpen = input(false);
  readonly request = input<ShortfallRequest | null>(null);

  readonly submitted = output<ShortfallSubmission>();
  readonly close = output<void>();

  protected readonly uploads = signal<Record<string, FileDoc | null>>({});
  protected readonly remarks = signal('');

  protected readonly overdue = computed(() => {
    const req = this.request();
    return !!req && isShortfallOverdue(req);
  });

  protected readonly canSubmit = computed(() => {
    const req = this.request();
    return !!req && isShortfallResponseComplete(req, this.uploads());
  });

  constructor() {
    // Start every notice with an empty form.
    effect(() => {
      this.request();
      this.uploads.set({});
      this.remarks.set('');
    });
  }

  protected setUpload(docTitle: string, file: FileDoc | null): void {
    this.uploads.update(current => ({ ...current, [docTitle]: file }));
  }

  protected viewShared(doc: ShortfallSharedDoc): void {
    this.docViewer.openDocument(
      { fileName: doc.fileName, fileSize: doc.fileSize, uploadDate: 'Shared by department', status: 'uploaded' },
      doc.title
    );
  }

  protected submit(): void {
    const req = this.request();
    if (!req || !this.canSubmit()) return;
    const today = formatDateMedium(new Date(), '-');
    this.submitted.emit({
      shortfallId: req.id,
      response: {
        respondedOn: today,
        remarks: this.remarks().trim(),
        uploads: req.requiredDocs.map(requiredDoc => {
          const file = this.uploads()[requiredDoc]!;
          return { requiredDoc, fileName: file.fileName, fileSize: file.fileSize, uploadedOn: today };
        })
      }
    });
  }
}
