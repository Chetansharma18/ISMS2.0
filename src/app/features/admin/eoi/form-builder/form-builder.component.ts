import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { EoiFieldService } from '../../core/services/eoi-field.service';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EoiFormField, FormFieldType, FormOption, EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-form-builder',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    ReactiveFormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="'Dynamic EOI Form Builder: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Configure the applicant submission form without writing code. Supports 14 field types, regex validations, options builder, and live interactive preview."
        icon="format_shapes"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Form Builder' }
        ]">
        <div header-actions class="flex items-center gap-2">
          <button 
            (click)="toggleLivePreview()"
            class="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px] text-blue-600">visibility</span>
            {{ showPreview() ? 'Hide Live Preview' : 'Show Live Preview' }}
          </button>
          <button 
            (click)="openAddFieldModal()"
            class="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            + Add Form Field
          </button>
        </div>
      </admin-page-header>

      <!-- Main Layout: Left Fields Table, Right Live Preview (Collapsible) -->
      <div class="grid grid-cols-1" [ngClass]="{'lg:grid-cols-12 gap-6': showPreview()}">
        
        <!-- Left: Fields Schema Table -->
        <div class="min-w-0" [ngClass]="showPreview() ? 'lg:col-span-7' : 'col-span-12'">
          
          <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
            <div class="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-blue-700 text-[20px]">reorder</span>
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Form Fields Schema ({{ fields().length }} Fields)
                </h3>
              </div>
              <span class="text-[11px] text-slate-500 font-medium">
                Drag or use arrows to reorder
              </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-600 border-collapse">
                <thead class="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th class="px-3 py-3 text-center w-14">Order</th>
                    <th class="px-4 py-3">Field Label</th>
                    <th class="px-4 py-3">Field Code</th>
                    <th class="px-4 py-3">Type</th>
                    <th class="px-4 py-3 text-center">Required</th>
                    <th class="px-4 py-3">Status</th>
                    <th class="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let f of fields(); let i = index" class="hover:bg-slate-50/80 transition-colors">
                    
                    <!-- Order & Reorder Controls (Move Up/Down) -->
                    <td class="px-3 py-3 text-center whitespace-nowrap">
                      <div class="flex items-center justify-center gap-0.5">
                        <span class="font-bold text-slate-700 w-4 text-center">{{ f.displayOrder }}</span>
                        <div class="flex flex-col">
                          <button 
                            type="button"
                            [disabled]="i === 0"
                            (click)="moveField(i, -1)"
                            class="text-slate-400 hover:text-blue-700 disabled:opacity-20 cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">arrow_drop_up</span>
                          </button>
                          <button 
                            type="button"
                            [disabled]="i === fields().length - 1"
                            (click)="moveField(i, 1)"
                            class="text-slate-400 hover:text-blue-700 disabled:opacity-20 cursor-pointer">
                            <span class="material-symbols-outlined text-[14px]">arrow_drop_down</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    <!-- Label -->
                    <td class="px-4 py-3 font-semibold text-slate-900 max-w-[200px]">
                      <div class="line-clamp-1" [title]="f.fieldLabel">{{ f.fieldLabel }}</div>
                      <div *ngIf="f.helpText" class="text-[10px] text-slate-400 truncate">{{ f.helpText }}</div>
                    </td>

                    <!-- Code -->
                    <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {{ f.fieldCode }}
                    </td>

                    <!-- Type -->
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {{ f.fieldType }}
                      </span>
                    </td>

                    <!-- Required -->
                    <td class="px-4 py-3 text-center whitespace-nowrap">
                      <span 
                        class="px-2 py-0.5 rounded text-[10px] font-bold"
                        [ngClass]="f.required ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'">
                        {{ f.required ? 'Required' : 'Optional' }}
                      </span>
                    </td>

                    <!-- Status -->
                    <td class="px-4 py-3 whitespace-nowrap">
                      <admin-status-badge [status]="f.active ? 'Active' : 'Inactive'"></admin-status-badge>
                    </td>

                    <!-- Actions -->
                    <td class="px-4 py-3 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1">
                        <!-- Edit -->
                        <button 
                          (click)="editField(f)"
                          class="p-1 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded cursor-pointer" 
                          title="Edit Field Configuration">
                          <span class="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <!-- Duplicate -->
                        <button 
                          (click)="duplicateField(f)"
                          class="p-1 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded cursor-pointer" 
                          title="Duplicate Field">
                          <span class="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <!-- Toggle Active -->
                        <button 
                          (click)="toggleActive(f)"
                          class="p-1 rounded cursor-pointer"
                          [ngClass]="f.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'"
                          [title]="f.active ? 'Disable Field' : 'Enable Field'">
                          <span class="material-symbols-outlined text-[18px]">
                            {{ f.active ? 'toggle_on' : 'toggle_off' }}
                          </span>
                        </button>
                        <!-- Delete / Archive (Rule 5 & 28) -->
                        <button 
                          (click)="deleteField(f)"
                          class="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer" 
                          [title]="f.hasHistoricalResponses ? 'Archive Field (Preserves historical responses)' : 'Delete Field'">
                          <span class="material-symbols-outlined text-[18px]">
                            {{ f.hasHistoricalResponses ? 'archive' : 'delete' }}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right: Interactive Live Preview Pane -->
        <div *ngIf="showPreview()" class="min-w-0 lg:col-span-5 space-y-4">
          <div class="bg-white rounded-xl shadow-xs border-2 border-blue-200 p-5 sticky top-20">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 bg-blue-50/50 -mx-5 -mt-5 p-4 rounded-t-xl">
              <div class="flex items-center gap-2 text-blue-900">
                <span class="material-symbols-outlined text-[22px]">devices</span>
                <div>
                  <h4 class="font-bold text-xs uppercase tracking-wider">Applicant Live View (Preview)</h4>
                  <p class="text-[10px] text-blue-700">Real-time simulation of applicant input screen</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                Interactive Preview
              </span>
            </div>

            <!-- Simulated Form Content -->
            <div class="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div *ngFor="let f of fields()" class="text-xs">
                <label class="block font-bold text-slate-800 mb-1">
                  {{ f.fieldLabel }}
                  <span *ngIf="f.required" class="text-rose-600">*</span>
                </label>

                <!-- 1. Text -->
                <input 
                  *ngIf="f.fieldType === 'Text'" 
                  type="text" 
                  [placeholder]="f.placeholder || ''" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />

                <!-- 2. Textarea -->
                <textarea 
                  *ngIf="f.fieldType === 'Textarea'" 
                  rows="3" 
                  [placeholder]="f.placeholder || ''" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"></textarea>

                <!-- 3. Number -->
                <input 
                  *ngIf="f.fieldType === 'Number'" 
                  type="number" 
                  [placeholder]="f.placeholder || ''" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />

                <!-- 4. Decimal -->
                <input 
                  *ngIf="f.fieldType === 'Decimal'" 
                  type="number" 
                  step="0.01" 
                  [placeholder]="f.placeholder || ''" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />

                <!-- 5. Currency -->
                <div *ngIf="f.fieldType === 'Currency'" class="relative">
                  <span class="absolute left-3 top-2 text-slate-500 font-bold">₹</span>
                  <input type="number" [placeholder]="f.placeholder || '0.00'" class="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50" />
                </div>

                <!-- 6. Percentage -->
                <div *ngIf="f.fieldType === 'Percentage'" class="relative">
                  <input type="number" [placeholder]="f.placeholder || '0'" class="w-full pr-8 pl-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50" />
                  <span class="absolute right-3 top-2 text-slate-500 font-bold">%</span>
                </div>

                <!-- 7. Email -->
                <input 
                  *ngIf="f.fieldType === 'Email'" 
                  type="email" 
                  [placeholder]="f.placeholder || 'applicant@org.in'" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50" />

                <!-- 8. Mobile -->
                <div *ngIf="f.fieldType === 'Mobile'" class="relative">
                  <span class="absolute left-3 top-2 text-slate-500 text-xs font-semibold">+91</span>
                  <input type="tel" [placeholder]="f.placeholder || '9876543210'" class="w-full pl-11 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50" />
                </div>

                <!-- 9. Date -->
                <input 
                  *ngIf="f.fieldType === 'Date'" 
                  type="date" 
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50/50" />

                <!-- 10. Dropdown -->
                <select *ngIf="f.fieldType === 'Dropdown'" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                  <option value="">-- Choose Option --</option>
                  <option *ngFor="let opt of f.options" [value]="opt.value">{{ opt.label }}</option>
                </select>

                <!-- 11. Multi Select -->
                <div *ngIf="f.fieldType === 'Multi Select'" class="space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <label *ngFor="let opt of f.options" class="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" class="rounded text-blue-600" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>

                <!-- 12. Radio -->
                <div *ngIf="f.fieldType === 'Radio'" class="space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <label *ngFor="let opt of f.options" class="flex items-center gap-2 text-slate-700">
                    <input type="radio" [name]="f.fieldCode" class="text-blue-600" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>

                <!-- 13. Checkbox -->
                <div *ngIf="f.fieldType === 'Checkbox'" class="space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <label *ngFor="let opt of f.options" class="flex items-center gap-2 text-slate-700">
                    <input type="checkbox" class="rounded text-blue-600" />
                    <span>{{ opt.label }}</span>
                  </label>
                </div>

                <!-- 14. File Upload -->
                <div *ngIf="f.fieldType === 'File Upload'" class="p-3 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
                  <span class="material-symbols-outlined text-[24px] text-slate-400">upload_file</span>
                  <span class="block text-[11px] text-slate-600 font-semibold mt-1">Upload Document ({{ f.allowedFileTypes || 'PDF' }}, Max {{ f.maxFileSizeMB || 5 }}MB)</span>
                  <input type="file" class="hidden" />
                </div>

                <p *ngIf="f.helpText" class="text-[10px] text-slate-400 mt-1">{{ f.helpText }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add / Edit Field Modal -->
      <admin-modal 
        [isOpen]="isModalOpen()" 
        [title]="editingFieldId ? 'Edit EOI Field: ' + fieldForm.get('fieldLabel')?.value : 'Add New EOI Form Field'"
        icon="format_shapes"
        maxWidth="2xl"
        (close)="isModalOpen.set(false)">
        
        <form [formGroup]="fieldForm" (ngSubmit)="saveFieldModal()" modal-body class="space-y-4 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Label -->
            <div class="sm:col-span-2">
              <label class="block font-bold text-slate-700 mb-1">Field Label *</label>
              <input 
                type="text" 
                formControlName="fieldLabel"
                placeholder="e.g. Annual Audited Turnover (INR Lakhs)"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Code -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Field Code *</label>
              <input 
                type="text" 
                formControlName="fieldCode"
                placeholder="e.g. ANNUAL_TURNOVER"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase font-bold focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Field Type (14 Supported Types) -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Field Type *</label>
              <select 
                formControlName="fieldType"
                (change)="onTypeChange()"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                <option *ngFor="let t of fieldTypes" [value]="t">{{ t }}</option>
              </select>
            </div>

            <!-- Placeholder -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Placeholder Text</label>
              <input 
                type="text" 
                formControlName="placeholder"
                placeholder="Hint inside empty input..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>

            <!-- Help Text -->
            <div>
              <label class="block font-bold text-slate-700 mb-1">Help Text / Instruction</label>
              <input 
                type="text" 
                formControlName="helpText"
                placeholder="Appears below field..."
                class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-hidden" />
            </div>
          </div>

          <!-- Checkboxes: Required & Active -->
          <div class="flex items-center gap-6 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label class="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input type="checkbox" formControlName="required" class="rounded text-blue-600" />
              <span>Mandatory / Required Field</span>
            </label>
            <label class="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
              <input type="checkbox" formControlName="active" class="rounded text-blue-600" />
              <span>Active Field</span>
            </label>
          </div>

          <!-- Validation constraints section -->
          <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">Validation Parameters</h5>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label class="block text-[10px] font-semibold text-slate-600">Min Length</label>
                <input type="number" formControlName="minLength" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-600">Max Length</label>
                <input type="number" formControlName="maxLength" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-600">Min Value</label>
                <input type="number" formControlName="minValue" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-slate-600">Max Value</label>
                <input type="number" formControlName="maxValue" class="w-full px-2 py-1 border rounded text-xs bg-white" />
              </div>
            </div>
          </div>

          <!-- Options Builder (for Dropdown, Multi Select, Radio, Checkbox) -->
          <div *ngIf="needsOptions()" class="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200 space-y-2">
            <div class="flex items-center justify-between">
              <h5 class="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">Configurable Options</h5>
              <button 
                type="button" 
                (click)="addOptionRow()"
                class="px-2 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded text-[10px] font-bold">
                + Add Option
              </button>
            </div>

            <div class="space-y-1.5 max-h-40 overflow-y-auto">
              <div *ngFor="let opt of optionsList(); let optIdx = index" class="flex items-center gap-2">
                <input 
                  type="text" 
                  [(ngModel)]="opt.label" 
                  [ngModelOptions]="{standalone: true}"
                  placeholder="Option Display Label"
                  class="flex-1 px-2.5 py-1.5 border rounded text-xs bg-white" />
                <input 
                  type="text" 
                  [(ngModel)]="opt.value" 
                  [ngModelOptions]="{standalone: true}"
                  placeholder="Value Code"
                  class="w-32 px-2.5 py-1.5 border rounded text-xs font-mono uppercase bg-white" />
                <button 
                  type="button" 
                  (click)="removeOptionRow(optIdx)"
                  class="text-rose-600 hover:text-rose-800 p-1">
                  <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          </div>

          <!-- File Upload Configuration (for File Upload type) -->
          <div *ngIf="fieldForm.get('fieldType')?.value === 'File Upload'" class="p-3 bg-amber-50/60 rounded-lg border border-amber-200 grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-amber-900 text-[10px]">Allowed File Formats</label>
              <input type="text" formControlName="allowedFileTypes" placeholder="e.g. PDF, DOCX" class="w-full px-2 py-1 border rounded text-xs bg-white" />
            </div>
            <div>
              <label class="block font-bold text-amber-900 text-[10px]">Maximum Size (MB)</label>
              <input type="number" formControlName="maxFileSizeMB" class="w-full px-2 py-1 border rounded text-xs bg-white" />
            </div>
          </div>

        </form>

        <div modal-footer class="flex items-center gap-2">
          <button (click)="isModalOpen.set(false)" class="px-3.5 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">
            Cancel
          </button>
          <button (click)="saveFieldModal()" class="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs">
            Save Field
          </button>
        </div>
      </admin-modal>
    </div>
  `
})
export class FormBuilderComponent implements OnInit {
  private fieldService = inject(EoiFieldService);
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);
  fields = signal<EoiFormField[]>([]);
  showPreview = signal<boolean>(true);

  isModalOpen = signal<boolean>(false);
  editingFieldId: string | null = null;
  fieldForm!: FormGroup;
  optionsList = signal<FormOption[]>([]);

  fieldTypes: FormFieldType[] = [
    'Text', 'Textarea', 'Number', 'Decimal', 'Currency', 
    'Percentage', 'Email', 'Mobile', 'Date', 'Dropdown', 
    'Multi Select', 'Radio', 'Checkbox', 'File Upload'
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
    this.loadFields();

    this.initFieldForm();
  }

  loadFields(): void {
    this.fieldService.getFieldsForEoi(this.eoiId).subscribe(list => this.fields.set(list));
  }

  initFieldForm(): void {
    this.fieldForm = this.fb.group({
      fieldLabel: ['', Validators.required],
      fieldCode: ['', Validators.required],
      fieldType: ['Text', Validators.required],
      placeholder: [''],
      helpText: [''],
      required: [false],
      active: [true],
      minLength: [null],
      maxLength: [null],
      minValue: [null],
      maxValue: [null],
      allowedFileTypes: ['PDF'],
      maxFileSizeMB: [5]
    });
  }

  toggleLivePreview(): void {
    this.showPreview.update(v => !v);
  }

  needsOptions(): boolean {
    const t = this.fieldForm?.get('fieldType')?.value;
    return t === 'Dropdown' || t === 'Multi Select' || t === 'Radio' || t === 'Checkbox';
  }

  onTypeChange(): void {
    if (this.needsOptions() && this.optionsList().length === 0) {
      this.optionsList.set([
        { label: 'Option 1', value: 'OPT_1' },
        { label: 'Option 2', value: 'OPT_2' }
      ]);
    }
  }

  addOptionRow(): void {
    this.optionsList.update(list => [
      ...list,
      { label: `Option ${list.length + 1}`, value: `OPT_${list.length + 1}` }
    ]);
  }

  removeOptionRow(idx: number): void {
    this.optionsList.update(list => list.filter((_, i) => i !== idx));
  }

  openAddFieldModal(): void {
    this.editingFieldId = null;
    this.optionsList.set([]);
    this.fieldForm.reset({
      fieldLabel: '',
      fieldCode: '',
      fieldType: 'Text',
      required: false,
      active: true,
      allowedFileTypes: 'PDF',
      maxFileSizeMB: 5
    });
    this.isModalOpen.set(true);
  }

  editField(f: EoiFormField): void {
    this.editingFieldId = f.id;
    this.optionsList.set(f.options ? JSON.parse(JSON.stringify(f.options)) : []);
    this.fieldForm.patchValue({
      fieldLabel: f.fieldLabel,
      fieldCode: f.fieldCode,
      fieldType: f.fieldType,
      placeholder: f.placeholder,
      helpText: f.helpText,
      required: f.required,
      active: f.active,
      minLength: f.minLength,
      maxLength: f.maxLength,
      minValue: f.minValue,
      maxValue: f.maxValue,
      allowedFileTypes: f.allowedFileTypes || 'PDF',
      maxFileSizeMB: f.maxFileSizeMB || 5
    });
    this.isModalOpen.set(true);
  }

  saveFieldModal(): void {
    if (this.fieldForm.invalid) {
      this.toastService.error('Validation Error', 'Field Label and Code are required.');
      return;
    }

    const val = this.fieldForm.value;
    const payload: Partial<EoiFormField> = {
      ...(this.editingFieldId ? { id: this.editingFieldId } : {}),
      eoiId: this.eoiId,
      ...val,
      options: this.needsOptions() ? this.optionsList() : []
    };

    this.fieldService.saveField(payload).subscribe(() => {
      this.toastService.success('Field Saved', `Field "${val.fieldLabel}" saved to schema.`);
      this.loadFields();
      this.isModalOpen.set(false);
    });
  }

  duplicateField(f: EoiFormField): void {
    this.fieldService.duplicateField(f.id).subscribe(clone => {
      if (clone) {
        this.toastService.success('Field Duplicated', `Created copy "${clone.fieldLabel}"`);
        this.loadFields();
      }
    });
  }

  toggleActive(f: EoiFormField): void {
    f.active = !f.active;
    this.fieldService.saveField(f).subscribe(() => {
      this.toastService.info('Field Status', `Field ${f.fieldLabel} ${f.active ? 'Enabled' : 'Disabled'}`);
    });
  }

  deleteField(f: EoiFormField): void {
    this.fieldService.deleteOrArchiveField(f.id).subscribe(res => {
      if (res.action === 'archived') {
        this.toastService.warning(
          'Field Archived', 
          `Field "${f.fieldLabel}" has historical submissions. Deactivated & preserved in archive.`
        );
      } else {
        this.toastService.success('Field Deleted', `Field "${f.fieldLabel}" removed from schema.`);
      }
      this.loadFields();
    });
  }

  moveField(index: number, direction: number): void {
    const list = [...this.fields()];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const ids = list.map(item => item.id);
    this.fieldService.reorderFields(this.eoiId, ids).subscribe(() => {
      this.loadFields();
    });
  }
}
