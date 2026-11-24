import { describe, it, expect } from 'vitest';
import {
  convertDirectToStep,
  convertStepToDirect,
  evaluateCondition,
  generateFieldKey,
  isFieldRequired,
  isFieldVisible,
  optionsToText,
  parseOptionsText,
  validateFieldsList,
  validateFieldValue
} from './dynamic-form-builder.util';
import { DynamicFormField, FormFieldCondition, FormStep } from '../../core/models/admin-masters.model';

describe('dynamic-form-builder.util', () => {
  describe('generateFieldKey', () => {
    it('generates snake_case key from label', () => {
      expect(generateFieldKey('Center Address')).toBe('center_address');
      expect(generateFieldKey('Candidate Phone No. (Primary)')).toBe('candidate_phone_no_primary');
    });

    it('generates fallback key when label is empty', () => {
      const key = generateFieldKey('');
      expect(key).toMatch(/^field_\d+$/);
    });
  });

  describe('parseOptionsText and optionsToText', () => {
    it('parses comma-separated string into trimmed array', () => {
      expect(parseOptionsText('Option 1, Option 2 , Option 3')).toEqual(['Option 1', 'Option 2', 'Option 3']);
      expect(parseOptionsText('')).toEqual([]);
    });

    it('formats options array into comma-separated text', () => {
      expect(optionsToText(['A', 'B', 'C'])).toBe('A, B, C');
      expect(optionsToText([])).toBe('');
    });
  });

  describe('evaluateCondition and isFieldVisible', () => {
    it('evaluates equals and notEquals conditions', () => {
      const condition: FormFieldCondition = {
        fieldId: 'f1',
        operator: 'equals',
        value: 'Yes',
        action: 'show'
      };
      expect(evaluateCondition(condition, { f1: 'Yes' })).toBe(true);
      expect(evaluateCondition(condition, { f1: 'No' })).toBe(false);

      const notEqualCond: FormFieldCondition = {
        fieldId: 'f1',
        operator: 'notEquals',
        value: 'Yes',
        action: 'show'
      };
      expect(evaluateCondition(notEqualCond, { f1: 'No' })).toBe(true);
      expect(evaluateCondition(notEqualCond, { f1: 'Yes' })).toBe(false);
    });

    it('evaluates contains, isNotEmpty, and number comparisons', () => {
      expect(evaluateCondition({ fieldId: 'txt', operator: 'contains', value: 'admin', action: 'show' }, { txt: 'Super Admin' })).toBe(true);
      expect(evaluateCondition({ fieldId: 'val', operator: 'isNotEmpty', value: '', action: 'show' }, { val: 'Hello' })).toBe(true);
      expect(evaluateCondition({ fieldId: 'val', operator: 'isNotEmpty', value: '', action: 'show' }, { val: '   ' })).toBe(false);
      expect(evaluateCondition({ fieldId: 'num', operator: 'greaterThan', value: 10, action: 'show' }, { num: 15 })).toBe(true);
      expect(evaluateCondition({ fieldId: 'num', operator: 'lessThan', value: 10, action: 'show' }, { num: 5 })).toBe(true);
    });

    it('controls field visibility via isFieldVisible', () => {
      const field: DynamicFormField = {
        id: 'child',
        label: 'GSTIN',
        type: 'text',
        mandatory: true,
        conditions: [
          { fieldId: 'gst_registered', operator: 'equals', value: 'Yes', action: 'show' }
        ]
      };
      expect(isFieldVisible(field, { gst_registered: 'Yes' })).toBe(true);
      expect(isFieldVisible(field, { gst_registered: 'No' })).toBe(false);
      expect(isFieldVisible(field, {})).toBe(false);
    });
  });

  describe('validateFieldValue', () => {
    it('returns error when mandatory field is empty', () => {
      const field: DynamicFormField = { id: 'f1', label: 'Candidate Name', type: 'text', mandatory: true };
      expect(validateFieldValue(field, '')).toBe('Candidate Name is required.');
      expect(validateFieldValue(field, 'John Doe')).toBeNull();
    });

    it('validates minLength and maxLength for text', () => {
      const field: DynamicFormField = {
        id: 'f1',
        label: 'Username',
        type: 'text',
        mandatory: false,
        validation: { minLength: 3, maxLength: 6 }
      };
      expect(validateFieldValue(field, 'ab')).toBe('Minimum 3 characters required.');
      expect(validateFieldValue(field, 'abcdefg')).toBe('Maximum length of 6 characters exceeded.');
      expect(validateFieldValue(field, 'abcd')).toBeNull();
    });

    it('validates email syntax', () => {
      const field: DynamicFormField = { id: 'email', label: 'Email', type: 'email', mandatory: false };
      expect(validateFieldValue(field, 'not-an-email')).toBe('Please enter a valid email address.');
      expect(validateFieldValue(field, 'user@gov.in')).toBeNull();
    });

    it('validates Indian 10-digit phone number', () => {
      const field: DynamicFormField = { id: 'mob', label: 'Mobile', type: 'phone', mandatory: false };
      expect(validateFieldValue(field, '12345')).toBe('Please enter a valid 10-digit Indian mobile number.');
      expect(validateFieldValue(field, '9876543210')).toBeNull();
    });

    it('validates number and currency ranges', () => {
      const field: DynamicFormField = {
        id: 'amount',
        label: 'Fee',
        type: 'currency',
        mandatory: false,
        validation: { min: 100, max: 5000 }
      };
      expect(validateFieldValue(field, '50')).toBe('Value cannot be less than 100.');
      expect(validateFieldValue(field, '₹6,000')).toBe('Value cannot exceed 5000.');
      expect(validateFieldValue(field, '₹1,500')).toBeNull();
    });

    it('validates mandatory checkbox and uploads', () => {
      const chk: DynamicFormField = { id: 'agree', label: 'Terms', type: 'checkbox', mandatory: true };
      expect(validateFieldValue(chk, false)).toBe('Terms must be checked.');
      expect(validateFieldValue(chk, true)).toBeNull();

      const upload: DynamicFormField = { id: 'doc', label: 'ID Proof', type: 'photo', mandatory: true };
      expect(validateFieldValue(upload, null)).toBe('Please upload ID Proof.');
      expect(validateFieldValue(upload, ['photo1.jpg'])).toBeNull();
    });

    it('skips validation for hidden conditional fields', () => {
      const field: DynamicFormField = {
        id: 'gstin',
        label: 'GSTIN',
        type: 'text',
        mandatory: true,
        conditions: [{ fieldId: 'gst', operator: 'equals', value: 'Yes', action: 'show' }]
      };
      // When gst is No, field is hidden, so should return null even though mandatory and empty
      expect(validateFieldValue(field, '', { gst: 'No' })).toBeNull();
      // When gst is Yes, field is visible, so empty value triggers error
      expect(validateFieldValue(field, '', { gst: 'Yes' })).toBe('GSTIN is required.');
    });
  });

  describe('validateFieldsList', () => {
    it('aggregates errors across a field list', () => {
      const fields: DynamicFormField[] = [
        { id: 'f1', label: 'Name', type: 'text', mandatory: true },
        { id: 'f2', label: 'Email', type: 'email', mandatory: true }
      ];
      const errors = validateFieldsList(fields, { f1: 'John', f2: 'invalid' });
      expect(errors['f1']).toBeUndefined();
      expect(errors['f2']).toBe('Please enter a valid email address.');
    });
  });

  describe('convertDirectToStep and convertStepToDirect (Data Loss Prevention)', () => {
    it('preserves fields when converting Direct Form to Step Form', () => {
      const directFields: DynamicFormField[] = [
        { id: 'f1', label: 'Field 1', type: 'text', mandatory: true },
        { id: 'f2', label: 'Field 2', type: 'number', mandatory: false }
      ];

      const steps = convertDirectToStep(directFields);
      expect(steps.length).toBe(1);
      expect(steps[0].fields.length).toBe(2);
      expect(steps[0].fields[0].label).toBe('Field 1');
      expect(steps[0].fields[1].label).toBe('Field 2');
    });

    it('preserves all fields across multiple steps when converting Step Form to Direct Form', () => {
      const steps: FormStep[] = [
        {
          id: 's1',
          stepNumber: 1,
          title: 'Step 1',
          fields: [{ id: 'f1', label: 'Field 1', type: 'text', mandatory: true }]
        },
        {
          id: 's2',
          stepNumber: 2,
          title: 'Step 2',
          fields: [
            { id: 'f2', label: 'Field 2', type: 'number', mandatory: false },
            { id: 'f3', label: 'Field 3', type: 'photo', mandatory: true }
          ]
        }
      ];

      const direct = convertStepToDirect(steps);
      expect(direct.length).toBe(3);
      expect(direct.map(f => f.label)).toEqual(['Field 1', 'Field 2', 'Field 3']);
    });
  });

  describe('isFieldRequired', () => {
    it('returns true when mandatory or validation.required is set', () => {
      expect(isFieldRequired({ id: '1', label: 'Name', type: 'text', mandatory: true })).toBe(true);
      expect(isFieldRequired({ id: '2', label: 'Age', type: 'number', mandatory: false, validation: { required: true } })).toBe(true);
      expect(isFieldRequired({ id: '3', label: 'Remarks', type: 'text', mandatory: false })).toBe(false);
    });
  });
});
