import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import {
  DynamicFormBuilderComponent,
  DynamicFormBuilderItem
} from './dynamic-form-builder.component';
import { DataEngineService } from '../../core/services/data-engine.service';

describe('DynamicFormBuilderComponent', () => {
  let mockForms: DynamicFormBuilderItem[];
  let mockDataEngine: any;

  beforeEach(() => {
    mockForms = [
      {
        sNo: 1,
        id: 'f1',
        formType: 'Inspection Form',
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
      { provide: DataEngineService, useValue: mockDataEngine }
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

  it('has correct table columns for Form Type, Status, and Form actions', () => {
    const comp = createComponent();
    expect(comp.tableColumns.map(c => c.label)).toEqual(['S. No.', 'Form Type', 'Status', 'Form actions']);
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

    // Previous step
    comp.previewPrevStep();
    expect(comp.previewStepIndex()).toBe(0);

    comp.closePreviewModal();
    expect(comp.showPreviewModal()).toBe(false);
  });
});
