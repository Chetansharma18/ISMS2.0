import { describe, expect, it } from 'vitest';
import type { CurrentUserResponse } from '../../core/auth/auth-api.models';
import { buildFormDef } from '../registration/otr-form.util';
import { OtrFullFormResponse } from '../registration/models/otr-api.model';
import { accountFields, hasFilledOtr, isDefaultRole, maskId, profileCompletion, profileMode, profileSteps } from './profile-view.util';

const step = (stepKey: string, title: string, fieldKey: string) => ({
  stepKey, stepTitle: title, stepSubtitle: '', dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
  fixedFields: [{ fieldKey, label: fieldKey, fieldType: 'text', isRequired: true }]
});
const RESPONSE: OtrFullFormResponse = {
  version: 1, title: 'Registration', description: '',
  steps: [step('organisation', 'Organisation', 'organisationName'), step('bank-details', 'Bank', 'bankName')]
};
const FORM = buildFormDef(RESPONSE, { sectors: [], districts: [] });

describe('profile-view.util', () => {
  it('picks the profile by OTR first, then the default role', () => {
    expect(profileMode(true, false)).toBe('otr');
    expect(profileMode(true, true)).toBe('otr');
    expect(profileMode(false, true)).toBe('otr-start');
    expect(profileMode(false, false)).toBe('account');
    expect(isDefaultRole('User')).toBe(true);
    expect(isDefaultRole(' user ')).toBe(true);
    expect(isDefaultRole('Tp')).toBe(false);
    expect(isDefaultRole(null)).toBe(false);
  });

  it('counts an OTR as filled once a step is saved (an upload alone does not)', () => {
    expect(hasFilledOtr(FORM, {})).toBe(false);
    expect(hasFilledOtr(FORM, { organisation: { id: 1, status: 'Draft', organisationName: '' } })).toBe(false);
    expect(hasFilledOtr(FORM, { organisation: { id: 1, status: 'Draft', organisationName: 'Company 1' } })).toBe(true);
    expect(hasFilledOtr(null, { organisation: { id: 1, status: 'Submitted' } })).toBe(true);
  });

  it('builds the steps and the completion from the form and the records', () => {
    const steps = profileSteps(FORM, { organisation: { id: 1, status: 'Draft', organisationName: 'Company 1' } });
    expect(steps.map(s => [s.title, s.completed, s.current])).toEqual([
      ['Organisation', true, false],
      ['Bank', false, true],
      ['Preview & Submit', false, false]
    ]);
    expect(profileCompletion(steps)).toBe(33);
    expect(profileCompletion(profileSteps(FORM, { organisation: { id: 1, status: 'Submitted', organisationName: 'A' } }))).toBe(100);
  });

  it('lists the non-empty /auth/me fields once, with the Aadhaar masked', () => {
    // /auth/me sends more SSO fields than CurrentUserResponse declares (e.g. aadhaarId); accountFields reads them by key.
    const me = { id: 1, SSOID: 'COMPANY1', displayName: 'Company 1', name: 'Other', mobile: ' ', aadhaarId: '123456789012', roles: ['admin'] };
    const fields = accountFields(me as CurrentUserResponse);
    expect(fields).toEqual([
      { label: 'Name', value: 'Company 1' },
      { label: 'SSO ID', value: 'COMPANY1' },
      { label: 'Aadhaar', value: 'XXXX XXXX 9012' }
    ]);
    expect(maskId('1234')).toBe('1234');
    expect(accountFields(null)).toEqual([]);
  });
});
