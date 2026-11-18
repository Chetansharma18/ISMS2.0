import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EoiFormData, EoiRequiredInfoItem } from '../tenders.models';
import { SchemeMasterItem, DocMasterItem } from '../../../core/models/admin-masters.model';
import { ButtonComponent, IconComponent, InputDirective, formatInr } from '../../../shared';

/**
 * Body of the "Configure New EOI / Edit EOI" modal.
 *
 * Edits the parent-owned `data` object in place through ngModel, so it stays on
 * Default change detection. Attachment / document list changes are delegated to
 * the parent via outputs.
 */
@Component({
  selector: 'app-configure-eoi-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
      {{ isEditing() ? 'Edit EOI Configuration' : 'Configure New EOI' }}
    </h2>
    <div class="mt-4 font-sans text-[13px] max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 sm:pr-3">
      <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] md:grid-cols-[200px_1fr] items-start sm:items-center gap-y-3 gap-x-4">
        <label class="text-slate-700 font-medium">EOI Reference No.*</label>
        <input appInput type="text" maxlength="100" [(ngModel)]="data().refNo" [invalid]="submitted() && !data().refNo" class="w-full" />
        
        <label class="text-slate-700 font-medium">Scheme*</label>
        <select
          appInput
          [(ngModel)]="data().scheme"
          (ngModelChange)="onSchemeChange($event)"
          [invalid]="submitted() && !data().scheme"
          class="w-full"
        >
          <option value="" disabled [selected]="!data().scheme">-- Select Scheme --</option>
          @for (name of schemeNameOptions(); track name) {
            <option [value]="name">{{ name }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">Scheme Category</label>
        <select appInput [(ngModel)]="data().schemeCategory" class="w-full">
          <option value="" [selected]="!data().schemeCategory">-- Select Scheme Category --</option>
          @for (cat of schemeCategoryOptions(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">Date of Eol Published*</label>
        <input appInput type="date" [(ngModel)]="data().publishedDate" [invalid]="submitted() && !data().publishedDate" class="w-full" />

        <label class="text-slate-700 font-medium">Last Date of Eol Submission*</label>
        <input appInput type="date" [(ngModel)]="data().submissionDate" [invalid]="submitted() && !data().submissionDate" class="w-full" />

        <label class="text-slate-700 font-medium">EOI Category*</label>
        <select appInput [(ngModel)]="data().eoiCategory" [invalid]="submitted() && !data().eoiCategory" class="w-full">
          <option value="" disabled [selected]="!data().eoiCategory">-- Select EOI Category --</option>
          @for (eoiCat of eoiCategoryOptions(); track eoiCat) {
            <option [value]="eoiCat">{{ eoiCat }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">EOI Description</label>
        <input appInput type="text" maxlength="100" [(ngModel)]="data().description" class="w-full" />

        <label class="text-slate-700 font-medium">EMD Fee*</label>
        <input appInput type="text" maxlength="100" [(ngModel)]="data().emdFee" [invalid]="submitted() && !data().emdFee" class="w-full" />

        <label class="text-slate-700 font-medium">Process Fee*</label>
        <input appInput type="text" maxlength="100" [(ngModel)]="data().processFee" [invalid]="submitted() && !data().processFee" class="w-full" />

        <label class="text-slate-700 font-medium self-start pt-1">Attach File*</label>
        <div class="space-y-2 overflow-hidden w-full">
          <div class="flex items-center gap-2">
            <button appButton variant="outline" size="sm" type="button" (click)="attach.emit()">
              <app-icon name="paperclip" [stroke]="2" class="transform -rotate-45" />
              <span>+ Attach Document</span>
            </button>
            <span class="text-[11px] text-slate-500 font-medium whitespace-nowrap">(Max file size: 25 MB)</span>
            @if (submitted() && data().attachments.length === 0) {
              <span class="text-xs text-red-500 font-medium">At least 1 attachment is required</span>
            }
          </div>

          <!-- List of added attachments -->
          @if (data().attachments.length > 0) {
            <div class="space-y-1.5 pt-1 max-w-full overflow-hidden">
              @for (att of data().attachments; track att.id; let idx = $index) {
                <div class="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs max-w-full overflow-hidden">
                  <div class="flex items-center gap-1.5 min-w-0 flex-1 pr-2 overflow-hidden">
                    <app-icon name="document" [stroke]="2" class="text-brand shrink-0" />
                    <span class="font-medium text-slate-800 truncate shrink-0 max-w-35" [title]="att.title">{{ att.title }}</span>
                    <span class="text-[11px] text-slate-500 truncate min-w-0">({{ att.fileName }})</span>
                  </div>
                  <button
                    appButton
                    variant="ghost"
                    size="sm"
                    iconOnly
                    type="button"
                    (click)="removeAttachment.emit(idx)"
                    class="shrink-0 ml-1"
                    title="Remove attachment"
                    aria-label="Remove attachment"
                  >
                    <app-icon name="close" size="sm" />
                  </button>
                </div>
              }
            </div>
          }
        </div>
        
        @if (fileError()) {
          <div class="col-span-1 sm:col-span-2 text-xs text-red-500 font-medium -mt-1">{{ fileError() }}</div>
        }
      </div>
    </div>
  `
})
export class ConfigureEoiFormComponent {
  /** Parent-owned form model, edited in place via ngModel. */
  readonly data = input.required<EoiFormData>();
  readonly submitted = input(false);
  readonly fileError = input('');
  readonly isEditing = input(false);
  readonly schemeNameOptions = input<string[]>([]);
  readonly schemeCategoryOptions = input<readonly string[]>([]);
  readonly eoiCategoryOptions = input<readonly string[]>([]);
  readonly requiredInfo = input<EoiRequiredInfoItem[]>([]);
  readonly schemeMasterItems = input<SchemeMasterItem[]>([]);
  readonly docMasterItems = input<DocMasterItem[]>([]);

  readonly schemeChange = output<string>();

  /** Open the "Upload Attachment" modal. */
  readonly attach = output<void>();
  readonly removeAttachment = output<number>();
  readonly addDocument = output<void>();
  readonly removeDocument = output<number>();

  onSchemeChange(schemeName: string): void {
    if (!schemeName) return;

    // 1. Auto-fill EMD Fee, Process Fee & Scheme Category from Scheme Master
    const schemeItem = this.schemeMasterItems().find(
      s => s.schemeName?.trim().toLowerCase() === schemeName.trim().toLowerCase()
    );
    if (schemeItem) {
      if (schemeItem.amount != null) {
        this.data().emdFee = formatInr(schemeItem.amount);
      }
      if (schemeItem.processFees != null) {
        this.data().processFee = formatInr(schemeItem.processFees);
      }
      if (schemeItem.schemeCategory) {
        this.data().schemeCategory = schemeItem.schemeCategory;
      }
    }

    // 2. Auto-fill required documents from Doc Master
    const docItem = this.docMasterItems().find(
      d => d.schemeName?.trim().toLowerCase() === schemeName.trim().toLowerCase()
    );
    if (docItem && docItem.documents) {
      const docs = docItem.documents
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);
      if (docs.length > 0) {
        this.data().documents = [...docs];
        this.data().documentFiles = {};
      }
    }

    this.schemeChange.emit(schemeName);
  }
}
