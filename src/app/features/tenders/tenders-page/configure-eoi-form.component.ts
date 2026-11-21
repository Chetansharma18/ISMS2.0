import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EoiAttachment, EoiDocumentUpload, EoiFormData, EoiRequiredInfoItem } from '../tenders.models';
import { SchemeMasterItem, DocMasterItem } from '../../../core/models/admin-masters.model';
import { INITIAL_DOC_ITEMS } from '../../admin-master/doc-master.component';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import { ButtonComponent, DropdownComponent, IconComponent, InputDirective, formatInr } from '../../../shared';
import { formatBytes } from './tenders-page.util';

/**
 * Body of the "Configure New EOI / Edit EOI" form screen.
 *
 * Edits the parent-owned `data` object in place through ngModel, so it stays on
 * Default change detection. Document list changes are delegated to
 * the parent via outputs.
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
          <label class="block text-slate-700 font-medium mb-1.5">
            EOI Reference No. <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. RSLDC/EOI/2026-27/01"
            [(ngModel)]="data().refNo"
            [invalid]="submitted() && !data().refNo"
            class="w-full"
          />
          @if (submitted() && !data().refNo) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">EOI Reference No. is required</p>
          }
        </div>

        <!-- Row 1, Col 2: Scheme * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            Scheme <span class="text-[#DC2626] font-bold">*</span>
          </label>
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
          @if (submitted() && !data().scheme) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">Scheme is required</p>
          }
        </div>

        <!-- Row 2, Col 1: Scheme Category -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            Scheme Category
          </label>
          <select appInput [(ngModel)]="data().schemeCategory" class="w-full">
            <option value="" [selected]="!data().schemeCategory">-- Select Scheme Category --</option>
            @for (cat of schemeCategoryOptions(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <!-- Row 2, Col 2: EOI Category * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            EOI Category <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <select appInput [(ngModel)]="data().eoiCategory" [invalid]="submitted() && !data().eoiCategory" class="w-full">
            <option value="" disabled [selected]="!data().eoiCategory">-- Select EOI Category --</option>
            @for (eoiCat of eoiCategoryOptions(); track eoiCat) {
              <option [value]="eoiCat">{{ eoiCat }}</option>
            }
          </select>
          @if (submitted() && !data().eoiCategory) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">EOI Category is required</p>
          }
        </div>

        <!-- Row 3, Col 1: Date of EOI Published * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            Date of EOI Published <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            appInput
            type="date"
            [(ngModel)]="data().publishedDate"
            [invalid]="submitted() && !data().publishedDate"
            class="w-full"
          />
          @if (submitted() && !data().publishedDate) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">Date of EOI Published is required</p>
          }
        </div>

        <!-- Row 3, Col 2: Last Date of EOI Submission * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            Last Date of EOI Submission <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            appInput
            type="date"
            [(ngModel)]="data().submissionDate"
            [invalid]="submitted() && !data().submissionDate"
            class="w-full"
          />
          @if (submitted() && !data().submissionDate) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">Last Date of EOI Submission is required</p>
          }
        </div>

        <!-- Row 4, Col 1: EOI Duration (in Years) * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            EOI Duration (in Years) <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <div class="relative w-full">
            <input
              appInput
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 2"
              [(ngModel)]="data().eoiDurationValue"
              [invalid]="submitted() && (!data().eoiDurationValue || +data().eoiDurationValue <= 0)"
              class="w-full pr-16"
            />
            <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
              Years
            </span>
          </div>
          @if (submitted() && (!data().eoiDurationValue || +data().eoiDurationValue <= 0)) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">Valid duration in years is required</p>
          }
        </div>

        <!-- Row 4, Col 2: EOI Description -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            EOI Description
          </label>
          <input
            appInput
            type="text"
            maxlength="250"
            placeholder="Brief description of the EOI"
            [(ngModel)]="data().description"
            class="w-full"
          />
        </div>

        <!-- Row 5, Col 1: EMD Fee * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            EMD Fee <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. ₹50,000"
            [(ngModel)]="data().emdFee"
            [invalid]="submitted() && !data().emdFee"
            class="w-full"
          />
          @if (submitted() && !data().emdFee) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">EMD Fee is required</p>
          }
        </div>

        <!-- Row 5, Col 2: Process Fee * -->
        <div>
          <label class="block text-slate-700 font-medium mb-1.5">
            Process Fee <span class="text-[#DC2626] font-bold">*</span>
          </label>
          <input
            appInput
            type="text"
            maxlength="100"
            placeholder="e.g. ₹10,000"
            [(ngModel)]="data().processFee"
            [invalid]="submitted() && !data().processFee"
            class="w-full"
          />
          @if (submitted() && !data().processFee) {
            <p class="text-xs text-red-500 font-medium m-0 mt-1">Process Fee is required</p>
          }
        </div>
      </div>

      <!-- ====================================================================
           EOI DOCUMENTS (Matching Design exactly)
           ==================================================================== -->
      <section class="space-y-3 pt-4 border-t border-[#E8EEF5]">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-[#D73389] font-bold text-sm tracking-wide m-0">SUPPORTING DOCUMENTS</h3>
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
              <div class="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span class="text-xs font-semibold text-slate-500 w-5 text-center shrink-0">{{ idx + 1 }}.</span>
                <div class="flex-1 min-w-0">
                  <app-dropdown
                    [options]="availableDocumentOptions()"
                    [(value)]="data().documents[idx]"
                    placeholder="-- Select Document Required --"
                    size="sm"
                    direction="up"
                    [overlay]="true"
                    [invalid]="submitted() && !data().documents[idx]"
                    class="w-full"
                  />
                </div>

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

  readonly docFileError = signal<string>('');

  readonly availableDocumentOptions = computed(() => {
    const set = new Set<string>();
    const masterList = this.docMasterItems().length > 0 ? this.docMasterItems() : INITIAL_DOC_ITEMS;

    // 1. Supporting documents from Doc Master ONLY
    masterList.forEach(item => {
      if (item.documents) {
        item.documents.split(',').forEach(d => {
          const trimmed = d.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });

    // 2. Keep any document already selected in the form data so it stays visible
    (this.data()?.documents || []).forEach(doc => {
      if (doc?.trim()) set.add(doc.trim());
    });

    return Array.from(set);
  });

  getUploadedDoc(index: number): EoiDocumentUpload | undefined {
    return this.data()?.documentFiles?.[index];
  }

  onDocFileUpload(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'svg', 'txt'];
    const isImage = file.type.startsWith('image/');
    if (!allowed.includes(ext) && !isImage && file.type !== 'text/plain') {
      this.docFileError.set(`Invalid file format for "${file.name}". Please upload a PDF, image, or TXT file.`);
      input.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      this.docFileError.set(`File "${file.name}" exceeds the 25 MB limit.`);
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
      file: file
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

    // 2. Auto-fill required documents from Doc Master (robust match)
    const masterList = this.docMasterItems().length > 0 ? this.docMasterItems() : INITIAL_DOC_ITEMS;
    const target = schemeName.trim().toLowerCase();
    const docItem = masterList.find(d => {
      const s = (d.schemeName || '').trim().toLowerCase();
      return s === target || s.includes(target) || target.includes(s);
    });

    if (docItem && docItem.documents) {
      const docs = docItem.documents
        .split(',')
        .map(d => d.trim())
        .filter(Boolean);
      if (docs.length > 0) {
        this.data().documents = [...docs];
        this.data().documentFiles = {};
        this.docFileError.set('');
      }
    }

    this.schemeChange.emit(schemeName);
  }
}
