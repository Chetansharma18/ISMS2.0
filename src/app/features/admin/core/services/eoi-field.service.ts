import { Injectable, inject } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { EoiFormField, FormFieldType } from '../models/admin.models';
import { AuditService } from './audit.service';

@Injectable({
  providedIn: 'root'
})
export class EoiFieldService {
  private auditService = inject(AuditService);

  // Preloaded dynamic fields for EOI-2025-001
  private fieldsStore: EoiFormField[] = [
    {
      id: 'FLD-101',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Legal Name of Proposed Training Center',
      fieldCode: 'TC_LEGAL_NAME',
      fieldType: 'Text',
      placeholder: 'Enter official center name as per lease or registration',
      helpText: 'Must match electricity connection or commercial lease registry title',
      required: true,
      displayOrder: 1,
      active: true,
      minLength: 3,
      maxLength: 150,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-102',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Proposed Training Sectors / Domains',
      fieldCode: 'SECTORS_OFFERED',
      fieldType: 'Multi Select',
      placeholder: 'Select one or more sectors',
      helpText: 'Select up to 3 priority industrial sectors',
      required: true,
      displayOrder: 2,
      active: true,
      options: [
        { label: 'Automotive & Electric Vehicles (EV)', value: 'AUTO_EV' },
        { label: 'Healthcare & Nursing Assistance', value: 'HEALTHCARE' },
        { label: 'IT-ITeS & Artificial Intelligence', value: 'IT_ITES' },
        { label: 'Apparel, Made-Ups & Home Furnishing', value: 'APPAREL' },
        { label: 'Logistics & Supply Chain Management', value: 'LOGISTICS' },
        { label: 'Renewable Energy & Solar Installations', value: 'SOLAR_ENERGY' }
      ],
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-103',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Annual Training Capacity (Number of Candidates)',
      fieldCode: 'ANNUAL_CAPACITY',
      fieldType: 'Number',
      placeholder: 'e.g. 500',
      helpText: 'Minimum required capacity per center is 180 seats per year',
      required: true,
      displayOrder: 3,
      active: true,
      minValue: 180,
      maxValue: 10000,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-104',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Proposed Center Carpet Area (in Sq. Ft.)',
      fieldCode: 'CENTER_CARPET_AREA',
      fieldType: 'Decimal',
      placeholder: 'e.g. 3500.50',
      helpText: 'Minimum covered area required: 3000 sq ft',
      required: true,
      displayOrder: 4,
      active: true,
      minValue: 3000,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-105',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Average Audited Turnover for Last 3 FY (in Lakhs INR)',
      fieldCode: 'AVG_TURNOVER_LAKHS',
      fieldType: 'Currency',
      placeholder: 'e.g. 150.00',
      helpText: 'As per certified CA certificate with UDIN',
      required: true,
      displayOrder: 5,
      active: true,
      minValue: 50,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-106',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Historical Placement Percentage Achieved',
      fieldCode: 'HISTORICAL_PLACEMENT_PERC',
      fieldType: 'Percentage',
      placeholder: 'e.g. 72.5',
      helpText: 'Percentage of placed candidates verified by employer pay slips',
      required: false,
      displayOrder: 6,
      active: true,
      minValue: 0,
      maxValue: 100,
      hasHistoricalResponses: false
    },
    {
      id: 'FLD-107',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Nodal Center Head Contact Email',
      fieldCode: 'NODAL_EMAIL',
      fieldType: 'Email',
      placeholder: 'centerhead@organization.org',
      helpText: 'All official evaluation intimations will be dispatched to this address',
      required: true,
      displayOrder: 7,
      active: true,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-108',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Nodal Mobile Number (with WhatsApp capability)',
      fieldCode: 'NODAL_MOBILE',
      fieldType: 'Mobile',
      placeholder: '9876543210',
      helpText: '10-digit Indian mobile number for SMS OTP and verification alerts',
      required: true,
      displayOrder: 8,
      active: true,
      pattern: '^[6-9]\\d{9}$',
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-109',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Expected Readiness / Commissioning Date',
      fieldCode: 'COMMISSIONING_DATE',
      fieldType: 'Date',
      placeholder: 'DD/MM/YYYY',
      helpText: 'Target date by which center will be ready for physical joint inspection',
      required: true,
      displayOrder: 9,
      active: true,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-110',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Center Building Ownership Status',
      fieldCode: 'OWNERSHIP_TYPE',
      fieldType: 'Dropdown',
      placeholder: 'Select status',
      helpText: 'Lease deed must have minimum validity of 3 years from EOI publication',
      required: true,
      displayOrder: 10,
      active: true,
      options: [
        { label: 'Self Owned Freehold Property', value: 'OWNED' },
        { label: 'Registered Long-Term Lease (3+ Years)', value: 'REGISTERED_LEASE' },
        { label: 'Government / Institutional Allotment', value: 'GOV_ALLOTTED' },
        { label: 'Rent Agreement with Renewal Clause', value: 'RENTAL' }
      ],
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-111',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Center Power Backup & DG Set Facility',
      fieldCode: 'POWER_BACKUP_AVAILABLE',
      fieldType: 'Radio',
      required: true,
      displayOrder: 11,
      active: true,
      options: [
        { label: 'Dedicated DG Set (Minimum 15 KVA)', value: 'DG_SET' },
        { label: 'Solar Hybrid Inverter System', value: 'SOLAR_HYBRID' },
        { label: 'Standard Commercial Inverter Only', value: 'STANDARD_INVERTER' }
      ],
      hasHistoricalResponses: false
    },
    {
      id: 'FLD-112',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Statutory Safety Amenities Available',
      fieldCode: 'SAFETY_AMENITIES',
      fieldType: 'Checkbox',
      required: true,
      displayOrder: 12,
      active: true,
      options: [
        { label: 'CCTV Surveillance with 30-Day Storage', value: 'CCTV' },
        { label: 'Fire Extinguishers & Exit Signage', value: 'FIRE_SAFETY' },
        { label: 'Biometric Attendance Integration', value: 'BIOMETRIC' },
        { label: 'Ramp / Assistive Access for Divyangjan', value: 'RAMP_ACCESS' },
        { label: 'Separate Sanitized Washrooms for Females', value: 'FEMALE_WASHROOM' }
      ],
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-113',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Center Layout Plan & Infrastructure Photographs',
      fieldCode: 'LAYOUT_PHOTOS_UPLOAD',
      fieldType: 'File Upload',
      helpText: 'Consolidated PDF showing floor plan, classrooms, lab equipment and entrance',
      required: true,
      displayOrder: 13,
      active: true,
      allowedFileTypes: 'PDF',
      maxFileSizeMB: 10,
      multipleFiles: false,
      hasHistoricalResponses: true
    },
    {
      id: 'FLD-114',
      eoiId: 'EOI-2025-001',
      fieldLabel: 'Brief Description of Industry Tie-Ups for On-Job Training (OJT)',
      fieldCode: 'OJT_INDUSTRY_TIEUPS',
      fieldType: 'Textarea',
      placeholder: 'Detail local industrial tie-ups, MoUs signed, and guest faculty arrangements...',
      helpText: 'Maximum 500 words summary',
      required: false,
      displayOrder: 14,
      active: true,
      maxLength: 2000,
      hasHistoricalResponses: false
    }
  ];

  getFieldsForEoi(eoiId: string): Observable<EoiFormField[]> {
    const fields = this.fieldsStore
      .filter(f => f.eoiId === eoiId && !f.archived)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    // If no fields found for this EOI, return generic copy of default template
    if (fields.length === 0) {
      const cloned = this.fieldsStore
        .filter(f => f.eoiId === 'EOI-2025-001')
        .map(f => ({ ...f, id: `FLD-${Math.floor(1000 + Math.random() * 9000)}`, eoiId, hasHistoricalResponses: false }));
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

  // Rule 5 & 28: If applications exist, archive/deactivate instead of physical delete
  deleteOrArchiveField(fieldId: string): Observable<{ success: boolean; action: 'deleted' | 'archived' }> {
    const idx = this.fieldsStore.findIndex(f => f.id === fieldId);
    if (idx === -1) return of({ success: false, action: 'deleted' });

    const field = this.fieldsStore[idx];
    if (field.hasHistoricalResponses) {
      // Archive to preserve historical responses
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
    return of(true);
  }
}
