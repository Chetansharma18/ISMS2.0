import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { OtrDocument, OtrErrorMap, OtrFieldDef, OtrFormDef, OtrStepDef, OtrStepValues } from '../models/otr-api.model';
import { displayValue, formSteps, formatFileSize, isFieldVisible } from '../otr-form.util';

interface ReviewRow {
  field: OtrFieldDef;
  text: string;
  document?: OtrDocument;
  error?: string;
}

interface ReviewSection {
  title: string;
  rows: ReviewRow[];
}

interface ReviewStep {
  step: OtrStepDef;
  sections: ReviewSection[];
  errorCount: number;
}

/** "Preview & Submit": every answer of the form steps, the documents and the declaration. */
@Component({
  selector: 'app-otr-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  template: `
    <div class="space-y-5">
      @for (item of review(); track item.step.key) {
        <section class="rounded-lg border border-[#D6E3F0] overflow-hidden">
          <div class="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-[#D6E3F0]">
            <h3 class="text-[15px] font-semibold text-[#1E3A5F] m-0">
              {{ item.step.number }}. {{ item.step.title }}
              @if (item.errorCount > 0) {
                <span class="ml-2 text-xs font-semibold text-rose-600">{{ item.errorCount }} to correct</span>
              }
            </h3>
            @if (!readOnly()) {
              <button appButton variant="outline" size="sm" type="button" (click)="editStep.emit(item.step.number)">
                <app-icon name="edit" size="sm" />
                <span>Edit</span>
              </button>
            }
          </div>

          <div class="p-4 space-y-4">
            @for (section of item.sections; track section.title) {
              <div>
                <h4 class="text-[13px] font-semibold text-slate-700 m-0 mb-2">{{ section.title }}</h4>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 m-0">
                  @for (row of section.rows; track row.field.key) {
                    <div class="min-w-0" [class.md:col-span-2]="(row.field.colSpan ?? 1) > 1">
                      <dt class="text-[11.5px] font-medium text-slate-500">{{ row.field.label }}</dt>
                      <dd class="m-0 text-[13px] text-slate-900 break-words">
                        @if (row.field.type === 'file') {
                          @if (row.document; as doc) {
                            <span class="inline-flex items-center gap-2 flex-wrap">
                              <span class="font-medium">{{ doc.fileName }}</span>
                              @if (doc.sizeBytes) {
                                <span class="text-[11px] text-slate-500 tabular-nums">{{ size(doc.sizeBytes) }}</span>
                              }
                              <button appButton variant="ghost" size="sm" type="button" (click)="viewDocument.emit(row.field.key)">
                                <app-icon name="eye" size="sm" />
                                <span>View</span>
                              </button>
                            </span>
                          } @else {
                            <span class="text-slate-400">Not uploaded</span>
                          }
                        } @else {
                          {{ row.text || '-' }}
                        }
                      </dd>
                      @if (row.error) {
                        <p class="text-[11px] text-rose-600 font-medium mt-0.5 mb-0">{{ row.error }}</p>
                      }
                    </div>
                  }
                </dl>
              </div>
            }
          </div>
        </section>
      }

      @if (declaration()) {
        <div class="p-4 rounded-lg border border-[#D6E3F0] bg-slate-50/70">
          <label class="flex items-start gap-2.5 text-[13px] text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              class="mt-0.5 w-4.5 h-4.5 accent-[#8B104D] cursor-pointer shrink-0"
              [checked]="accepted()"
              [disabled]="readOnly()"
              (change)="acceptedChange.emit($any($event.target).checked)"
            />
            <span>{{ declaration() }}</span>
          </label>
          @if (declarationError()) {
            <p class="text-[11px] text-rose-600 font-medium mt-1.5 mb-0">{{ declarationError() }}</p>
          }
        </div>
      }
    </div>
  `
})
export class OtrReviewComponent {
  readonly form = input.required<OtrFormDef>();
  /** Answers per step key. */
  readonly values = input.required<Record<string, OtrStepValues>>();
  readonly documents = input<Record<string, OtrDocument>>({});
  readonly errors = input<OtrErrorMap>({});
  readonly declaration = input<string | undefined>(undefined);
  readonly accepted = input(false);
  readonly declarationError = input<string | undefined>(undefined);
  readonly readOnly = input(false);

  readonly editStep = output<number>();
  readonly viewDocument = output<string>();
  readonly acceptedChange = output<boolean>();

  readonly review = computed<ReviewStep[]>(() => {
    const all = this.values();
    const docs = this.documents();
    const errors = this.errors();
    return formSteps(this.form()).map(step => {
      const values = all[step.key] ?? {};
      const stepErrors = errors[step.key] ?? {};
      const sections = step.sections
        .map(section => ({
          title: section.group ? `${section.group} - ${section.title}` : section.title,
          rows: section.fields
            .filter(f => isFieldVisible(f, values))
            .map(field => ({
              field,
              text: field.type === 'file' ? '' : displayValue(field, values[field.key], values),
              document: field.type === 'file' ? docs[field.key] : undefined,
              error: stepErrors[field.key]
            }))
        }))
        .filter(s => s.rows.length > 0);
      return { step, sections, errorCount: Object.keys(stepErrors).length };
    });
  });

  size(bytes: number): string {
    return formatFileSize(bytes);
  }
}
