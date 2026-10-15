import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import {
  DynamicFormBuilderComponent,
  DynamicFormBuilderItem
} from './dynamic-form-builder.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { NotificationService } from '../../core/services/notification.service';

describe('DynamicFormBuilderComponent', () => {
  let mockForms: DynamicFormBuilderItem[];
  let mockDataEngine: any;

  beforeEach(() => {
    mockForms = [
      {
        sNo: 1,
        id: 'f1',
        formType: 'Inspection Form',
        isStepForm: false,
        status: 'Active',
        fields: [
          { id: 'fld-1', label: 'Center Name', type: 'text', mandatory: true },
          { id: 'fld-2', label: 'Center Photo', type: 'photo', mandatory: true, minPhotos: 1, maxPhotos: 5, maxSizeMb: 5 }
        ]
      },
      {
        sNo: 2,
        id: 'f2',
        formType: 'Candidate Form',
        isStepForm: false,
        status: 'Active',
        fields: [
          { id: 'fld-3', label: 'Candidate Age', type: 'number', mandatory: false },
          { id: 'fld-4', label: 'Gender', type: 'dropdown', mandatory: true, options: ['Male', 'Female', 'Other'] }
        ]
      }
    ];

    mockDataEngine = {
      for: (key: string) => {
        if (key === 'DYNAMIC_FORM_BUILDER') {
          return {
            getAll: () => of(mockForms),
            create: (item: DynamicFormBuilderItem) => {
              mockForms.push(item);
              return of(item);
            },
            update: (id: string, patch: Partial<DynamicFormBuilderItem>) => {
              const idx = mockForms.findIndex(f => f.id === id);
              if (idx >= 0) {
                mockForms[idx] = { ...mockForms[idx], ...patch };
                return of(mockForms[idx]);
              }
              return of(patch as DynamicFormBuilderItem);
            },
            delete: (id: string) => {
              mockForms = mockForms.filter(f => f.id !== id);
              return of(true);
            }
          };
        }
        return {
          getAll: () => of([])
        };
      }
    };
  });

  function createComponent(): DynamicFormBuilderComponent {
    const injector = createEnvironmentInjector([
      { provide: DataEngineService, useValue: mockDataEngine },
      { provide: NotificationService, useClass: NotificationService }
    ], null as any);

    return runInInjectionContext(injector, () => new DynamicFormBuilderComponent());
  }

  it('initializes forms list correctly', () => {
    const comp = createComponent();
    expect(comp.forms().length).toBe(2);
    expect(comp.filteredForms().length).toBe(2);
    expect(comp.forms()[0].formType).toBe('Inspection Form');
  });

  it('filters forms by search query', () => {
    const comp = createComponent();

    // Search by form name
    comp.searchQuery.set('Candidate');
    expect(comp.filteredForms().length).toBe(1);
    expect(comp.filteredForms()[0].formType).toBe('Candidate Form');

    // Search by field label
    comp.searchQuery.set('Photo');
    expect(comp.filteredForms().length).toBe(1);
    expect(comp.filteredForms()[0].formType).toBe('Inspection Form');

    // Non-matching
    comp.searchQuery.set('NonExistent');
    expect(comp.filteredForms().length).toBe(0);
  });

  it('adds a new form with multiple dynamic fields', () => {
    const comp = createComponent();
    comp.openAddModal();

    expect(comp.showBuilderModal()).toBe(true);
    expect(comp.isEditing()).toBe(false);

    comp.formData.formType = 'SDC Batch Verification';
    comp.formData.fields = [
      { id: '1', label: 'Trainer Name', type: 'text', mandatory: true },
      { id: '2', label: 'Attendance Photo', type: 'photo', mandatory: true, minPhotos: 2, maxPhotos: 6, maxSizeMb: 10 }
    ];

    comp.submitForm();

    expect(comp.showBuilderModal()).toBe(false);
    expect(comp.forms().length).toBe(3);
    expect(comp.forms()[0].formType).toBe('SDC Batch Verification');
    expect(comp.forms()[0].fields[1].minPhotos).toBe(2);
    expect(comp.forms()[0].fields[1].maxSizeMb).toBe(10);
  });

  it('reorders fields using moveFieldUp and moveFieldDown', () => {
    const comp = createComponent();
    comp.openAddModal();

    comp.formData.fields = [
      { id: '1', label: 'Field 1', type: 'text', mandatory: false },
      { id: '2', label: 'Field 2', type: 'number', mandatory: false },
      { id: '3', label: 'Field 3', type: 'datepicker', mandatory: false }
    ];

    // Move Field 2 up
    comp.moveFieldUp(1);
    expect(comp.formData.fields.map(f => f.label)).toEqual(['Field 2', 'Field 1', 'Field 3']);

    // Move Field 2 down
    comp.moveFieldDown(0);
    expect(comp.formData.fields.map(f => f.label)).toEqual(['Field 1', 'Field 2', 'Field 3']);
  });

  it('supports drag and drop reordering of fields', () => {
    const comp = createComponent();
    comp.openAddModal();

    comp.formData.fields = [
      { id: '1', label: 'Alpha', type: 'text', mandatory: false },
      { id: '2', label: 'Beta', type: 'number', mandatory: false },
      { id: '3', label: 'Gamma', type: 'datepicker', mandatory: false }
    ];

    // Drag Alpha (index 0) to index 2
    comp.onDragStart(0, { dataTransfer: { effectAllowed: '', setData: () => {} } } as any);
    expect(comp.draggedIndex).toBe(0);

    comp.onDrop(2, { preventDefault: () => {} } as any);
    expect(comp.formData.fields.map(f => f.label)).toEqual(['Beta', 'Gamma', 'Alpha']);
    expect(comp.draggedIndex).toBeNull();
  });

  it('edits an existing form', () => {
    const comp = createComponent();
    const target = comp.forms()[0];

    comp.openEditModal(target);
    expect(comp.showBuilderModal()).toBe(true);
    expect(comp.isEditing()).toBe(true);

    comp.formData.formType = 'Updated Inspection Form';
    comp.submitForm();

    expect(comp.showBuilderModal()).toBe(false);
    expect(comp.forms()[0].formType).toBe('Updated Inspection Form');
  });

  it('toggles form status', () => {
    const comp = createComponent();
    const item = comp.forms()[0];
    expect(item.status).toBe('Active');

    comp.toggleStatus(item);
    expect(comp.forms()[0].status).toBe('Inactive');

    comp.toggleStatus(comp.forms()[0]);
    expect(comp.forms()[0].status).toBe('Active');
  });

  it('deletes a form upon confirmation', () => {
    const comp = createComponent();
    expect(comp.forms().length).toBe(2);

    comp.openDeleteConfirmModal(comp.forms()[0]);
    expect(comp.showDeleteModal()).toBe(true);

    comp.confirmDeleteForm();
    expect(comp.showDeleteModal()).toBe(false);
    expect(comp.forms().length).toBe(1);
  });

  it('has correct table columns for Form Type and Form actions', () => {
    const comp = createComponent();
    expect(comp.tableColumns.map(c => c.label)).toEqual(['S. No.', 'Form Type', 'Form actions']);
  });

  it('handles step form creation, adding steps, step fields, and reordering', () => {
    const comp = createComponent();
    comp.openAddModal();

    // Toggle step form
    comp.formData.formType = 'Center Verification Wizard';
    comp.formData.isStepForm = true;
    comp.onStepFormToggle();

    expect(comp.formData.steps.length).toBe(1);
    expect(comp.activeStepIndex()).toBe(0);

    // Add Step 2
    comp.addStep();
    expect(comp.formData.steps.length).toBe(2);

    // Set titles and step 1 field
    comp.formData.steps[0].title = 'General Information';
    comp.formData.steps[0].fields[0].label = 'Center Name';
    comp.formData.steps[1].title = 'Equipment Photos';

    // Switch to step 2 and add field
    comp.activeStepIndex.set(1);
    const activeStep = comp.getActiveStep();
    expect(activeStep?.title).toBe('Equipment Photos');

    comp.addFieldToActiveStep();
    expect(activeStep?.fields.length).toBe(2);

    activeStep!.fields[0].label = 'Lab Photo';
    activeStep!.fields[0].type = 'photo';
    activeStep!.fields[0].minPhotos = 2;
    activeStep!.fields[0].maxPhotos = 4;
    activeStep!.fields[0].maxSizeMb = 5;

    activeStep!.fields[1].label = 'Classroom Photo';
    activeStep!.fields[1].type = 'photo';

    // Reorder step fields
    comp.moveStepFieldUp(1);
    expect(activeStep!.fields.map(f => f.label)).toEqual(['Classroom Photo', 'Lab Photo']);

    comp.moveStepFieldDown(0);
    expect(activeStep!.fields.map(f => f.label)).toEqual(['Lab Photo', 'Classroom Photo']);

    // Drag and drop within step
    comp.onStepDragStart(0, { dataTransfer: { effectAllowed: '', setData: () => {} } } as any);
    comp.onStepDrop(1, { preventDefault: () => {} } as any);
    expect(activeStep!.fields.map(f => f.label)).toEqual(['Classroom Photo', 'Lab Photo']);

    // Submit step form
    comp.submitForm();
    expect(comp.showBuilderModal()).toBe(false);
    expect(comp.forms().length).toBe(3);
    expect(comp.forms()[0].formType).toBe('Center Verification Wizard');
    expect(comp.forms()[0].isStepForm).toBe(true);
    expect(comp.forms()[0].steps?.length).toBe(2);
  });

  it('handles step form stepper navigation in preview modal', () => {
    const comp = createComponent();
    const stepForm: DynamicFormBuilderItem = {
      sNo: 10,
      id: 'step-form-1',
      formType: 'Wizard Form',
      isStepForm: true,
      status: 'Active',
      steps: [
        {
          id: 's1',
          stepNumber: 1,
          title: 'Step 1: Basic Info',
          fields: [{ id: 'f1', label: 'Name', type: 'text', mandatory: true }]
        },
        {
          id: 's2',
          stepNumber: 2,
          title: 'Step 2: Uploads',
          fields: [{ id: 'f2', label: 'ID Proof', type: 'photo', mandatory: true }]
        }
      ],
      fields: []
    };

    comp.openPreviewModal(stepForm);
    expect(comp.showPreviewModal()).toBe(true);
    expect(comp.previewStepIndex()).toBe(0);

    // Next step
    comp.previewNextStep(stepForm);
    expect(comp.previewStepIndex()).toBe(1);
    expect(comp.isReviewStep(stepForm, 1)).toBe(false);
    expect(comp.getStepSubtitle(stepForm, 1)).toBe('Please fill in details for Step 2: Uploads');

    // Previous step
    comp.previewPrevStep();
    expect(comp.previewStepIndex()).toBe(0);

    // Jump to last step and submit
    comp.previewNextStep(stepForm);
    comp.submitPreviewForm(stepForm);
    expect(comp.showPreviewModal()).toBe(false);
  });

  it('handles Organisation Registration Form 4-step wizard preview, uploads, same address toggle and review jump', () => {
    const comp = createComponent();
    const companyForm: DynamicFormBuilderItem = {
      sNo: 1,
      id: 'form-company-reg',
      formType: 'Organisation Registration Form',
      isStepForm: true,
      status: 'Active',
      steps: [
        { id: 's1', stepNumber: 1, title: 'Organisation Details', fields: [{ id: 'crf-1', label: 'Organisation Name', type: 'text', mandatory: true }, { id: 'crf-6', label: 'Certificate of Registration', type: 'photo', mandatory: true }] },
        { id: 's2', stepNumber: 2, title: 'Authorized Person', fields: [{ id: 'crf-201', label: 'Full Name', type: 'text', mandatory: true }] },
        { id: 's3', stepNumber: 3, title: 'Bank Details', fields: [{ id: 'crf-301', label: 'Name of the Bank', type: 'dropdown', mandatory: true }] },
        { id: 's4', stepNumber: 4, title: 'Preview & Submit', fields: [] }
      ],
      fields: []
    };

    comp.openPreviewModal(companyForm);
    expect(comp.showPreviewModal()).toBe(true);
    expect(comp.previewStepIndex()).toBe(0);
    expect(comp.previewFormValues['crf-5']).toBe('Rajasthan');
    expect(comp.previewFormValues['crf-9']).toBe('No');
    expect(comp.getStepSubtitle(companyForm, 0)).toBe('Please provide your organisation details to complete the registration process.');

    // Simulate file upload
    comp.simulateFileUpload(companyForm.steps![0].fields[1]);
    expect(comp.uploadedFiles['crf-6']).toContain('.pdf');

    // Remove uploaded file
    comp.removeUploadedFile('crf-6', { stopPropagation: () => {} } as any);
    expect(comp.uploadedFiles['crf-6']).toBeUndefined();

    // Toggle same address
    comp.previewFormValues['crf-15'] = '123 Jaipur Road';
    comp.previewFormValues['crf-18'] = '302001';
    comp.isOfficeSameAsRegistered = true;
    comp.onSameAddressToggle();
    expect(comp.previewFormValues['crf-19']).toBe('123 Jaipur Road');
    expect(comp.previewFormValues['crf-22']).toBe('302001');

    // Navigate to Step 2
    comp.previewNextStep(companyForm);
    expect(comp.previewStepIndex()).toBe(1);
    expect(comp.getStepSubtitle(companyForm, 1)).toBe('Provide details of the person authorized to sign and represent the organization.');

    // Navigate to Step 3
    comp.previewNextStep(companyForm);
    expect(comp.previewStepIndex()).toBe(2);
    expect(comp.getStepSubtitle(companyForm, 2)).toBe('Provide bank account details for receiving payments under the scheme.');

    // Save as draft
    comp.saveAsDraft();

    // Navigate to Step 4 (Review & Submit)
    comp.previewNextStep(companyForm);
    expect(comp.previewStepIndex()).toBe(3);
    expect(comp.isReviewStep(companyForm, 3)).toBe(true);
    expect(comp.getStepSubtitle(companyForm, 3)).toBe('Please verify the information provided below. You can edit any section if required.');

    // Jump from Review to Step 1 via Edit Details
    comp.goToPreviewStep(0);
    expect(comp.previewStepIndex()).toBe(0);

    // Jump back to Review Step 4
    comp.goToPreviewStep(3);
    expect(comp.previewStepIndex()).toBe(3);

    // Download PDF
    comp.downloadPdf();

    // Submit registration
    comp.registerSubmit();
    expect(comp.showPreviewModal()).toBe(false);
  });

  it('handles EOI Configuration Form preview, scheme auto-selection, document rows, and publish EOI', () => {
    const comp = createComponent();
    const eoiForm: DynamicFormBuilderItem = {
      id: 'form-eoi-config',
      sNo: 2,
      formType: 'EOI Configuration Form',
      isStepForm: false,
      status: 'Active',
      fields: [
        { id: 'eoi-1', label: 'EOI Reference No.', type: 'text', mandatory: true },
        { id: 'eoi-2', label: 'Scheme', type: 'dropdown', mandatory: true },
        { id: 'eoi-3', label: 'Scheme Category', type: 'dropdown', mandatory: false },
        { id: 'eoi-4', label: 'Date of EoI Published', type: 'datepicker', mandatory: true },
        { id: 'eoi-5', label: 'Last Date of EoI Submission', type: 'datepicker', mandatory: true },
        { id: 'eoi-6', label: 'EOI Category', type: 'dropdown', mandatory: true },
        { id: 'eoi-7', label: 'EOI Description', type: 'text', mandatory: false },
        { id: 'eoi-8', label: 'EMD Fee', type: 'number', mandatory: true },
        { id: 'eoi-9', label: 'Process Fee', type: 'number', mandatory: true },
        { id: 'eoi-10', label: 'Attach File', type: 'photo', mandatory: true },
        { id: 'eoi-11', label: 'EOI DOCUMENTS', type: 'dropdown', mandatory: false }
      ]
    };

    expect(comp.isEoiForm(eoiForm)).toBe(true);

    comp.openPreviewModal(eoiForm);
    expect(comp.showPreviewModal()).toBe(true);
    expect(comp.previewFormValues['eoi-1']).toBe('EOI/RAJ/SKILL/2026/04');
    expect(comp.previewFormValues['eoi-4']).toBe('10 / 13 / 2026');
    expect(comp.previewFormValues['eoi-5']).toBe('10 / 13 / 2026');
    expect(comp.eoiDocumentRows.length).toBe(0);

    // Select scheme -> auto-selects scheme category and auto-loads default documents
    comp.onEoiSchemeChange('Vishwakarma Yuva Udyami Protsahan Yojana');
    expect(comp.previewFormValues['eoi-3']).toBe('Rajvik');
    expect(comp.eoiDocumentRows.length).toBe(3);

    // Add manual document row
    comp.addEoiDocumentRow();
    expect(comp.eoiDocumentRows.length).toBe(4);
    comp.eoiDocumentRows[3].docName = 'Power of Attorney / Board Resolution';

    // Simulate upload on document row
    comp.simulateRowDocUpload(3);
    expect(comp.eoiDocumentRows[3].uploadedFile).toContain('Power_of_Attorney');

    // Remove a document row
    comp.removeEoiDocumentRow(0);
    expect(comp.eoiDocumentRows.length).toBe(3);

    // Attach File simulation
    comp.simulateFileUpload({ id: 'eoi-10', label: 'EOI Proposal File', type: 'photo', mandatory: true });
    expect(comp.uploadedFiles['eoi-10']).toBeTruthy();

    // Publish EOI
    comp.publishEoi();
    expect(comp.showPreviewModal()).toBe(false);
  });

  it('handles Apply for EOI Form 2-step wizard, OTR documents, 16 proposal checklist, tabs, and submit', () => {
    const comp = createComponent();
    const applyEoiForm: DynamicFormBuilderItem = {
      id: 'form-apply-eoi',
      sNo: 3,
      formType: 'Apply for EOI Form',
      isStepForm: true,
      status: 'Active',
      steps: [
        {
          id: 'step-otr',
          stepNumber: 1,
          title: 'OTR Profile',
          fields: [
            { id: 'eoi-otr-1', label: 'NAME (SHORT NAME)', type: 'text', mandatory: true },
            { id: 'eoi-otr-2', label: 'FULL NAME OF ORGANIZATION', type: 'text', mandatory: true },
            { id: 'eoi-otr-4', label: 'REGISTRATION NUMBER (CIN)', type: 'text', mandatory: true }
          ]
        },
        {
          id: 'step-upload-docs',
          stepNumber: 2,
          title: 'Upload Documents',
          fields: [
            { id: 'eoi-doc-1', label: 'Covering Letter (Annexure 1)', type: 'photo', mandatory: true },
            { id: 'eoi-doc-7', label: 'Training & Placement Track Record (Annexure 5)', type: 'photo', mandatory: false }
          ]
        }
      ],
      fields: []
    };

    expect(comp.isApplyEoiForm(applyEoiForm)).toBe(true);
    expect(comp.isEoiForm(applyEoiForm)).toBe(false);

    // Open Preview
    comp.openPreviewModal(applyEoiForm);
    expect(comp.showPreviewModal()).toBe(true);
    expect(comp.applyEoiStep()).toBe(1);
    expect(comp.getPreviewModalMaxWidth()).toBe('max-w-[1240px]');
    expect(comp.previewFormValues['eoi-otr-1']).toBe('Company 1');
    expect(comp.previewFormValues['eoi-otr-4']).toBe('U80302RJ2022NPL079811');

    // OTR Document actions
    expect(comp.otrRegDocs.length).toBe(4);
    comp.changeOtrDoc(comp.otrRegDocs[0]);
    expect(comp.otrRegDocs[0].fileName).toContain('Updated_2026.pdf');
    comp.removeOtrDoc(comp.otrRegDocs[1]);
    expect(comp.otrRegDocs[1].fileName).toBe('Not_Uploaded.pdf');

    // Proceed to Step 2: Upload Documents
    comp.applyEoiStep.set(2);
    expect(comp.applyEoiStep()).toBe(2);
    expect(comp.applyEoiDocuments.length).toBe(16);

    // Filter Tabs
    comp.selectedApplyDocTab.set('mandatory');
    expect(comp.getFilteredApplyDocs().length).toBe(6);
    comp.selectedApplyDocTab.set('annexure');
    expect(comp.getFilteredApplyDocs().length).toBe(8);
    comp.selectedApplyDocTab.set('remaining');
    expect(comp.getFilteredApplyDocs().length).toBe(2);
    comp.selectedApplyDocTab.set('all');
    expect(comp.getFilteredApplyDocs().length).toBe(16);

    // Document upload and removal
    expect(comp.getApplyMandatoryUploadedCount()).toBe(0);
    comp.uploadApplyDoc(1);
    expect(comp.getApplyMandatoryUploadedCount()).toBe(1);
    comp.removeApplyDoc(1);
    expect(comp.getApplyMandatoryUploadedCount()).toBe(0);

    // Attach All Mandated Annexures button
    comp.attachAllApplyMandatedAnnexures();
    expect(comp.getApplyMandatoryUploadedCount()).toBe(6);
    expect(comp.getApplyAnnexureUploadedCount()).toBe(8);
    expect(comp.getApplyRemainingUploadedCount()).toBe(2);

    // Submit Apply EOI
    comp.submitApplyEoi();
    expect(comp.showPreviewModal()).toBe(false);
  });

  it('handles Department User Registration Form preview, fields, scheme multi-select, and submission', () => {
    const comp = createComponent();
    const deptUserItem: DynamicFormBuilderItem = {
      sNo: 4,
      id: 'form-dept-user',
      formType: 'Department User Registration Form',
      isStepForm: false,
      status: 'Active',
      fields: [
        { id: 'du-1', label: 'SSO ID', type: 'text', mandatory: true },
        { id: 'du-2', label: 'Role Type', type: 'dropdown', mandatory: true },
        { id: 'du-3', label: 'First Name', type: 'text', mandatory: true },
        { id: 'du-4', label: 'Last Name', type: 'text', mandatory: true },
        { id: 'du-5', label: 'E-Mail', type: 'text', mandatory: true },
        { id: 'du-6', label: 'Mobile No.', type: 'number', mandatory: true },
        { id: 'du-7', label: 'Date Of Birth', type: 'datepicker', mandatory: false },
        { id: 'du-8', label: 'Aadhaar Id', type: 'number', mandatory: false },
        { id: 'du-9', label: 'Designation', type: 'dropdown', mandatory: false },
        { id: 'du-10', label: 'Scheme Name', type: 'dropdown', mandatory: false },
        { id: 'du-11', label: 'District', type: 'dropdown', mandatory: false },
        { id: 'du-12', label: 'Block Name', type: 'dropdown', mandatory: false }
      ]
    };

    expect(comp.isDeptUserForm(deptUserItem)).toBe(true);

    // Open Preview
    comp.openPreviewModal(deptUserItem);
    expect(comp.showPreviewModal()).toBe(true);
    expect(comp.getPreviewModalMaxWidth()).toBe('max-w-[780px]');

    // Check defaults
    expect(comp.previewFormValues['du-7']).toBe('10 / 13 / 2026');
    expect(comp.previewFormValues['du-11']).toBe('Jaipur');
    expect(comp.previewFormValues['du-12']).toBe('All Blocks');

    // Scheme Multi-Select toggles
    expect(comp.isDeptUserAllSchemesSelected()).toBe(true);
    expect(comp.getDeptUserSchemeDisplayLabel()).toContain('All Schemes');

    comp.toggleDeptUserSchemeOption('Vishwakarma Yuva Udyami Protsahan Yojana');
    expect(comp.isDeptUserAllSchemesSelected()).toBe(false);

    // Clicking All Schemes when not all are selected will select all
    comp.toggleDeptUserAllSchemes();
    expect(comp.isDeptUserAllSchemesSelected()).toBe(true);

    // Clicking All Schemes when all are selected will unselect all
    comp.toggleDeptUserAllSchemes();
    expect(comp.isDeptUserAllSchemesSelected()).toBe(false);
    expect(comp.getDeptUserSchemeDisplayLabel()).toBe('Select Scheme Name');

    // Re-select all
    comp.toggleDeptUserAllSchemes();
    expect(comp.isDeptUserAllSchemesSelected()).toBe(true);

    // Validation failure on empty mandatory fields
    comp.submitDeptUser();
    expect(comp.deptUserSubmitted()).toBe(true);
    expect(comp.showPreviewModal()).toBe(true); // Still open due to validation error

    // Fill mandatory fields and submit
    comp.previewFormValues['du-1'] = 'SSO_1008';
    comp.previewFormValues['du-2'] = 'Department User';
    comp.previewFormValues['du-3'] = 'John';
    comp.previewFormValues['du-4'] = 'Doe';
    comp.previewFormValues['du-5'] = 'name@example.com';
    comp.previewFormValues['du-6'] = '9876543210';

    comp.submitDeptUser();
    expect(comp.showPreviewModal()).toBe(false);
  });

  it('toggles step form mode via toggleStepFormMode', () => {
    const comp = createComponent();
    comp.openAddModal();
    expect(comp.formData.isStepForm).toBe(false);

    comp.toggleStepFormMode();
    expect(comp.formData.isStepForm).toBe(true);
    expect(comp.formData.steps.length).toBeGreaterThan(0);

    comp.toggleStepFormMode();
    expect(comp.formData.isStepForm).toBe(false);
  });
});

