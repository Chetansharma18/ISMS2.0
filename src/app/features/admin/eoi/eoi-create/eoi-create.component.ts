import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EoiFieldService } from '../../core/services/eoi-field.service';
import { EoiService } from '../../core/services/eoi.service';
import { EoiFormField, FormFieldType, FormOption } from '../../core/models/admin.models';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'admin-eoi-create',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule, 
    PageHeaderComponent,
    ModalComponent,
    StatusBadgeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './eoi-create.component.html'
})
export class EoiCreateComponent implements OnInit {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly eoiFieldService = inject(EoiFieldService);
  readonly eoiService = inject(EoiService);
  readonly toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly dynamicFields = signal<EoiFormField[]>([]);
  readonly dynamicResponses: Record<string, any> = {};
  readonly validationErrors = signal<Record<string, string>>({});

  eoiId = 'EOI-2025-001'; // Default
  isEditMode = signal<boolean>(false);
  eoiTitle = signal<string>('');
  showPreview = signal<boolean>(true);
  isModalOpen = signal<boolean>(false);
  editingFieldId: string | null = null;
  fieldForm!: FormGroup;
  eoiDetailsForm!: FormGroup;
  optionsList = signal<FormOption[]>([]);

  fieldTypes: FormFieldType[] = [
    'Text', 'Textarea', 'Number', 'Decimal', 'Currency', 
    'Percentage', 'Email', 'Mobile', 'Date', 'Dropdown', 
    'Multi Select', 'Radio', 'Checkbox', 'File Upload'
  ];

  ngOnInit(): void {
    this.initEoiDetailsForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
      this.isEditMode.set(true);
      this.eoiService.getEoiById(id).subscribe(eoi => {
        if (eoi) {
          this.eoiTitle.set(eoi.title);
          this.eoiDetailsForm.patchValue({
            referenceNo: eoi.referenceNo,
            title: eoi.title,
            schemeName: eoi.schemeName,
            eoiCategory: eoi.eoiCategory,
            description: eoi.description,
            publishedDate: eoi.publishedDate,
            closingDate: eoi.closingDate
          });
        }
      });
    }
    this.loadFields();
    this.initFieldForm();
  }

  initEoiDetailsForm(): void {
    this.eoiDetailsForm = this.fb.group({
      referenceNo: ['', Validators.required],
      title: ['', Validators.required],
      schemeName: ['', Validators.required],
      eoiCategory: ['', Validators.required],
      description: [''],
      publishedDate: ['', Validators.required],
      closingDate: ['', Validators.required]
    });
  }

  loadFields(): void {
    this.eoiFieldService.getFieldsForEoi(this.eoiId).subscribe(fields => {
      this.dynamicFields.set(fields);
    });
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

    this.eoiFieldService.saveField(payload).subscribe(() => {
      this.toastService.success('Field Saved', `Field "${val.fieldLabel}" saved to schema.`);
      this.loadFields();
      this.isModalOpen.set(false);
    });
  }

  duplicateField(f: EoiFormField): void {
    this.eoiFieldService.duplicateField(f.id).subscribe(clone => {
      if (clone) {
        this.toastService.success('Field Duplicated', `Created copy "${clone.fieldLabel}"`);
        this.loadFields();
      }
    });
  }

  toggleActive(f: EoiFormField): void {
    f.active = !f.active;
    this.eoiFieldService.saveField(f).subscribe(() => {
      this.toastService.info('Field Status', `Field ${f.fieldLabel} ${f.active ? 'Enabled' : 'Disabled'}`);
    });
  }

  deleteField(f: EoiFormField): void {
    this.eoiFieldService.deleteOrArchiveField(f.id).subscribe(res => {
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
    const list = [...this.dynamicFields()];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const ids = list.map(item => item.id);
    this.eoiFieldService.reorderFields(this.eoiId, ids).subscribe(() => {
      this.loadFields();
    });
  }

  clearFieldError(fieldId: string): void {
    if (this.validationErrors()[fieldId]) {
      const current = { ...this.validationErrors() };
      delete current[fieldId];
      this.validationErrors.set(current);
    }
  }

  toggleCheckbox(fieldId: string, value: string): void {
    if (!this.dynamicResponses[fieldId]) {
      this.dynamicResponses[fieldId] = [];
    }
    const idx = this.dynamicResponses[fieldId].indexOf(value);
    if (idx > -1) {
      this.dynamicResponses[fieldId].splice(idx, 1);
    } else {
      this.dynamicResponses[fieldId].push(value);
    }
    this.clearFieldError(fieldId);
  }

  onFileSelect(event: Event, fieldId: string): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.dynamicResponses[fieldId] = target.files[0];
      this.clearFieldError(fieldId);
    } else {
      this.dynamicResponses[fieldId] = null;
    }
  }

  saveAsDraft(): void {
    this.toastService.success('Draft Saved', 'Your EOI draft has been saved successfully.');
    this.router.navigate(['/admin/eoi']);
  }

  onSubmitPublish(): void {
    const errors: Record<string, string> = {};
    
    // Validate required fields and constraints
    this.dynamicFields().forEach(field => {
      const val = this.dynamicResponses[field.id];
      
      // 1. Required Check
      if (field.required) {
        if (val === undefined || val === null || val === '') {
          errors[field.id] = `${field.fieldLabel} is required`;
        } else if (Array.isArray(val) && val.length === 0) {
          errors[field.id] = `${field.fieldLabel} is required (select at least one)`;
        }
      }

      // 2. Length Checks (Text)
      if (val && typeof val === 'string') {
        if (field.minLength && val.length < field.minLength) {
          errors[field.id] = `Minimum length is ${field.minLength} characters`;
        }
        if (field.maxLength && val.length > field.maxLength) {
          errors[field.id] = `Maximum length is ${field.maxLength} characters`;
        }
      }

      // 3. Value Checks (Numbers)
      if (val !== undefined && val !== null && val !== '') {
        const numVal = Number(val);
        if (!isNaN(numVal)) {
          if (field.minValue !== undefined && field.minValue !== null && numVal < field.minValue) {
            errors[field.id] = `Minimum value is ${field.minValue}`;
          }
          if (field.maxValue !== undefined && field.maxValue !== null && numVal > field.maxValue) {
            errors[field.id] = `Maximum value is ${field.maxValue}`;
          }
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      this.validationErrors.set(errors);
      this.toastService.error('Validation Error', 'Please correct the errors in the preview form before publishing.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.validationErrors.set({});
    
    // In a real app, this would send `dynamicResponses` to the server to create the EOI
    this.toastService.success('EOI Published', 'The EOI has been successfully published using the dynamic configuration.');
    this.router.navigate(['/admin/eoi']);
  }
}
