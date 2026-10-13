import { Component, input, output, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiFormData, EoiRequiredInfoItem } from '../tenders.models';
import { SchemeMasterItem, DocMasterItem } from '../../../core/models/admin-masters.model';
import { formatInr } from '../../../shared';

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
  imports: [NgClass, FormsModule],
  host: { class: 'block' },
  template: `
    <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
      {{ isEditing() ? 'Edit EOI Configuration' : 'Configure New EOI' }}
    </h2>
    <div class="mt-4 font-sans text-[13px] max-h-[60vh] overflow-y-auto overflow-x-hidden pr-1 sm:pr-3">
      <div class="grid grid-cols-1 sm:grid-cols-[180px_1fr] md:grid-cols-[200px_1fr] items-start sm:items-center gap-y-3 gap-x-4">
        <label class="text-slate-700 font-medium">EOI Reference No.*</label>
        <input type="text" maxlength="100" [(ngModel)]="data().refNo" [ngClass]="{'border-red-500': submitted() && !data().refNo, 'border-field-border': !(submitted() && !data().refNo)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />
        
        <label class="text-slate-700 font-medium">Scheme*</label>
        <select
          [(ngModel)]="data().scheme"
          (ngModelChange)="onSchemeChange($event)"
          [ngClass]="{'border-red-500': submitted() && !data().scheme, 'border-field-border': !(submitted() && !data().scheme)}"
          class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white"
        >
          <option value="" disabled [selected]="!data().scheme">-- Select Scheme --</option>
          @for (name of schemeNameOptions(); track name) {
            <option [value]="name">{{ name }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">Scheme Category</label>
        <select [(ngModel)]="data().schemeCategory" class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:border-primary text-slate-800 bg-white">
          <option value="" [selected]="!data().schemeCategory">-- Select Scheme Category --</option>
          @for (cat of schemeCategoryOptions(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">Date of Eol Published*</label>
        <input type="date" [(ngModel)]="data().publishedDate" [ngClass]="{'border-red-500': submitted() && !data().publishedDate, 'border-field-border': !(submitted() && !data().publishedDate)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />

        <label class="text-slate-700 font-medium">Last Date of Eol Submission*</label>
        <input type="date" [(ngModel)]="data().submissionDate" [ngClass]="{'border-red-500': submitted() && !data().submissionDate, 'border-field-border': !(submitted() && !data().submissionDate)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />

        <label class="text-slate-700 font-medium">EOI Category*</label>
        <select [(ngModel)]="data().eoiCategory" [ngClass]="{'border-red-500': submitted() && !data().eoiCategory, 'border-field-border': !(submitted() && !data().eoiCategory)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white">
          <option value="" disabled [selected]="!data().eoiCategory">-- Select EOI Category --</option>
          @for (eoiCat of eoiCategoryOptions(); track eoiCat) {
            <option [value]="eoiCat">{{ eoiCat }}</option>
          }
        </select>

        <label class="text-slate-700 font-medium">EOI Description</label>
        <input type="text" maxlength="100" [(ngModel)]="data().description" class="w-full px-2.5 py-1.5 border border-field-border rounded focus:outline-none focus:ring-1 focus:ring-primary text-slate-800" />

        <label class="text-slate-700 font-medium">EMD Fee*</label>
        <input type="text" maxlength="100" [(ngModel)]="data().emdFee" [ngClass]="{'border-red-500': submitted() && !data().emdFee, 'border-field-border': !(submitted() && !data().emdFee)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />

        <label class="text-slate-700 font-medium">Process Fee*</label>
        <input type="text" maxlength="100" [(ngModel)]="data().processFee" [ngClass]="{'border-red-500': submitted() && !data().processFee, 'border-field-border': !(submitted() && !data().processFee)}" class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800" />

        <label class="text-slate-700 font-medium self-start pt-1">Attach File*</label>
        <div class="space-y-2 overflow-hidden w-full">
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="attach.emit()"
              class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-primary text-brand hover:bg-primary/5 text-xs font-semibold cursor-pointer transition-colors"
            >
              <svg class="w-4 h-4 transform -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
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
                    <svg class="w-4 h-4 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="font-medium text-slate-800 truncate shrink-0 max-w-35" [title]="att.title">{{ att.title }}</span>
                    <span class="text-[11px] text-slate-500 truncate min-w-0">({{ att.fileName }})</span>
                  </div>
                  <button
                    type="button"
                    (click)="removeAttachment.emit(idx)"
                    class="text-slate-400 hover:text-red-600 p-0.5 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0 ml-1"
                    title="Remove attachment"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>
        
        @if (fileError()) {
          <div class="col-span-1 sm:col-span-2 text-xs text-red-500 font-medium -mt-1">{{ fileError() }}</div>
        }

        <!-- EOI Documents Section -->
        <div class="col-span-1 sm:col-span-2 mt-1 pt-2 border-t border-slate-200">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h3 class="text-navy font-bold text-[13px] uppercase tracking-wide">EOI DOCUMENTS</h3>
              <p class="text-[11px] text-slate-500 m-0">Required documents for proposal upload (sourced from Doc Master)</p>
            </div>
            <button
              type="button"
              (click)="addDocument.emit()"
              class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-navy transition-colors shadow-sm cursor-pointer"
              title="Add Document"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          @for (doc of data().documents; track $index) {
            <div class="flex items-center gap-2 mb-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span class="text-xs font-semibold text-slate-500 w-6 text-center shrink-0">{{ $index + 1 }}.</span>
              <div class="flex-1 min-w-0">
                <select
                  [(ngModel)]="data().documents[$index]"
                  [ngClass]="{'border-red-500': submitted() && !data().documents[$index], 'border-slate-300': !(submitted() && !data().documents[$index])}"
                  class="w-full px-2.5 py-1.5 border rounded focus:outline-none focus:border-primary text-slate-800 bg-white text-xs font-medium shadow-xs"
                >
                  <option value="">-- Select Document Required --</option>
                  @for (docName of availableDocumentOptions(); track docName) {
                    <option [value]="docName">{{ docName }}</option>
                  }
                </select>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-brand whitespace-nowrap shrink-0">
                Upload Required
              </span>
              <button
                type="button"
                (click)="removeDocument.emit($index)"
                class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                title="Remove Document"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
          @if (data().documents.length === 0) {
            <div class="text-[12px] text-slate-500 italic py-3 text-center border border-dashed border-slate-300 rounded bg-slate-50/50">
              Select a scheme above to automatically load required documents from Doc Master, or click + to add manually.
            </div>
          }
        </div>
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

  readonly availableDocumentOptions = computed(() => {
    const set = new Set<string>();
    // 1. Documents from Doc Master
    this.docMasterItems().forEach(item => {
      if (item.documents) {
        item.documents.split(',').forEach(d => {
          const trimmed = d.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    // 2. Documents already in form
    (this.data()?.documents || []).forEach(doc => {
      if (doc?.trim()) set.add(doc.trim());
    });
    // 3. Fallback from requiredInfo
    this.requiredInfo().forEach(req => {
      if (req.name?.trim()) set.add(req.name.trim());
    });
    return Array.from(set);
  });

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
      }
    }

    this.schemeChange.emit(schemeName);
  }
}
