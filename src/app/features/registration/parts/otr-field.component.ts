import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormInputComponent } from '../../../shared/components/form-controls/form-input/form-input.component';
import { FormSelectComponent, SelectItem } from '../../../shared/components/form-controls/form-select/form-select.component';
import { FormTextareaComponent } from '../../../shared/components/form-controls/form-textarea/form-textarea.component';
import { FormFileUploadComponent } from '../../../shared/components/form-controls/form-file-upload/form-file-upload.component';
import { OtrDocument, OtrFieldDef, OtrStepValues, OtrValue } from '../models/otr-api.model';
import { fieldOptions, isFieldCopied, isFieldRequired, toFileDoc } from '../otr-form.util';

/**
 * One field of the backend's OTR form definition, drawn with the kit form controls. It shows the value, the "*"
 * marker and the backend's error message; it never checks the value itself.
 */
@Component({
  selector: 'app-otr-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormInputComponent, FormSelectComponent, FormTextareaComponent, FormFileUploadComponent],
  template: `
    @let f = field();
    @switch (f.type) {
      @case ('textarea') {
        <app-form-textarea
          [label]="f.label"
          [value]="text()"
          (valueChange)="valueChange.emit($event)"
          [placeholder]="f.placeholder ?? ''"
          [required]="required()"
          [disabled]="locked()"
          [maxLength]="f.rules?.maxLength"
          [hint]="f.hint"
          [rows]="2"
          [error]="error()"
        />
      }
      @case ('select') {
        @if (freeText()) {
          <!-- No master list for the chosen parent (e.g. districts of a state not in the District Master): type it. -->
          <app-form-input
            [label]="f.label"
            [value]="text()"
            (valueChange)="valueChange.emit($event)"
            [placeholder]="'Enter ' + f.label.toLowerCase()"
            [required]="required()"
            [disabled]="locked()"
            [error]="error()"
          />
        } @else {
        <app-form-select
          [label]="f.label"
          [value]="text()"
          (valueChange)="valueChange.emit($event)"
          [items]="items()"
          [placeholder]="f.placeholder ?? 'Please select'"
          [required]="required()"
          [disabled]="locked()"
          [error]="error()"
        />
        }
      }
      @case ('multiselect') {
        <app-form-select
          [label]="f.label"
          [multiple]="true"
          [values]="list()"
          (valuesChange)="valueChange.emit($event)"
          [items]="items()"
          [placeholder]="f.placeholder ?? 'Please select'"
          [required]="required()"
          [disabled]="locked()"
          [error]="error()"
        />
      }
      @case ('checkbox') {
        <div class="py-3 px-4 bg-slate-50/70 border border-[#D6E3F0] rounded-lg">
          <label class="inline-flex items-center gap-2.5 text-sm font-medium text-[#334155] cursor-pointer select-none">
            <input
              type="checkbox"
              [checked]="value() === true"
              [disabled]="locked()"
              (change)="valueChange.emit($any($event.target).checked)"
              class="w-4.5 h-4.5 accent-[#8B104D] cursor-pointer"
            />
            <span>{{ f.label }}</span>
          </label>
          @if (error()) {
            <p class="text-[11px] text-rose-600 font-medium mt-1 mb-0">{{ error() }}</p>
          }
        </div>
      }
      @case ('file') {
        <app-form-file-upload
          [label]="f.label"
          [fileDoc]="fileDoc()"
          [accept]="f.accept ?? ''"
          [maxSizeMb]="f.maxSizeMb ?? 25"
          [required]="required()"
          [disabled]="disabled() || uploading()"
          [dropzoneStyle]="true"
          [uploadPrompt]="uploading() ? 'Uploading...' : undefined"
          [serverUpload]="true"
          [error]="error()"
          (fileSelected)="fileSelected.emit($event)"
          (removeRequested)="fileRemoved.emit()"
          (viewRequested)="fileViewed.emit()"
        />
      }
      @default {
        <app-form-input
          [label]="f.label"
          [value]="text()"
          (valueChange)="valueChange.emit($event)"
          [type]="inputType()"
          [placeholder]="f.placeholder ?? ''"
          [required]="required()"
          [disabled]="locked()"
          [uppercase]="f.transform === 'upper'"
          [maxLength]="f.type === 'number' ? undefined : f.rules?.maxLength"
          [min]="f.type === 'number' ? numberText(f.rules?.min) : undefined"
          [max]="f.type === 'number' ? numberText(f.rules?.max) : undefined"
          [hint]="f.hint"
          [error]="error()"
        />
      }
    }
  `
})
export class OtrFieldComponent {
  readonly field = input.required<OtrFieldDef>();
  /** All values of the step (conditions and dependent options read them). */
  readonly values = input.required<OtrStepValues>();
  readonly error = input<string | undefined>(undefined);
  readonly document = input<OtrDocument | undefined>(undefined);
  readonly disabled = input(false);
  readonly uploading = input(false);

  readonly valueChange = output<OtrValue>();
  readonly fileSelected = output<File>();
  readonly fileRemoved = output<void>();
  readonly fileViewed = output<void>();

  readonly value = computed(() => this.values()[this.field().key]);
  readonly text = computed(() => {
    const v = this.value();
    return typeof v === 'string' ? v : '';
  });
  readonly list = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? v : [];
  });
  readonly required = computed(() => isFieldRequired(this.field(), this.values()));
  /** Read-only while it mirrors another field ("same as registered address"), or when the form is locked. */
  readonly locked = computed(() => this.disabled() || isFieldCopied(this.field(), this.values()));
  readonly items = computed<SelectItem[]>(() => fieldOptions(this.field(), this.values()));
  readonly freeText = computed(() => {
    const f = this.field();
    return !!f.optionsByParent && !!f.dependsOn && !!this.values()[f.dependsOn] && this.items().length === 0;
  });
  readonly fileDoc = computed(() => toFileDoc(this.document()));
  readonly inputType = computed<'text' | 'email' | 'date' | 'tel' | 'number'>(() => {
    switch (this.field().type) {
      case 'email': return 'email';
      case 'date': return 'date';
      case 'tel': return 'tel';
      case 'number': return 'number';
      default: return 'text';
    }
  });

  numberText(value: number | undefined): string | undefined {
    return value === undefined ? undefined : String(value);
  }
}
