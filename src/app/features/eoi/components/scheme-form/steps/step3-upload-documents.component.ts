import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonComponent, IconComponent, InputDirective, TableColumn, TableComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import { EoiApplyDocument } from '../eoi-apply.model';
import { acceptOf, formatBytes, formatsOf } from '../eoi-apply.util';

/**
 * Upload Documents: the required documents and annexures configured on the EOI. Each file goes to
 * POST /eoi/apply/applications/{id}/documents/{requiredDocumentId}; the backend checks its type and size
 * (from Doc Master / Annexure Master) and answers with the updated application.
 */
@Component({
  selector: 'app-step3-upload-documents',
  standalone: true,
  imports: [ButtonComponent, IconComponent, InputDirective, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-6">

      @if (state.applyDocuments().supporting.length === 0 && state.applyDocuments().annexures.length === 0) {
        <p class="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center m-0">
          No documents are required for this EOI.
        </p>
      }

      @if (state.applyDocuments().supporting.length > 0) {
        <app-table
          [columns]="documentColumns"
          [data]="state.applyDocuments().supporting"
          [customTemplates]="{ name: nameTemplate, comment: commentTemplate, action: actionTemplate }"
        />
      }

      @if (state.applyDocuments().annexures.length > 0) {
        <app-table
          [columns]="annexureColumns"
          [data]="state.applyDocuments().annexures"
          [customTemplates]="{ name: nameTemplate, comment: commentTemplate, action: actionTemplate }"
        />
      }

      <ng-template #nameTemplate let-doc>
        <div class="py-1 min-w-0">
          <div class="text-[12.5px] font-medium text-slate-900 leading-tight">
            {{ doc.name }}@if (doc.isMandatory) { <span class="text-red-600 font-bold"> *</span> }
          </div>
          <div class="text-[11.5px] text-slate-500 mt-0.5">
            Supported: {{ formats(doc) }} &nbsp;|&nbsp; Max size: {{ doc.maxFileSizeMb }} MB
          </div>
          @if (doc.file; as file) {
            <span class="text-[11.5px] tabular-nums text-emerald-700 font-medium flex items-center gap-1.5 mt-1 truncate max-w-[320px]" [title]="file.fileName">
              <app-icon name="check-circle" size="xs" class="shrink-0" />
              <span class="truncate">{{ file.fileName }} ({{ size(file.sizeBytes) }})</span>
            </span>
          }
          @if (errorOf(doc); as message) {
            <p class="text-[11.5px] text-red-600 m-0 mt-1" role="alert">{{ message }}</p>
          }
        </div>
      </ng-template>

      <ng-template #commentTemplate let-doc>
        <input
          appInput
          size="sm"
          type="text"
          maxlength="500"
          placeholder="Add comment..."
          [attr.aria-label]="'Comment for ' + doc.name"
          [value]="doc.comment ?? ''"
          [disabled]="state.isDocBusy(doc)"
          (blur)="state.saveApplyComment(doc, $any($event.target).value)"
          class="w-full"
        />
      </ng-template>

      <ng-template #actionTemplate let-doc>
        <div class="flex items-center justify-center gap-1.5 flex-nowrap whitespace-nowrap">
          <input #fileInput type="file" class="hidden" [accept]="accept(doc)" (change)="onFileChange($event, doc)" />
          @if (!doc.file) {
            <button appButton size="sm" [loading]="state.isDocBusy(doc)" [disabled]="state.isDocBusy(doc)" (click)="fileInput.click()">Upload</button>
          } @else {
            <button appButton variant="ghost" size="sm" iconOnly (click)="state.viewApplyDocument(doc)" title="View Document" aria-label="View Document">
              <app-icon name="eye" size="sm" />
            </button>
            <button appButton variant="ghost" size="sm" iconOnly [disabled]="state.isDocBusy(doc)" (click)="fileInput.click()" title="Replace Document" aria-label="Replace Document">
              <app-icon name="refresh" size="sm" />
            </button>
            <button appButton variant="ghost" size="sm" iconOnly [disabled]="state.isDocBusy(doc)" (click)="state.removeApplyDocument(doc)" title="Remove Document" aria-label="Remove Document">
              <app-icon name="trash" size="sm" class="text-rose-600" />
            </button>
          }
        </div>
      </ng-template>

      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(state.hasCustomFields() ? state.stepIndexCustomFields() : state.stepIndexProfile)">
          &larr; Back
        </button>
        <button appButton size="lg" (click)="state.goToStep(state.stepIndexPreview())">
          Next &rarr;
        </button>
      </div>
    </div>
  `
})
export class Step3UploadDocumentsComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly documentColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: 'S. No.', align: 'center', width: 'w-14' },
    { key: 'name', label: 'Supporting Document', type: 'custom', width: 'min-w-[240px]' },
    { key: 'comment', label: 'Comment', type: 'custom', width: 'min-w-[200px] w-[250px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-[270px] whitespace-nowrap' }
  ];

  protected readonly annexureColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: 'S. No.', align: 'center', width: 'w-14' },
    { key: 'name', label: 'Annexure Name', type: 'custom', width: 'min-w-[240px]' },
    { key: 'comment', label: 'Comment', type: 'custom', width: 'min-w-[200px] w-[250px]' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center', width: 'w-[270px] whitespace-nowrap' }
  ];

  protected accept(doc: EoiApplyDocument): string {
    return acceptOf(doc);
  }

  protected formats(doc: EoiApplyDocument): string {
    return formatsOf(doc);
  }

  protected size(bytes: number): string {
    return formatBytes(bytes);
  }

  protected errorOf(doc: EoiApplyDocument): string {
    return doc.requiredDocumentId === null ? '' : this.state.docErrors()[doc.requiredDocumentId] ?? '';
  }

  protected onFileChange(event: Event, doc: EoiApplyDocument): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.state.uploadApplyDocument(doc, file);
  }
}
