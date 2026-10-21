import type { BatchRecord } from '../models/batch.model';
import {
  BATCH_APPROVAL_LEVELS,
  FREEZE_DAYS_BEFORE_START,
  batchDisplayStatus,
  canEditBatch,
  canRegisterAspirants,
  canRegisterReplacement,
  currentApprover,
  freezeDateOf,
  isBatchFrozen,
  isFinalApprovalLevel,
  nextApprover,
  registrationBlockedReason,
  registrationLine,
  seatsLeft
} from './batch-approval.util';

function batch(overrides: Partial<BatchRecord> = {}): BatchRecord {
  return {
    id: 'b1',
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    startDate: '2026-11-01',
    mappedAspirantsCount: 0,
    maxStrength: 30,
    approvedBatchStrength: 30,
    trainees: [],
    ...overrides
  } as BatchRecord;
}

const pending = { status: 'PENDING_APPROVAL', approvalStatus: 'PENDING' } as const;
const returned = { status: 'RETURNED_TO_TP', approvalStatus: 'RETURNED' } as const;
const rejected = { status: 'REJECTED', approvalStatus: 'REJECTED' } as const;

describe('batch approval', () => {
  it('shows the status from the stored decision', () => {
    expect(batchDisplayStatus(batch(pending))).toBe('PENDING');
    expect(batchDisplayStatus(batch())).toBe('APPROVED');
    expect(batchDisplayStatus(batch(rejected))).toBe('REJECTED');
    expect(batchDisplayStatus(batch(returned))).toBe('RETURNED');
  });

  it('lets the partner edit only a returned batch', () => {
    expect(canEditBatch(batch(returned))).toBe(true);
    expect(canEditBatch(batch())).toBe(false);
    expect(canEditBatch(batch(pending))).toBe(false);
    expect(canEditBatch(batch(rejected))).toBe(false);
  });

  it('has one department level, which approves', () => {
    expect(BATCH_APPROVAL_LEVELS).toEqual(['Department']);
    expect(currentApprover(batch({ approvalLevel: 0 }))).toBe('Department');
    // Batches saved with a higher level index stay on the only level.
    expect(currentApprover(batch({ approvalLevel: 1 }))).toBe('Department');
    expect(isFinalApprovalLevel(0)).toBe(true);
    expect(nextApprover(batch({ approvalLevel: 0 }))).toBe('');
  });
});

describe('batch registration freeze', () => {
  it('freezes the configured number of days before the start date', () => {
    expect(FREEZE_DAYS_BEFORE_START).toBe(7);
    expect(freezeDateOf(batch({ startDate: '2026-11-01' }))).toBe('2026-10-25');
    expect(freezeDateOf(batch({ startDate: '2026-03-05' }))).toBe('2026-02-26');
    expect(freezeDateOf(batch({ startDate: '' }))).toBe('');
  });

  it('is open before the freeze date and closed from that day on', () => {
    const b = batch({ startDate: '2026-11-01' });
    expect(isBatchFrozen(b, '2026-10-24')).toBe(false);
    expect(isBatchFrozen(b, '2026-10-25')).toBe(true);
    expect(isBatchFrozen(b, '2026-12-01')).toBe(true);
  });

  it('opens registration only after approval, and until the freeze date', () => {
    expect(canRegisterAspirants(batch(), '2026-10-10')).toBe(true);
    expect(canRegisterAspirants(batch(pending), '2026-10-10')).toBe(false);
    expect(canRegisterAspirants(batch(returned), '2026-10-10')).toBe(false);
    expect(canRegisterAspirants(batch(rejected), '2026-10-10')).toBe(false);
    expect(canRegisterAspirants(batch(), '2026-10-25')).toBe(false);
    expect(registrationBlockedReason(batch(), '2026-10-10')).toBe('');
    expect(registrationBlockedReason(batch(pending), '2026-10-10')).toContain('after it is approved');
    expect(registrationBlockedReason(batch(), '2026-10-26')).toContain('2026-10-25');
  });

  it('closes registration when the batch is full', () => {
    const full = batch({ mappedAspirantsCount: 30 });
    expect(seatsLeft(full)).toBe(0);
    expect(canRegisterAspirants(full, '2026-10-10')).toBe(false);
    expect(registrationBlockedReason(full, '2026-10-10')).toContain('batch size');
  });

  it('still allows a replacement after the freeze when a seat is free', () => {
    const frozen = batch({ mappedAspirantsCount: 29 });
    expect(canRegisterAspirants(frozen, '2026-10-30')).toBe(false);
    expect(canRegisterReplacement(frozen)).toBe(true);
    expect(registrationBlockedReason(frozen, '2026-10-30', true)).toBe('');
    expect(canRegisterReplacement(batch({ mappedAspirantsCount: 30 }))).toBe(false);
    expect(canRegisterReplacement(batch(pending))).toBe(false);
    expect(canRegisterReplacement(batch({ status: 'COMPLETED' }))).toBe(false);
  });

  it('describes registration under the status of an approved batch', () => {
    expect(registrationLine(batch(), '2026-10-10')).toBe('Registration open till 2026-10-25');
    expect(registrationLine(batch(), '2026-10-25')).toBe('Registration closed');
    expect(registrationLine(batch(pending), '2026-10-10')).toBe('');
  });
});
