import type { BatchRecord } from '../../models/batch.model';
import { batchDecisionRecordOf, batchRemarksOf, canDecideBatch } from './batch-review.util';

function batch(overrides: Partial<BatchRecord> = {}): BatchRecord {
  return { id: 'b1', status: 'PENDING_APPROVAL', approvalStatus: 'PENDING', approvalLevel: 0, maxStrength: 30, ...overrides } as BatchRecord;
}

describe('batch review', () => {
  it('lets the department decide only while the batch waits for a decision', () => {
    expect(canDecideBatch(batch())).toBe(true);
    expect(canDecideBatch(batch({ status: 'APPROVED', approvalStatus: 'APPROVED' }))).toBe(false);
    expect(canDecideBatch(batch({ status: 'REJECTED', approvalStatus: 'REJECTED' }))).toBe(false);
    expect(canDecideBatch(batch({ status: 'RETURNED_TO_TP', approvalStatus: 'RETURNED' }))).toBe(false);
    expect(canDecideBatch(undefined)).toBe(false);
  });

  it('has no decision record while the batch is open', () => {
    expect(batchDecisionRecordOf(batch())).toBeNull();
  });

  it('reads the decision from the batch and its history', () => {
    const at = '2026-10-01T10:00:00.000Z';
    const rejected = batch({ status: 'REJECTED', approvalStatus: 'REJECTED', rejectionReason: 'Faculty not available.' });
    expect(batchDecisionRecordOf(rejected)).toEqual({ kind: 'REJECTED', at: '', text: 'Faculty not available.' });

    const returned = batch({
      status: 'RETURNED_TO_TP',
      approvalStatus: 'RETURNED',
      approvalTrail: [{ action: 'RETURNED', designation: 'Department', officer: 'Department', at, remarks: 'Add camera details.' }]
    });
    expect(batchDecisionRecordOf(returned)).toEqual({ kind: 'RETURNED', at, text: 'Add camera details.' });

    const approved = batch({ status: 'APPROVED', approvalStatus: 'APPROVED', approvedAt: at, approvalRemarks: 'Verified.', approvedBatchStrength: 25 });
    expect(batchDecisionRecordOf(approved)).toEqual({ kind: 'APPROVED', at, text: 'Verified.', capacity: 25 });
  });

  it('lists the remarks and decisions of the department, not the steps of the training partner', () => {
    const remarks = batchRemarksOf(
      batch({
        approvalTrail: [
          { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-01T09:00:00.000Z' },
          { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-09-02T09:00:00.000Z', remarks: 'Forwarded.' },
          { action: 'REMARKED', designation: 'Department', officer: 'Department', at: '2026-09-03T09:00:00.000Z', remarks: ' Camera verified. ' },
          { action: 'RETURNED', designation: 'Department', officer: 'Department', at: '2026-09-04T09:00:00.000Z' }
        ]
      })
    );
    expect(remarks.map(r => [r.kind, r.text])).toEqual([['Remark', 'Camera verified.']]);
  });
});
