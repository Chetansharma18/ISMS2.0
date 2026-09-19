import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EoiFormField, FormFieldType } from '../models/admin.models';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class EoiFieldService {
  private auditService = inject(AuditService);

  private fieldsStore: EoiFormField[] = [
    {
      id: 'FLD-IMG-1', eoiId: 'EOI-2025-001', fieldLabel: 'EOI Reference No.', fieldCode: 'REF_NO', fieldType: 'Text', required: true, displayOrder: 1, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-2', eoiId: 'EOI-2025-001', fieldLabel: 'Scheme', fieldCode: 'SCHEME', fieldType: 'Dropdown', required: true, displayOrder: 2, active: true, options: [{label: 'MMKVY', value: 'MMKVY'}, {label: 'DDU-GKY', value: 'DDU-GKY'}, {label: 'PMKVY', value: 'PMKVY'}], hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-3', eoiId: 'EOI-2025-001', fieldLabel: 'Scheme Category', fieldCode: 'SCHEME_CAT', fieldType: 'Text', required: false, displayOrder: 3, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-4', eoiId: 'EOI-2025-001', fieldLabel: 'Date of EOI Published', fieldCode: 'PUB_DATE', fieldType: 'Date', required: true, displayOrder: 4, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-5', eoiId: 'EOI-2025-001', fieldLabel: 'Last Date of EOI Submission', fieldCode: 'SUB_DATE', fieldType: 'Date', required: true, displayOrder: 5, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-6', eoiId: 'EOI-2025-001', fieldLabel: 'EOI Category', fieldCode: 'EOI_CAT', fieldType: 'Dropdown', required: true, displayOrder: 6, active: true, options: [{label: 'General', value: 'General'}, {label: 'SC/ST', value: 'SC_ST'}, {label: 'Women', value: 'Women'}], hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-7', eoiId: 'EOI-2025-001', fieldLabel: 'EOI Description', fieldCode: 'DESC', fieldType: 'Textarea', required: false, displayOrder: 7, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-8', eoiId: 'EOI-2025-001', fieldLabel: 'EMD Fee', fieldCode: 'EMD_FEE', fieldType: 'Number', required: true, displayOrder: 8, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-9', eoiId: 'EOI-2025-001', fieldLabel: 'Process Fee', fieldCode: 'PROC_FEE', fieldType: 'Number', required: true, displayOrder: 9, active: true, hasHistoricalResponses: false
    },
    {
      id: 'FLD-IMG-10', eoiId: 'EOI-2025-001', fieldLabel: 'Attach File', fieldCode: 'ATTACH_FILE', fieldType: 'File Upload', required: true, displayOrder: 10, active: true, hasHistoricalResponses: false
    }
  ];

  constructor() {
    const saved = localStorage.getItem('eoi_dynamic_fields_v2');
    if (saved) {
      try {
        this.fieldsStore = JSON.parse(saved);
      } catch (e) {
        // use defaults
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('eoi_dynamic_fields_v2', JSON.stringify(this.fieldsStore));
  }

  getFieldsForEoi(eoiId: string): Observable<EoiFormField[]> {
    const fields = this.fieldsStore
      .filter(f => f.eoiId === eoiId && !f.archived)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    if (fields.length === 0) {
      const cloned = this.fieldsStore
        .filter(f => f.eoiId === 'EOI-2025-001' && !f.archived)
        .map(f => ({ ...f, id: `FLD-${Math.floor(1000 + Math.random() * 9000)}`, eoiId, hasHistoricalResponses: false }))
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return of(cloned);
    }

    return of(fields);
  }

  saveField(field: Partial<EoiFormField>): Observable<EoiFormField> {
    if (field.id) {
      const idx = this.fieldsStore.findIndex(f => f.id === field.id);
      if (idx !== -1) {
        this.fieldsStore[idx] = { ...this.fieldsStore[idx], ...field };
        this.auditService.logAction({
          user: 'superadmin_rajasthan',
          role: 'SUPER_ADMIN',
          module: 'EOI Form Builder',
          action: 'Edited Field',
          eoiId: field.eoiId,
          oldValue: `Field Code: ${field.fieldCode}`,
          newValue: `Label: ${field.fieldLabel}, Type: ${field.fieldType}`,
          reason: 'Form Builder field configuration update'
        });
        this.saveToStorage();
        return of({ ...this.fieldsStore[idx] });
      }
    }
    const maxOrder = this.fieldsStore
      .filter(f => f.eoiId === field.eoiId)
      .reduce((max, f) => Math.max(max, f.displayOrder), 0);

    const newField: EoiFormField = {
      id: `FLD-${Math.floor(1000 + Math.random() * 9000)}`,
      eoiId: field.eoiId || 'EOI-2025-001',
      fieldLabel: field.fieldLabel || 'New Form Field',
      fieldCode: (field.fieldCode || 'FIELD_' + Date.now()).toUpperCase(),
      fieldType: field.fieldType || 'Text',
      placeholder: field.placeholder || '',
      helpText: field.helpText || '',
      required: field.required ?? false,
      displayOrder: maxOrder + 1,
      active: true,
      options: field.options || [],
      allowedFileTypes: field.allowedFileTypes || 'PDF',
      maxFileSizeMB: field.maxFileSizeMB || 5,
      multipleFiles: field.multipleFiles || false,
      minLength: field.minLength,
      maxLength: field.maxLength,
      minValue: field.minValue,
      maxValue: field.maxValue,
      pattern: field.pattern,
      hasHistoricalResponses: false
    };
    this.fieldsStore.push(newField);
    this.saveToStorage();
    this.auditService.logAction({
      user: 'superadmin_rajasthan',
      role: 'SUPER_ADMIN',
      module: 'EOI Form Builder',
      action: 'Added Field',
      eoiId: newField.eoiId,
      newValue: `Field: ${newField.fieldLabel} (${newField.fieldCode}), Type: ${newField.fieldType}`,
      reason: 'New field added to EOI Form schema'
    });
    return of({ ...newField });
  }

  duplicateField(fieldId: string): Observable<EoiFormField | undefined> {
    const existing = this.fieldsStore.find(f => f.id === fieldId);
    if (!existing) return of(undefined);

    const cloned: EoiFormField = {
      ...existing,
      id: `FLD-${Math.floor(1000 + Math.random() * 9000)}`,
      fieldLabel: `${existing.fieldLabel} (Copy)`,
      fieldCode: `${existing.fieldCode}_COPY`,
      displayOrder: existing.displayOrder + 1,
      hasHistoricalResponses: false
    };
    this.fieldsStore.push(cloned);
    return of(cloned);
  }

  deleteOrArchiveField(fieldId: string): Observable<{ success: boolean; action: 'deleted' | 'archived' }> {
    const idx = this.fieldsStore.findIndex(f => f.id === fieldId);
    if (idx === -1) return of({ success: false, action: 'deleted' });

    const field = this.fieldsStore[idx];
    if (field.hasHistoricalResponses) {
      field.active = false;
      field.archived = true;
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'EOI Form Builder',
        action: 'Archived Field',
        eoiId: field.eoiId,
        oldValue: `Active Field: ${field.fieldLabel}`,
        newValue: 'Status: Archived (historical responses preserved)',
        reason: 'Field has historical application submissions'
      });
      return of({ success: true, action: 'archived' });
    } else {
      this.fieldsStore.splice(idx, 1);
      this.auditService.logAction({
        user: 'superadmin_rajasthan',
        role: 'SUPER_ADMIN',
        module: 'EOI Form Builder',
        action: 'Deleted Field',
        eoiId: field.eoiId,
        oldValue: `Field: ${field.fieldLabel}`,
        newValue: 'Deleted from schema',
        reason: 'Deleted by Super Admin'
      });
      this.saveToStorage();
      return of({ success: true, action: 'deleted' });
    }
  }

  reorderFields(eoiId: string, orderedFieldIds: string[]): Observable<boolean> {
    orderedFieldIds.forEach((id, index) => {
      const f = this.fieldsStore.find(item => item.id === id);
      if (f) {
        f.displayOrder = index + 1;
      }
    });
    this.saveToStorage();
    return of(true);
  }
}
