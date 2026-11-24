import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EoiAttachment, EoiDocumentUpload, EoiFormData, EoiRequiredInfoItem } from '../tenders.models';
import { SchemeMasterItem, DocMasterItem, AnnexureMasterItem } from '../../../core/models/admin-masters.model';
import { INITIAL_DOC_ITEMS } from '../../admin-master/doc-master.component';
import { INITIAL_ANNEXURE_ITEMS } from '../../admin-master/annexure-master.component';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import { ButtonComponent, DropdownComponent, IconComponent, InputDirective, formatInr } from '../../../shared';
import {
  formatBytes,
  getTodayKolkataDate,
  parseFeeNumber,
  parseMasterEntriesByScheme,
  validateEoiFormComplete,
  validateUploadFile
} from './tenders-page.util';

/**
 * Body of the "Configure New EOI / Edit EOI" form screen.
 *
 * Implements government portal standard validation, dynamic dependent auto-fill,
 * real-time duplicate checks, date-picker boundaries, and inline error handling.
 */
@Component({
  selector: 'app-configure-eoi-form',
  standalone: true,
  imports: [FormsModule, ButtonComponent, DropdownComponent, IconComponent, InputDirective],
  host: { class: 'block' },
  template: `
    <div class="w-full space-y-6 font-sans text-[13px]">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-4.5 pt-1">

        <!-- Row 1, Col 1: EOI Reference No. * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiRefNoInput">
            EOI Reference No. <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            id="eoiRefNoInput"
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. RSLDC/EOI/2026-27/01"
            [(ngModel)]="data().refNo"
            (blur)="onRefNoBlur()"
            (ngModelChange)="onFieldChange('refNo')"
            [invalid]="hasError('refNo')"
            class="w-full"
          />
          @if (hasError('refNo')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('refNo') }}</p>
          }
        </div>

        <!-- Row 1, Col 2: Scheme * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiSchemeSelect">
            Scheme <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <app-dropdown
            inputId="eoiSchemeSelect"
            [options]="schemeNameOptions()"
            [value]="data().scheme"
            (valueChange)="onSchemeChange($event)"
            placeholder="-- Select Scheme --"
            [invalid]="hasError('scheme')"
          />
          @if (hasError('scheme')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('scheme') }}</p>
          }
        </div>

        <!-- Row 2, Col 1: Scheme Category -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiSchemeCategorySelect">
            Scheme Category
          </label>
          <app-dropdown
            inputId="eoiSchemeCategorySelect"
            [options]="availableSchemeCategoryOptions()"
            [value]="data().schemeCategory"
            (valueChange)="data().schemeCategory = $event; onFieldChange('schemeCategory')"
            [disabled]="isCategoryLocked()"
            [placeholder]="data().scheme ? '-- Select Scheme Category --' : 'Auto-filled from Scheme'"
            [invalid]="hasError('schemeCategory')"
          />
          @if (hasError('schemeCategory')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('schemeCategory') }}</p>
          }
        </div>

        <!-- Row 2, Col 2: EOI Category * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiCategorySelect">
            EOI Category <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <app-dropdown
            inputId="eoiCategorySelect"
            [options]="eoiCategoryOptions()"
            [value]="data().eoiCategory"
            (valueChange)="data().eoiCategory = $event; onFieldChange('eoiCategory')"
            placeholder="-- Select EOI Category --"
            [invalid]="hasError('eoiCategory')"
          />
          @if (hasError('eoiCategory')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('eoiCategory') }}</p>
          }
        </div>

        <!-- Row 3, Col 1: Date of EOI Published * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiPublishedDateInput">
            Date of EOI Published <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            id="eoiPublishedDateInput"
            appInput
            type="date"
            [max]="todayKolkata"
            [(ngModel)]="data().publishedDate"
            (blur)="onBlur('publishedDate')"
            (ngModelChange)="onPublishedDateChange($event)"
            [invalid]="hasError('publishedDate')"
            class="w-full"
          />
          @if (hasError('publishedDate')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('publishedDate') }}</p>
          }
        </div>

        <!-- Row 3, Col 2: Last Date of EOI Submission * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiSubmissionDateInput">
            Last Date of EOI Submission <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            id="eoiSubmissionDateInput"
            appInput
            type="date"
            [min]="minSubmissionDate()"
            [max]="maxSubmissionDate()"
            [(ngModel)]="data().submissionDate"
            (blur)="onBlur('submissionDate')"
            (ngModelChange)="onFieldChange('submissionDate')"
            [invalid]="hasError('submissionDate')"
            class="w-full"
          />
          @if (hasError('submissionDate')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('submissionDate') }}</p>
          }
        </div>

        <!-- Row 4, Col 1: EOI Duration (in Years) * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiDurationInput">
            EOI Duration (in Years) <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <div class="relative w-full">
            <input
              id="eoiDurationInput"
              appInput
              type="number"
              min="1"
              max="15"
              step="1"
              placeholder="e.g. 2"
              [(ngModel)]="data().eoiDurationValue"
              (blur)="onBlur('eoiDurationValue')"
              (ngModelChange)="onFieldChange('eoiDurationValue')"
              [invalid]="hasError('eoiDurationValue')"
              class="w-full pr-16"
            />
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              Years
            </span>
          </div>
          @if (hasError('eoiDurationValue')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('eoiDurationValue') }}</p>
          }
        </div>

        <!-- Row 4, Col 2: EOI Description -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-slate-700 font-medium" for="eoiDescriptionInput">
              EOI Description
            </label>
            <span class="text-xs text-slate-400 font-normal">
              {{ (data().description || '').length }}/250
            </span>
          </div>
          <textarea
            id="eoiDescriptionInput"
            appInput
            rows="2"
            maxlength="250"
            placeholder="Brief description of the EOI"
            [(ngModel)]="data().description"
            (blur)="onBlur('description')"
            (ngModelChange)="onFieldChange('description')"
            [invalid]="hasError('description')"
            class="w-full resize-none"
          ></textarea>
          @if (hasError('description')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('description') }}</p>
          }
        </div>

        <!-- Row 5, Col 1: EMD Fee * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiEmdFeeInput">
            EMD Fee <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            id="eoiEmdFeeInput"
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. ₹50,000"
            [(ngModel)]="data().emdFee"
            (blur)="onFeeBlur('emdFee')"
            (ngModelChange)="onFieldChange('emdFee')"
            [invalid]="hasError('emdFee')"
            class="w-full"
          />
          @if (hasError('emdFee')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('emdFee') }}</p>
          }
        </div>

        <!-- Row 5, Col 2: Process Fee * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5" for="eoiProcessFeeInput">
            Process Fee <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            id="eoiProcessFeeInput"
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. ₹10,000"
            [(ngModel)]="data().processFee"
            (blur)="onFeeBlur('processFee')"
            (ngModelChange)="onFieldChange('processFee')"
            [invalid]="hasError('processFee')"
            class="w-full"
          />
          @if (hasError('processFee')) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">{{ getError('processFee') }}</p>
          }
        </div>
      </div>

      <!-- ====================================================================
           EOI DOCUMENTS (Matching Design exactly)
           ==================================================================== -->
      <section class="space-y-3 pt-4 border-t border-[#E8EEF5]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[#7C0E44] font-bold text-sm tracking-wide m-0">Supporting Documents</h3>
            <p class="text-xs text-slate-500 mt-1 mb-0">Required documents for proposal upload (Upload PDF, image, or TXT - max 25 MB)</p>
          </div>
          <button
            appButton
            variant="primary"
            size="sm"
            iconOnly
            type="button"
            (click)="addDocument.emit()"
            title="Add Document"
            aria-label="Add Document"
          >
            <app-icon name="plus" size="xs" />
          </button>
        </div>

        @if (data().documents.length === 0) {
          <div class="text-[13px] text-slate-500 italic py-6 px-4 text-center border border-dashed border-[#CBD5E1] rounded-lg bg-slate-50/40">
            Select a scheme above to automatically load required documents from Doc Master, or click + to add manually.
          </div>
        } @else {
          <div class="space-y-2 mt-2">
            @for (doc of data().documents; track $index; let idx = $index) {
              <div class="space-y-1">
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span class="text-xs font-semibold text-slate-500 w-5 text-center shrink-0">{{ idx + 1 }}.</span>
                  <div class="flex-1 min-w-0">
                    <app-dropdown
                      [options]="getAvailableOptionsForIndex(idx)"
                      [(value)]="data().documents[idx]"
                      (valueChange)="onDocChange(idx)"
                      placeholder="-- Select Document Required --"
                      size="sm"
                      direction="up"
                      [overlay]="true"
                      [invalid]="hasDocError(idx)"
                      class="w-full"
                    />
                  </div>

                  @if (isDocMandatory(data().documents[idx])) {
                    <span
                      class="text-[11px] font-semibold text-slate-600 bg-slate-200/70 border border-slate-300 px-2 py-1 rounded shrink-0"
                      title="Mandatory document requirements cannot be removed."
                    >
                      Mandatory
                    </span>
                  } @else {
                    <button
                      appButton
                      variant="ghost"
                      size="sm"
                      iconOnly
                      type="button"
                      (click)="removeDocument.emit(idx)"
                      class="shrink-0"
                      title="Remove Document"
                      aria-label="Remove Document"
                    >
                      <app-icon name="close" size="xs" />
                    </button>
                  }
                </div>
                @if (hasDocError(idx)) {
                  <p class="text-xs text-red-500 font-medium m-0 ml-7">{{ getDocError(idx) }}</p>
                }
              </div>
            }
          </div>
        }
      </section>

      <!-- ====================================================================
           EOI ANNEXURES (Matching Supporting Documents exactly)
           ==================================================================== -->
      <section class="space-y-3 pt-4 border-t border-[#E8EEF5]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[#7C0E44] font-bold text-sm tracking-wide m-0">Annexures</h3>
            <p class="text-xs text-slate-500 mt-1 mb-0">Prescribed annexure formats for EOI submission (Upload PDF - max 25 MB)</p>
          </div>
          <button
            appButton
            variant="primary"
            size="sm"
            iconOnly
            type="button"
            (click)="addAnnexure.emit()"
            title="Add Annexure"
            aria-label="Add Annexure"
          >
            <app-icon name="plus" size="xs" />
          </button>
        </div>

        @if (!data().annexures || data().annexures.length === 0) {
          <div class="text-[13px] text-slate-500 italic py-6 px-4 text-center border border-dashed border-[#CBD5E1] rounded-lg bg-slate-50/40">
            Select a scheme above to automatically load annexures from Annexure Master, or click + to add manually.
          </div>
        } @else {
          <div class="space-y-2 mt-2">
            @for (ann of data().annexures; track $index; let idx = $index) {
              <div class="space-y-1">
                <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span class="text-xs font-semibold text-slate-500 w-5 text-center shrink-0">{{ idx + 1 }}.</span>
                  <div class="flex-1 min-w-0">
                    <app-dropdown
                      [options]="getAvailableAnnexureOptionsForIndex(idx)"
                      [(value)]="data().annexures[idx]"
                      (valueChange)="onAnnexureChange(idx)"
                      placeholder="-- Select Annexure Format --"
                      size="sm"
                      direction="up"
                      [overlay]="true"
                      [invalid]="hasAnnexureError(idx)"
                      class="w-full"
                    />
                  </div>

                  @if (isAnnexureMandatory(data().annexures[idx])) {
                    <span
                      class="text-[11px] font-semibold text-slate-600 bg-slate-200/70 border border-slate-300 px-2 py-1 rounded shrink-0"
                      title="Mandatory annexure formats cannot be removed."
                    >
                      Mandatory
                    </span>
                  } @else {
                    <button
                      appButton
                      variant="ghost"
                      size="sm"
                      iconOnly
                      type="button"
                      (click)="removeAnnexure.emit(idx)"
                      class="shrink-0"
                      title="Remove Annexure"
                      aria-label="Remove Annexure"
                    >
                      <app-icon name="close" size="xs" />
                    </button>
                  }
                </div>
                @if (hasAnnexureError(idx)) {
                  <p class="text-xs text-red-500 font-medium m-0 ml-7">{{ getAnnexureError(idx) }}</p>
                }
              </div>
            }
          </div>
        }
      </section>
    </div>
  `
})
export class ConfigureEoiFormComponent {
  private readonly docViewer = inject(DocumentViewerService);
  private readonly objectUrls = new WeakMap<File, string>();

  /** Current Indian Standard Time (Asia/Kolkata) date for date boundary constraints. */
  readonly todayKolkata = getTodayKolkataDate();

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
  readonly annexureMasterItems = input<AnnexureMasterItem[]>([]);
  readonly existingRefNos = input<string[]>([]);
  readonly currentRefNo = input<string | null>(null);
  readonly externalVersion = input<number>(0);

  readonly schemeChange = output<string>();
  readonly formChange = output<void>();

  /** Open the "Upload Attachment" modal. */
  readonly attach = output<void>();
  readonly removeAttachment = output<number>();
  readonly addDocument = output<void>();
  readonly removeDocument = output<number>();
  readonly addAnnexure = output<void>();
  readonly removeAnnexure = output<number>();

  readonly docFileError = signal<string>('');

  /** Reactive version counter ensuring computed validation re-evaluates on any in-place mutation. */
  readonly formVersion = signal<number>(0);

  constructor() {
    // When master data loads or if a scheme is already selected (e.g. from draft or props)
    // and documents / annexures are empty, auto-populate them from Doc Master & Annexure Master!
    effect(() => {
      const scheme = this.data()?.scheme;
      if (!scheme) return;
      const docMaster = this.docMasterItems();
      const annexMaster = this.annexureMasterItems();

      const masterList = docMaster.length > 0 ? docMaster : INITIAL_DOC_ITEMS;
      const annexList = annexMaster.length > 0 ? annexMaster : INITIAL_ANNEXURE_ITEMS;

      let mutated = false;
      if (!this.data().documents || this.data().documents.length === 0) {
        const docs = parseMasterEntriesByScheme(masterList, scheme, d => d.docName || d.documents);
        if (docs.length > 0) {
          this.data().documents = [...docs];
          mutated = true;
        }
      }

      if (!this.data().annexures || this.data().annexures.length === 0) {
        const anns = parseMasterEntriesByScheme(annexList, scheme, a => a.annexureName || a.annexures);
        if (anns.length > 0) {
          this.data().annexures = [...anns];
          mutated = true;
        }
      }

      if (mutated) {
        this.formVersion.update(v => v + 1);
        this.formChange.emit();
      }
    });
  }

  /** Tracking touched state per field for clean UX blur-based error display. */
  readonly touchedFields = signal<Record<string, boolean>>({});
  readonly touchedDocFields = signal<Record<number, boolean>>({});
  readonly touchedAnnexureFields = signal<Record<number, boolean>>({});

  /** Minimum date selectable for submission deadline (publication date or today). */
  readonly minSubmissionDate = computed(() => {
    this.formVersion();
    this.externalVersion();
    const pub = this.data()?.publishedDate;
    return pub ? pub : this.todayKolkata;
  });

  /** Maximum permitted submission date (within 1 year of publication date). */
  readonly maxSubmissionDate = computed(() => {
    this.formVersion();
    this.externalVersion();
    const base = this.data()?.publishedDate || this.todayKolkata;
    const parts = base.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10) + 1;
      return `${y}-${parts[1]}-${parts[2]}`;
    }
    return '2099-12-31';
  });

  /** Available options for Scheme Category (empty when no scheme is selected). */
  readonly availableSchemeCategoryOptions = computed(() => {
    this.formVersion();
    this.externalVersion();
    const schemeName = this.data()?.scheme?.trim();
    if (!schemeName) return [];
    return this.schemeCategoryOptions();
  });

  /** Whether the Scheme Category is locked (locked when no scheme is selected or when auto-filled from scheme master). */
  readonly isCategoryLocked = computed(() => {
    this.formVersion();
    this.externalVersion();
    const schemeName = this.data()?.scheme?.trim().toLowerCase();
    if (!schemeName) return true;
    const match = this.schemeMasterItems().find(
      s => s.schemeName?.trim().toLowerCase() === schemeName
    );
    return !!match?.schemeCategory || !!this.data()?.schemeCategory;
  });

  /** Real-time form validation state using government standards. */
  readonly validation = computed(() => {
    this.formVersion();
    this.externalVersion();
    return validateEoiFormComplete(this.data(), {
      existingRefNos: this.existingRefNos(),
      currentRefNo: this.currentRefNo(),
      activeSchemeNames: this.schemeNameOptions(),
      activeEoiCategories: [...this.eoiCategoryOptions()],
      schemeMasterItems: this.schemeMasterItems(),
      todayStr: this.todayKolkata
    });
  });

  readonly availableDocumentOptions = computed(() => {
    this.formVersion();
    this.externalVersion();
    const set = new Set<string>();
    const masterList = this.docMasterItems().length > 0 ? this.docMasterItems() : INITIAL_DOC_ITEMS;

    masterList.forEach(item => {
      const name = item.docName || item.documents;
      if (name) {
        name.split(',').forEach(d => {
          const trimmed = d.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });

    (this.data()?.documents || []).forEach(doc => {
      if (doc?.trim()) set.add(doc.trim());
    });

    return Array.from(set);
  });

  getAvailableOptionsForIndex(idx: number): string[] {
    const allOptions = this.availableDocumentOptions();
    const currentVal = (this.data().documents[idx] || '').trim().toLowerCase();
    const otherSelected = new Set(
      this.data()
        .documents.filter((d, i) => i !== idx && d && d.trim())
        .map(d => d.trim().toLowerCase())
    );
    return allOptions.filter(
      opt => opt.trim().toLowerCase() === currentVal || !otherSelected.has(opt.trim().toLowerCase())
    );
  }

  isDocMandatory(docName?: string): boolean {
    if (!docName) return false;
    const schemeName = this.data()?.scheme?.trim().toLowerCase();
    if (!schemeName) return false;
    const masterList = this.docMasterItems().length > 0 ? this.docMasterItems() : INITIAL_DOC_ITEMS;
    return masterList.some(d => {
      const name = (d.docName || d.documents || '').trim().toLowerCase();
      if (!name || (name !== docName.trim().toLowerCase() && !name.includes(docName.trim().toLowerCase()))) return false;
      if (Array.isArray(d.schemes)) {
        return d.schemes.some(s => {
          const lower = s.trim().toLowerCase();
          return lower === schemeName || lower.includes(schemeName) || schemeName.includes(lower);
        });
      }
      const s = (d.schemeName || '').trim().toLowerCase();
      return s === schemeName || s.includes(schemeName) || schemeName.includes(s);
    });
  }

  readonly availableAnnexureOptions = computed(() => {
    this.formVersion();
    this.externalVersion();
    const set = new Set<string>();
    const masterList = this.annexureMasterItems().length > 0 ? this.annexureMasterItems() : INITIAL_ANNEXURE_ITEMS;

    masterList.forEach(item => {
      const name = item.annexureName || item.annexures;
      if (name) {
        name.split(',').forEach(a => {
          const trimmed = a.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });

    (this.data()?.annexures || []).forEach(ann => {
      if (ann?.trim()) set.add(ann.trim());
    });

    return Array.from(set);
  });

  getAvailableAnnexureOptionsForIndex(idx: number): string[] {
    const allOptions = this.availableAnnexureOptions();
    const currentVal = (this.data().annexures?.[idx] || '').trim().toLowerCase();
    const otherSelected = new Set(
      (this.data().annexures || [])
        .filter((a, i) => i !== idx && a && a.trim())
        .map(a => a.trim().toLowerCase())
    );
    return allOptions.filter(
      opt => opt.trim().toLowerCase() === currentVal || !otherSelected.has(opt.trim().toLowerCase())
    );
  }

  isAnnexureMandatory(annexureName?: string): boolean {
    if (!annexureName) return false;
    const schemeName = this.data()?.scheme?.trim().toLowerCase();
    if (!schemeName) return false;
    const masterList = this.annexureMasterItems().length > 0 ? this.annexureMasterItems() : INITIAL_ANNEXURE_ITEMS;
    return masterList.some(a => {
      const name = (a.annexureName || a.annexures || '').trim().toLowerCase();
      if (!name || (name !== annexureName.trim().toLowerCase() && !name.includes(annexureName.trim().toLowerCase()))) return false;
      if (Array.isArray(a.schemes)) {
        return a.schemes.some(s => {
          const lower = s.trim().toLowerCase();
          return lower === schemeName || lower.includes(schemeName) || schemeName.includes(lower);
        });
      }
      const s = (a.schemeName || '').trim().toLowerCase();
      return s === schemeName || s.includes(schemeName) || schemeName.includes(s);
    });
  }

  private notifyMutation(field?: string): void {
    if (field) {
      this.touchedFields.update(t => ({ ...t, [field]: true }));
    }
    this.formVersion.update(v => v + 1);
    this.formChange.emit();
  }

  onBlur(field: string): void {
    this.notifyMutation(field);
  }

  onRefNoBlur(): void {
    if (this.data()?.refNo) {
      this.data().refNo = this.data().refNo.trim();
    }
    this.notifyMutation('refNo');
  }

  onFeeBlur(field: 'emdFee' | 'processFee'): void {
    const current = this.data()[field];
    if (current) {
      const num = parseFeeNumber(current);
      if (!isNaN(num) && num >= 0) {
        this.data()[field] = formatInr(num);
      }
    }
    this.notifyMutation(field);
  }

  onFieldChange(field: string): void {
    this.notifyMutation(field);
  }

  onPublishedDateChange(date: string): void {
    // If submission date is now before or equal to publication date, mark touched to prompt correction
    if (this.data().submissionDate && this.data().submissionDate <= date) {
      this.touchedFields.update(t => ({ ...t, submissionDate: true }));
    }
    this.notifyMutation('publishedDate');
  }

  onDocChange(index: number): void {
    this.touchedDocFields.update(t => ({ ...t, [index]: true }));
    this.formVersion.update(v => v + 1);
    this.formChange.emit();
  }

  hasError(field: string): boolean {
    if (!this.submitted() && !this.touchedFields()[field]) return false;
    return !!this.validation().errors[field];
  }

  getError(field: string): string {
    if (!this.submitted() && !this.touchedFields()[field]) return '';
    return this.validation().errors[field] || '';
  }

  hasDocError(index: number): boolean {
    if (!this.submitted() && !this.touchedDocFields()[index]) return false;
    return !!this.validation().docErrors[index];
  }

  getDocError(index: number): string {
    if (!this.submitted() && !this.touchedDocFields()[index]) return '';
    return this.validation().docErrors[index] || '';
  }

  onAnnexureChange(index: number): void {
    this.touchedAnnexureFields.update(t => ({ ...t, [index]: true }));
    this.formVersion.update(v => v + 1);
    this.formChange.emit();
  }

  hasAnnexureError(index: number): boolean {
    if (!this.submitted() && !this.touchedAnnexureFields()[index]) return false;
    return !!this.validation().annexureErrors?.[index];
  }

  getAnnexureError(index: number): string {
    if (!this.submitted() && !this.touchedAnnexureFields()[index]) return '';
    return this.validation().annexureErrors?.[index] || '';
  }

  onDocFileUpload(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const error = validateUploadFile(file);
    if (error) {
      this.docFileError.set(error);
      input.value = '';
      return;
    }

    this.docFileError.set('');
    if (!this.data().documentFiles) {
      this.data().documentFiles = {};
    }
    this.data().documentFiles![index] = {
      name: this.data().documents[index] || file.name,
      fileName: file.name,
      size: formatBytes(file.size),
      file
    };

    input.value = '';
  }

  removeDocFile(index: number): void {
    if (this.data()?.documentFiles) {
      delete this.data().documentFiles![index];
    }
  }

  viewAttachment(att: EoiAttachment): void {
    if (att.file instanceof File && att.file.size > 0) {
      let url = this.objectUrls.get(att.file);
      if (!url) {
        url = URL.createObjectURL(att.file);
        this.objectUrls.set(att.file, url);
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    this.docViewer.openDocument({
      title: att.title,
      fileName: att.fileName,
      fileSize: att.size
    });
  }

  onSchemeChange(schemeName: string): void {
    if (!schemeName) {
      // Clear dependent values
      this.data().schemeCategory = '';
      this.data().emdFee = '';
      this.data().processFee = '';
      this.data().documents = [];
      this.data().annexures = [];
      this.data().documentFiles = {};
      this.notifyMutation('scheme');
      this.schemeChange.emit(schemeName);
      return;
    }

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
    const masterList = this.docMasterItems().length > 0 ? this.docMasterItems() : INITIAL_DOC_ITEMS;
    const docs = parseMasterEntriesByScheme(masterList, schemeName, d => d.docName || d.documents);
    this.data().documents = [...docs];
    this.data().documentFiles = {};
    this.docFileError.set('');

    // 3. Auto-fill required annexures from Annexure Master
    const annexMasterList = this.annexureMasterItems().length > 0 ? this.annexureMasterItems() : INITIAL_ANNEXURE_ITEMS;
    const annexures = parseMasterEntriesByScheme(annexMasterList, schemeName, a => a.annexureName || a.annexures);
    this.data().annexures = [...annexures];

    this.notifyMutation('scheme');
    this.schemeChange.emit(schemeName);
  }
}
