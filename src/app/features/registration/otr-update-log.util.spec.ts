import { describe, expect, it } from 'vitest';
import { OtrFullFormResponse } from './models/otr-api.model';
import { buildFormDef } from './otr-form.util';
import { changedFieldLabels, toUpdateLogRows } from './otr-update-log.util';

const RESPONSE: OtrFullFormResponse = {
  version: 1, title: 'Organization Registration', description: '',
  steps: [{
    stepKey: 'organisation', stepTitle: 'Organisation Details', stepSubtitle: '',
    dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
    fixedFields: [
      { fieldKey: 'organisationName', label: 'Organisation Name', fieldType: 'text', isRequired: true },
      { fieldKey: 'registeredDistrict', label: 'District', fieldType: 'select', isRequired: true }
    ]
  }]
};
const FORM = buildFormDef(RESPONSE, { sectors: [], districts: [] });

describe('otr-update-log.util (GET /otr/me/update-logs)', () => {
  it('names changed fields by their form labels', () => {
    expect(changedFieldLabels({ section: 'OrganisationDetails', changedFields: ['*'] }, FORM)).toEqual(['All details']);
    expect(changedFieldLabels(
      { section: 'OrganisationDetails', changedFields: ['organisationName', 'registeredDistrictId', 'dynamicFormAnswers', 'dynamicFormVersion', 'gstNumber'] },
      FORM
    )).toEqual(['Organisation Name', 'District', 'Additional details', 'gstNumber']);
  });

  it('lists logs newest first with the step title, action and reason', () => {
    const rows = toUpdateLogRows([
      { id: 1, section: 'OrganisationDetails', action: 'Create', targetRecordId: 1, reason: 'Initial creation', changedFields: ['*'], createdAt: '2026-01-02T10:00:00Z' },
      { id: 2, section: 'OrganisationDetails', action: 'Update', targetRecordId: 1, reason: null, changedFields: [], createdAt: '2026-01-03T10:00:00Z' },
      { id: 3, section: 'BankDetails', action: 'Update', targetRecordId: 3, reason: 'New account', changedFields: ['ifscCode'], createdAt: '2026-01-01T10:00:00Z' }
    ], FORM);
    expect(rows.map(r => [r.sNo, r.id, r.step, r.action, r.reason, r.changes])).toEqual([
      [1, 2, 'Organisation Details', 'Updated', '-', 'No field changed'],
      [2, 1, 'Organisation Details', 'Created', 'Initial creation', 'All details'],
      [3, 3, 'BankDetails', 'Updated', 'New account', 'ifscCode']
    ]);
    expect(rows[0].when).toMatch(/^03-01-2026 \d{2}:\d{2}$/);
  });
});
