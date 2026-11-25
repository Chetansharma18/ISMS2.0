import { describe, expect, it } from 'vitest';
import { FormManagerForm } from './form-manager.model';
import {
  isStepSchema,
  moduleOptions,
  newEditorField,
  newEditorForm,
  parseVisibility,
  schemaSteps,
  setStepMode,
  suggestFormKey,
  syncFieldKey,
  toEditorForm,
  toRendererItem,
  toSchema
} from './form-manager.util';

const SAVED: FormManagerForm = {
  id: 7,
  formKey: 'center-inspection',
  title: 'Center Inspection',
  moduleName: 'EOI',
  description: 'Site visit',
  isActive: true,
  currentVersion: 3,
  createdAt: '2026-01-01T00:00:00Z',
  activeSchema: {
    title: 'Center Inspection',
    fields: [
      { fieldKey: 'lab_photo', label: 'Lab Photo', fieldType: 'file', isRequired: true, displayOrder: 3, colSpan: 12, sectionName: 'Infrastructure',
        validation: { allowedExtensions: '.jpg', maxFileSizeMb: 5 } },
      { fieldKey: 'center_name', label: 'Center Name', fieldType: 'text', isRequired: true, displayOrder: 1, colSpan: 6, sectionName: 'Basic',
        validation: { minLength: 3, maxLength: 100 } },
      { fieldKey: 'has_lab', label: 'Has Lab', fieldType: 'radio', isRequired: false, displayOrder: 2, colSpan: 6, sectionName: 'Basic',
        options: [{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }], visibilityCondition: "center_name != ''" }
    ]
  }
};

describe('form-manager.util', () => {
  it('reads a step form from section names, in display order', () => {
    expect(isStepSchema(SAVED.activeSchema)).toBe(true);
    expect(schemaSteps(SAVED.activeSchema).map(s => [s.title, s.fields.map(f => f.fieldKey)])).toEqual([
      ['Basic', ['center_name', 'has_lab']],
      ['Infrastructure', ['lab_photo']]
    ]);
  });

  it('turns a saved form into the editor and back into the same schema', () => {
    const editor = toEditorForm(SAVED);
    expect(editor.id).toBe(7);
    expect(editor.isStepForm).toBe(true);
    expect(editor.steps.map(s => s.title)).toEqual(['Basic', 'Infrastructure']);
    expect(editor.steps[0].fields[1].optionsText).toBe('Yes, No');

    const schema = toSchema(editor);
    expect(schema.title).toBe('Center Inspection');
    expect(schema.fields.map(f => [f.fieldKey, f.displayOrder, f.sectionName])).toEqual([
      ['center_name', 1, 'Basic'],
      ['has_lab', 2, 'Basic'],
      ['lab_photo', 3, 'Infrastructure']
    ]);
    expect(schema.fields[0].validation).toEqual({ minLength: 3, maxLength: 100 });
    expect(schema.fields[1].options).toEqual([{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]);
    expect(schema.fields[1].visibilityCondition).toBe("center_name != ''");
    expect(schema.fields[2].validation).toEqual({ allowedExtensions: '.jpg', maxFileSizeMb: 5 });
    expect(schema.fields[2].colSpan).toBe(12);
  });

  it('saves a direct form without section names and drops untouched empty field rows', () => {
    const form = newEditorForm();
    form.title = 'Feedback';
    form.steps[0].fields[0].label = 'Comments';
    form.steps[0].fields[0].fieldType = 'textarea';
    syncFieldKey(form, form.steps[0].fields[0]);
    form.steps[0].fields.push(newEditorField());

    const schema = toSchema(form);
    expect(schema.fields).toHaveLength(1);
    expect(schema.fields[0]).toMatchObject({ fieldKey: 'comments', fieldType: 'textarea', sectionName: null, displayOrder: 1 });
    // Only the rules of the field's type are sent.
    expect(schema.fields[0].validation).toBeNull();
    expect(schema.fields[0].options).toEqual([]);
  });

  it('keeps field keys following the label and unique until edited', () => {
    const form = newEditorForm();
    const a = form.steps[0].fields[0];
    const b = newEditorField();
    form.steps[0].fields.push(b);
    a.label = 'Center Name';
    syncFieldKey(form, a);
    b.label = 'Center Name';
    syncFieldKey(form, b);
    expect([a.fieldKey, b.fieldKey]).toEqual(['center_name', 'center_name_2']);

    b.keyEdited = true;
    b.label = 'Other';
    syncFieldKey(form, b);
    expect(b.fieldKey).toBe('center_name_2');
    expect(suggestFormKey('Center Inspection Form')).toBe('center-inspection-form');
  });

  it('switches between direct and step form without losing fields', () => {
    const editor = toEditorForm(SAVED);
    setStepMode(editor, false);
    expect(editor.steps).toHaveLength(1);
    expect(editor.steps[0].fields).toHaveLength(3);
    expect(toSchema(editor).fields.every(f => f.sectionName === null)).toBe(true);
    setStepMode(editor, true);
    expect(editor.steps[0].title).toBe('Step 1');
  });

  it('draws the schema with the shared renderer types', () => {
    const item = toRendererItem({ id: 7, title: 'Center Inspection', version: 3 }, SAVED.activeSchema!);
    expect(item.isStepForm).toBe(true);
    expect(item.steps?.map(s => s.title)).toEqual(['Basic', 'Infrastructure']);
    expect(item.fields.map(f => f.type)).toEqual(['text', 'radio', 'file']);
    expect(item.fields[1].conditions).toEqual([{ fieldId: 'center_name', operator: 'notEquals', value: '', action: 'show' }]);
    expect(parseVisibility('a > 3')).toEqual([]);
  });

  it('offers the product modules plus any module the backend already has', () => {
    expect(moduleOptions([{ ...SAVED, moduleName: 'Grievance' }])).toEqual(['EOI', 'OTR', 'Grievance']);
  });
});
