import { describe, it, expect } from 'vitest';
import { FormFieldConfig } from './form-sdc.types';
import {
  collectVisibleFields,
  fieldColClassFor,
  fileDisplayName,
  gridClassFor,
  isNonEmptyFile,
  readModelValue,
  resolveFlag,
  resolveText,
  validateFields,
  writeModelValue
} from './form-sdc.util';

describe('form-sdc.util', () => {
  describe('model paths', () => {
    it('reads flat and dot-notation keys, defaulting missing values to an empty string', () => {
      const model = { name: 'A', step1: { city: 'Jaipur' } };
      expect(readModelValue(model, 'name')).toBe('A');
      expect(readModelValue(model, 'step1.city')).toBe('Jaipur');
      expect(readModelValue(model, 'step2.city')).toBe('');
      expect(readModelValue(null, 'name')).toBe('');
    });

    it('writes dot-notation keys, creating intermediate objects', () => {
      const model: Record<string, any> = {};
      writeModelValue(model, 'step1.city', 'Jaipur');
      writeModelValue(model, 'name', 'A');
      expect(model).toEqual({ step1: { city: 'Jaipur' }, name: 'A' });
    });
  });

  describe('resolvers', () => {
    it('resolves boolean and function flags with a fallback', () => {
      expect(resolveFlag(undefined, {}, true)).toBe(true);
      expect(resolveFlag(false, {}, true)).toBe(false);
      expect(resolveFlag(m => m['x'] === 1, { x: 1 }, false)).toBe(true);
    });

    it('resolves static and dynamic text', () => {
      expect(resolveText('Label', {})).toBe('Label');
      expect(resolveText(m => `Hi ${m['n']}`, { n: 'A' })).toBe('Hi A');
      expect(resolveText(undefined, {})).toBe('');
    });
  });

  describe('file helpers', () => {
    it('detects non-empty file values and resolves their names', () => {
      expect(isNonEmptyFile('')).toBe(false);
      expect(isNonEmptyFile('a.pdf')).toBe(true);
      expect(isNonEmptyFile({ fileName: 'a.pdf' })).toBe(true);
      expect(isNonEmptyFile({})).toBe(false);
      expect(fileDisplayName({ name: 'b.png' })).toBe('b.png');
      expect(fileDisplayName(null)).toBe('');
    });
  });

  describe('layout classes', () => {
    it('returns grid classes per column count', () => {
      expect(gridClassFor(1)).toContain('grid-cols-1');
      expect(gridClassFor(3)).toContain('lg:grid-cols-3');
      expect(gridClassFor()).toContain('lg:grid-cols-4');
    });

    it('returns col-span classes per container width', () => {
      const wide: FormFieldConfig = { key: 'a', label: 'A', colSpan: 3 };
      expect(fieldColClassFor({ key: 'h', label: 'H', type: 'heading' }, 2)).toBe('col-span-full');
      expect(fieldColClassFor({ key: 'a', label: 'A', colSpan: 'full' }, 4)).toBe('col-span-full');
      expect(fieldColClassFor(wide, 1)).toBe('col-span-1');
      expect(fieldColClassFor(wide, 3)).toBe('col-span-1 sm:col-span-3');
      expect(fieldColClassFor(wide, 4)).toBe('col-span-1 sm:col-span-2 lg:col-span-3');
    });
  });

  describe('field collection', () => {
    it('skips hidden sections and fields, preferring sections over the flat list', () => {
      const visible: FormFieldConfig = { key: 'a', label: 'A' };
      const hidden: FormFieldConfig = { key: 'b', label: 'B', visible: false };
      const sections = [
        { fields: [visible, hidden] },
        { fields: [{ key: 'c', label: 'C' }], visible: false }
      ];
      expect(collectVisibleFields(sections, [{ key: 'z', label: 'Z' }], {}).map(f => f.key)).toEqual(['a']);
      expect(collectVisibleFields([], [visible, hidden], {}).map(f => f.key)).toEqual(['a']);
    });
  });

  describe('validateFields', () => {
    it('reports required, email, length, range, pattern and custom validator failures', () => {
      const fields: FormFieldConfig[] = [
        { key: 'name', label: 'Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'code', label: 'Code', minLength: 3 },
        { key: 'age', label: 'Age', type: 'number', min: 18 },
        { key: 'pin', label: 'PIN', pattern: /^\d{6}$/, patternMessage: 'Bad PIN' },
        { key: 'custom', label: 'Custom', validator: () => 'nope' }
      ];
      const model = { name: '  ', email: 'x', code: 'ab', age: 10, pin: '12', custom: 'v' };
      const { errors, firstErrorKey } = validateFields(fields, model);

      expect(errors).toEqual({
        name: 'Name is required',
        email: 'Please enter a valid email address',
        code: 'Minimum 3 characters required',
        age: 'Value cannot be less than 18',
        pin: 'Bad PIN',
        custom: 'nope'
      });
      expect(firstErrorKey).toBe('name');
    });

    it('returns no errors for a valid model', () => {
      const fields: FormFieldConfig[] = [{ key: 'name', label: 'Name', required: true }];
      expect(validateFields(fields, { name: 'A' })).toEqual({ errors: {}, firstErrorKey: null });
    });

    it('requires the minimum number of photos', () => {
      const fields: FormFieldConfig[] = [{ key: 'photos', label: 'Photos', type: 'photos', required: true, minPhotos: 2 }];
      expect(validateFields(fields, { photos: [{}] }).errors['photos']).toBe('Please upload at least 2 photos of the center');
      expect(validateFields(fields, { photos: [{}, {}] }).errors).toEqual({});
    });
  });
});
