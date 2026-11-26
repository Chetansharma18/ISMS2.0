import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, TableColumn, TableComponent } from '../../../../../shared';
import { OtrReviewComponent } from '../../../../registration/parts/otr-review.component';
import { SchemeFormState } from '../scheme-form.state';
import { EoiApplyDocument, EoiCustomField } from '../eoi-apply.model';
import { answerText, formatBytes } from '../eoi-apply.util';

/**
 * Complete Preview: everything the application holds on the backend (profile from the OTR, answers to the
 * EOI's questions, uploaded documents and annexures) and what is still missing before the fee steps.
 */
@Component({
  selector: 'app-step4-complete-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ButtonComponent, IconComponent, TableComponent, OtrReviewComponent],
  host: { class: 'block' },
  template: `
    <div class="space-y-6">

      @if (state.pendingBeforeFees().length > 0) {
        <div class="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900" role="alert">
          <p class="m-0 font-semibold mb-1">Complete these before paying the processing fee:</p>
          <ul class="m-0 pl-4 list-disc space-y-0.5">
            @for (item of state.pendingBeforeFees(); track item) { <li>{{ item }}</li> }
          </ul>
        </div>
      }

      <!-- 1. Registration profile (from the OTR) -->
      <section class="space-y-3">
        <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">Registration Profile</h2>
        @if (state.otrForm(); as form) {
          <app-otr-review
            [form]="form"
            [values]="state.profileValues()"
            [documents]="state.profileDocuments()"
            [readOnly]="true"
            (viewDocument)="state.viewProfileDocument($event)"
          />
        } @else {
          <p class="text-xs text-slate-500 italic m-0">The OTR form could not be loaded, so the profile cannot be shown.</p>
        }
      </section>

      <!-- 2. Answers to the EOI's questions -->
      @if (state.hasCustomFields()) {
        <section class="rounded-lg border border-[#D6E3F0] overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-[#D6E3F0]">
            <h2 class="text-[15px] font-semibold text-[#1E3A5F] m-0">EOI Form</h2>
            <button appButton variant="outline" size="sm" type="button" (click)="state.goToStep(state.stepIndexCustomFields())">
              <app-icon name="edit" size="sm" />
              <span>Edit</span>
            </button>
          </div>
          <dl class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 m-0">
            @for (field of state.schemeCustomFields(); track field.key) {
              <div class="min-w-0" [class.md:col-span-2]="field.type === 'textarea'">
                <dt class="text-[11.5px] font-medium text-slate-500">
                  {{ field.label }}@if (field.mandatory) { <span class="text-red-600"> *</span> }
                </dt>
                <dd class="m-0 text-[13px] text-slate-900 break-words">{{ answer(field) }}</dd>
              </div>
            }
          </dl>
        </section>
      }

      <!-- 3. Documents and annexures -->
      <section class="rounded-lg border border-[#D6E3F0] overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-[#D6E3F0]">
          <h2 class="text-[15px] font-semibold text-[#1E3A5F] m-0">Documents ({{ uploadedCount() }} / {{ totalCount() }} Uploaded)</h2>
          <button appButton variant="outline" size="sm" type="button" (click)="state.goToStep(state.stepIndexDocuments())">
            <app-icon name="edit" size="sm" />
            <span>Edit</span>
          </button>
        </div>
        <div class="p-4 space-y-4">
          @if (state.applyDocuments().supporting.length > 0) {
            <app-table
              [columns]="documentColumns"
              [data]="state.applyDocuments().supporting"
              [customTemplates]="{ name: nameTemplate, file: fileTemplate, status: statusTemplate, action: actionTemplate }"
            />
          }
          @if (state.applyDocuments().annexures.length > 0) {
            <app-table
              [columns]="annexureColumns"
              [data]="state.applyDocuments().annexures"
              [customTemplates]="{ name: nameTemplate, file: fileTemplate, status: statusTemplate, action: actionTemplate }"
            />
          }
          @if (totalCount() === 0) {
            <p class="text-xs text-slate-500 italic m-0">No documents are required for this EOI.</p>
          }
        </div>
      </section>

      <ng-template #nameTemplate let-doc>
        <span class="text-[12.5px] font-medium text-slate-900">{{ doc.name }}@if (doc.isMandatory) { <span class="text-red-600 font-bold"> *</span> }</span>
      </ng-template>
      <ng-template #fileTemplate let-doc>
        @if (doc.file; as file) {
          <span class="text-[12px] text-slate-700 break-all">{{ file.fileName }} <span class="text-slate-400 tabular-nums">({{ size(file.sizeBytes) }})</span></span>
        } @else {
          <span class="text-[12px] text-slate-400">-</span>
        }
      </ng-template>
      <ng-template #statusTemplate let-doc>
        @if (doc.file) {
          <span class="text-[11.5px] font-semibold text-emerald-700">Uploaded</span>
        } @else if (doc.isMandatory) {
          <span class="text-[11.5px] font-semibold text-rose-600">Missing</span>
        } @else {
          <span class="text-[11.5px] font-medium text-slate-400">Not uploaded</span>
        }
      </ng-template>
      <ng-template #actionTemplate let-doc>
        @if (doc.file) {
          <button appButton variant="ghost" size="sm" iconOnly (click)="state.viewApplyDocument(doc)" title="View Document" aria-label="View Document">
            <app-icon name="eye" size="sm" />
          </button>
        }
      </ng-template>

      <!-- Declaration (sent with Submit Application) -->
      <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-900">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            [ngModel]="state.declarationAgreed()"
            (ngModelChange)="state.declarationAgreed.set($event)"
            class="mt-1 w-4 h-4 text-navy border-amber-300 rounded focus:ring-navy accent-navy"
          />
          <div class="leading-relaxed">
            <span class="font-bold text-slate-900 block mb-0.5">Statutory Self-Declaration &amp; Undertaking:</span>
            <span class="text-slate-700">
              I/We hereby declare that all information furnished and documents submitted are true, authentic, and correct to the best of my knowledge and belief. I understand that any deliberate misrepresentation shall lead to immediate disqualification of the EOI application and forfeiture of the Earnest Money Deposit (EMD).
            </span>
          </div>
        </label>
      </div>

      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" (click)="state.goToStep(state.stepIndexDocuments())">
          &larr; Back to Upload Documents
        </button>
        <button appButton size="lg" (click)="state.goToStep(state.stepIndexProcFee())" [disabled]="!canProceed()">
          Proceed to Processing Fee Payment ({{ state.formattedProcessFee() }}) &rarr;
        </button>
      </div>
    </div>
  `
})
export class Step4CompletePreviewComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly documentColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Supporting Document', type: 'custom' },
    { key: 'file', label: 'File', type: 'custom' },
    { key: 'comment', label: 'Comment', cellClass: 'break-words' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];

  protected readonly annexureColumns: TableColumn<EoiApplyDocument>[] = [
    { key: '$index', label: '#', align: 'center', width: 'w-10' },
    { key: 'name', label: 'Annexure Name', type: 'custom' },
    { key: 'file', label: 'File', type: 'custom' },
    { key: 'comment', label: 'Comment', cellClass: 'break-words' },
    { key: 'status', label: 'Status', type: 'custom' },
    { key: 'action', label: 'Action', type: 'custom', align: 'center' }
  ];

  protected readonly totalCount = computed(() => this.state.application()?.documents.length ?? 0);
  protected readonly uploadedCount = computed(() => (this.state.application()?.documents ?? []).filter(d => !!d.file).length);

  /** The fee steps open once the backend has everything for steps 1-3 and the declaration is ticked. */
  protected readonly canProceed = computed(() => this.state.declarationAgreed() && this.state.pendingBeforeFees().length === 0);

  protected answer(field: EoiCustomField): string {
    return answerText(field, this.state.customFieldAnswers()[field.key]);
  }

  protected size(bytes: number): string {
    return formatBytes(bytes);
  }
}
