import { describe, it, expect } from 'vitest';
import type { SdcRecord } from '../../models/sdc.model';
import {
  InspectionDraft,
  canApproveSdc,
  canDecideSdc,
  canInspectSdc,
  decisionRecordOf,
  remarksOf,
  sectionNumbers,
  show,
  validateInspection
} from './sdc-review.util';

function sdc(overrides: Partial<SdcRecord> = {}): SdcRecord {
  return { id: 'sdc-1', status: 'PENDING_APPROVAL', ...overrides } as SdcRecord;
}

describe('sdc-review.util', () => {
  it('show prints a dash for an empty value', () => {
    expect(show('')).toBe('—');
    expect(show(null)).toBe('—');
    expect(show(0)).toBe('0');
    expect(show('Jaipur')).toBe('Jaipur');
  });

  it('lets the department decide only while the SDC is waiting for inspection or approval', () => {
    expect(canDecideSdc('PENDING_INSPECTION')).toBe(true);
    expect(canDecideSdc('INSPECTION_COMPLETED')).toBe(true);
    expect(canDecideSdc('PENDING_APPROVAL')).toBe(true);
    expect(canDecideSdc('APPROVED')).toBe(false);
    expect(canDecideSdc('REJECTED')).toBe(false);
    expect(canDecideSdc('RETURNED_TO_TP')).toBe(false);
    expect(canDecideSdc(undefined)).toBe(false);
  });

  it('approves only after the inspection, which is filled once while the SDC waits for it', () => {
    expect(canInspectSdc('PENDING_INSPECTION')).toBe(true);
    expect(canInspectSdc('SUBMITTED')).toBe(true);
    expect(canInspectSdc('PENDING_APPROVAL')).toBe(false);
    expect(canInspectSdc('APPROVED')).toBe(false);
    expect(canApproveSdc('PENDING_APPROVAL')).toBe(true);
    expect(canApproveSdc('INSPECTION_COMPLETED')).toBe(true);
    expect(canApproveSdc('PENDING_INSPECTION')).toBe(false);
    expect(canApproveSdc('RETURNED_TO_TP')).toBe(false);
  });

  describe('validateInspection', () => {
    const valid: InspectionDraft = {
      auditorName: 'Auditor 1',
      auditorPhone: '9876543210',
      inspectionDate: '2026-10-08',
      physicalExistenceVerified: true,
      signboardVerified: true,
      classroomsLabsVerified: true,
      biometricAebasVerified: true,
      auditorLatitude: '26.9124',
      auditorLongitude: '75.7873',
      recommendation: 'RECOMMENDED',
      auditorRemarks: 'Centre matches the application.'
    };

    it('accepts a filled form', () => {
      expect(validateInspection(valid, '2026-10-10')).toEqual({});
    });

    it('names every field that is missing or wrong', () => {
      const errors = validateInspection(
        { ...valid, auditorName: ' ', auditorPhone: '12345', inspectionDate: '2026-10-11', auditorLatitude: '', auditorLongitude: '181', recommendation: '', auditorRemarks: '' },
        '2026-10-10'
      );
      expect(Object.keys(errors).sort()).toEqual(
        ['auditorLatitude', 'auditorLongitude', 'auditorName', 'auditorPhone', 'auditorRemarks', 'inspectionDate', 'recommendation']
      );
    });

    it('takes a date of today and coordinates at the edges of the range', () => {
      expect(validateInspection({ ...valid, inspectionDate: '2026-10-10', auditorLatitude: '-90', auditorLongitude: '180' }, '2026-10-10')).toEqual({});
    });
  });

  it('numbers the cards in order, leaving out the ones that are not shown', () => {
    expect(sectionNumbers(true, true)).toEqual({ courses: 3, location: 4, photos: 5, inspection: 6, remarks: 7 });
    expect(sectionNumbers(false, false)).toEqual({ courses: 0, location: 3, photos: 4, inspection: 0, remarks: 5 });
    expect(sectionNumbers(false, true)).toEqual({ courses: 0, location: 3, photos: 4, inspection: 5, remarks: 6 });
  });

  it('has no decision record while the SDC is open', () => {
    expect(decisionRecordOf(sdc())).toBeNull();
  });

  it('takes the decision from the log, newest first', () => {
    const record = decisionRecordOf(
      sdc({
        status: 'APPROVED',
        activityLog: [
          { id: 'a', action: 'APPROVED', actor: 'Scrutiny Officer 1', at: '2026-10-01T10:00:00.000Z', text: 'First', capacity: 100 },
          { id: 'b', action: 'APPROVED', actor: 'Joint Director 1', at: '2026-10-02T10:00:00.000Z', text: 'Second', capacity: 150 }
        ]
      })
    );
    expect(record).toMatchObject({ kind: 'APPROVED', text: 'Second', capacity: 150 });
    // The name of the officer is not part of the decision; it is shown with the remarks only.
    expect(record).not.toHaveProperty('actor');
  });

  it('falls back to the approval data and the return remarks of older records', () => {
    const approved = decisionRecordOf(
      sdc({ status: 'APPROVED', approval: { approvedTargetCapacity: 120, approvalRemarks: 'Fine', approvedDate: '2026-09-15', approvedBy: 'RSLDC Authority' } })
    );
    expect(approved).toMatchObject({ kind: 'APPROVED', at: '2026-09-15', text: 'Fine', capacity: 120 });

    const returned = decisionRecordOf(sdc({ status: 'RETURNED_TO_TP', remarks: 'Returned by Department: Upload the NOC.' }));
    expect(returned).toMatchObject({ kind: 'RETURNED', text: 'Upload the NOC.' });

    const rejected = decisionRecordOf(sdc({ status: 'REJECTED', approval: { approvedTargetCapacity: 0, approvalRemarks: 'No centre', approvedDate: '2026-09-16', approvedBy: 'X' } }));
    expect(rejected?.capacity).toBeUndefined();
  });

  it('lists the remarks of the officers with a label for each kind and skips empty ones', () => {
    const list = remarksOf(
      sdc({
        activityLog: [
          { id: '1', action: 'REMARK_ADDED', actor: 'Scrutiny Officer 1', designation: 'Department Scrutiny Officer', at: '2026-10-01T09:00:00.000Z', text: 'Checked the NOC.' },
          { id: '2', action: 'APPROVED', actor: 'Joint Director 1', at: '2026-10-02T09:00:00.000Z', text: '' },
          { id: '3', action: 'RETURNED', actor: 'Scrutiny Officer 1', at: '2026-10-03T09:00:00.000Z', text: 'Upload photos.' }
        ]
      })
    );
    expect(list.map(r => r.kind)).toEqual(['Remark', 'Returned to TP']);
    expect(list[0].author).toBe('Scrutiny Officer 1');
    expect(list[0].designation).toBe('Department Scrutiny Officer');
    expect(list[1].designation).toBe('');
  });
});
