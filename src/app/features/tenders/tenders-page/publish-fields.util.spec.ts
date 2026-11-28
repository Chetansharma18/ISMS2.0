import { describe, expect, it } from 'vitest';
import { DynamicFormField } from '../../../core/models/admin-masters.model';
import { publishValueError, publishValueErrors, publishedInfoText } from './publish-fields.util';
import { publishedInfoOf, requiredFieldsOf } from '../services/eoi-config.util';

const f = (type: string, value: string | boolean | undefined, extra: Partial<DynamicFormField> = {}): DynamicFormField =>
  ({ id: type, label: 'Training Hours', type: type as DynamicFormField['type'], mandatory: false, value, ...extra });

describe('publish-fields.util (Publish Details = information for applicants)', () => {
  it('needs a value only when the field is mandatory, and checks it by type', () => {
    expect(publishValueError(f('text', ''))).toBeNull();
    expect(publishValueError(f('text', '', { mandatory: true }))).toContain('Please enter the value');
    expect(publishValueError(f('number', 'abc'))).toContain('must be a number');
    expect(publishValueError(f('number', '240'))).toBeNull();
    expect(publishValueError(f('email', 'nope'))).toContain('valid email');
    expect(publishValueError(f('phone', '12345'))).toContain('10 digit');
    expect(publishValueError(f('dropdown', 'Z', { options: ['A', 'B'] }))).toContain('listed options');
    expect(publishValueError(f('checkbox', true))).toBeNull();
    expect(publishValueError(f('file', undefined, { mandatory: true }))).toBeNull();
    expect(publishValueErrors([f('text', 'x'), f('text', '', { mandatory: true })])).toEqual([
      { index: 1, message: 'Please enter the value of Training Hours.' }
    ]);
  });

  it('shows values as applicants read them', () => {
    expect(publishedInfoText({ type: 'datepicker', value: '2026-12-31' })).toBe('31-12-2026');
    expect(publishedInfoText({ type: 'currency', value: '150000' })).toBe('₹1,50,000');
    expect(publishedInfoOf([f('checkbox', true), f('text', '  '), f('file', 'x'), f('text', '240 hours', { label: 'Duration' })])).toEqual([
      { label: 'Training Hours', value: 'Yes' },
      { label: 'Duration', value: '240 hours' }
    ]);
  });

  it('lists the Uploading Details fields applicants fill in', () => {
    expect(requiredFieldsOf([f('text', undefined, { label: 'Centre Address', mandatory: true }), f('photo', undefined)])).toEqual([
      { label: 'Centre Address', mandatory: true }
    ]);
  });
});
