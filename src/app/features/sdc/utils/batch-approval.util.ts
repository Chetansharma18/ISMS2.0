import type { BatchRecord } from '../models/batch.model';

/**
 * The department levels a batch passes through, lowest first. The batch is approved only when the last level approves;
 * every earlier level forwards it to the next. There is one level, the department, and no designation is shown for it.
 */
export const BATCH_APPROVAL_LEVELS: readonly string[] = ['Department'];

/**
 * Registration of new aspirants stops this many days before the batch start date (the department rule is 7 to 15 days).
 * Change this one number to move the freeze. Replacing a student is still allowed after the freeze.
 */
export const FREEZE_DAYS_BEFORE_START = 7;

/** Where a batch stands, for the status shown in tables and details. */
export type BatchDisplayStatus = 'RETURNED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

/** Result of an approval click: moved to the next level, or approved by the last level. */
export type BatchApprovalOutcome = 'FORWARDED' | 'APPROVED';

/** Active trainees of the batch: the registered ones, not counting those who dropped out. */
export function registeredCount(b: BatchRecord): number {
  return b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
}

/** Batch size the training partner entered (at most 30). */
export function batchSizeOf(b: BatchRecord): number {
  return b.approvedBatchStrength || b.maxStrength || 0;
}

/** Seats still free in the batch (a dropped student frees a seat). */
export function seatsLeft(b: BatchRecord): number {
  return Math.max(0, batchSizeOf(b) - registeredCount(b));
}

export function isBatchRejected(b: BatchRecord | undefined): boolean {
  return !!b && (b.status === 'REJECTED' || b.approvalStatus === 'REJECTED');
}

export function isBatchApproved(b: BatchRecord | undefined): boolean {
  return !!b && !isBatchRejected(b) && !isBatchWithdrawn(b) && b.approvalStatus === 'APPROVED' && b.status !== 'WITHDRAWN' && b.status !== 'CANCELLED';
}

export function isBatchWithdrawn(b: BatchRecord | undefined): boolean {
  return !!b && (b.status === 'WITHDRAWN' || b.approvalStatus === 'WITHDRAWN');
}

/** Sent back by the department for corrections. */
export function isBatchReturned(b: BatchRecord | undefined): boolean {
  return !!b && b.status === 'RETURNED_TO_TP';
}

/** Sent for approval and waiting for a decision at one of the department levels. */
export function isBatchInApproval(b: BatchRecord | undefined): boolean {
  return !!b && (b.status === 'PENDING_APPROVAL' || b.status === 'INSPECTION_PENDING');
}

/** The details of a batch can be edited only while the department has returned it to the training partner. */
export function canEditBatch(b: BatchRecord | undefined): boolean {
  return isBatchReturned(b);
}

/** Today as yyyy-mm-dd in the local time zone. */
export function todayIso(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${m}-${d}`;
}

/** The first day on which new aspirants can no longer be registered (yyyy-mm-dd): the start date minus the freeze days. */
export function freezeDateOf(b: Pick<BatchRecord, 'startDate'>): string {
  const [y, m, d] = (b.startDate || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  const at = new Date(Date.UTC(y, m - 1, d - FREEZE_DAYS_BEFORE_START));
  return at.toISOString().slice(0, 10);
}

/** True from the freeze date onwards: new registrations are closed, a replacement is still allowed. */
export function isBatchFrozen(b: BatchRecord | undefined, today: string = todayIso()): boolean {
  if (!b) return false;
  const freeze = freezeDateOf(b);
  return !!freeze && today >= freeze;
}

function isRunnable(b: BatchRecord): boolean {
  return isBatchApproved(b) && b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'WITHDRAWN';
}

/** New aspirants can be registered once the batch is approved, until the freeze date, and while seats are free. */
export function canRegisterAspirants(b: BatchRecord | undefined, today: string = todayIso()): boolean {
  return !!b && isRunnable(b) && !isBatchFrozen(b, today) && seatsLeft(b) > 0;
}

/** A student can be replaced in an approved batch that has a free seat, also after the freeze and while it runs. */
export function canRegisterReplacement(b: BatchRecord | undefined): boolean {
  return !!b && isRunnable(b) && seatsLeft(b) > 0;
}

/** Why aspirants cannot be registered, or an empty text when they can. */
export function registrationBlockedReason(b: BatchRecord | undefined, today: string = todayIso(), replacement = false): string {
  if (!b) return 'Target batch not found.';
  if (isBatchWithdrawn(b)) return 'This batch was withdrawn. Aspirants cannot be registered.';
  if (isBatchRejected(b)) return 'This batch was rejected. Aspirants cannot be registered.';
  if (isBatchReturned(b)) return 'This batch was returned to the training partner. Aspirants can be registered after it is approved.';
  if (isBatchInApproval(b)) return 'This batch is waiting for approval. Aspirants can be registered after it is approved.';
  if (!isRunnable(b)) return 'Aspirants cannot be registered in a batch that is completed or cancelled.';
  if (seatsLeft(b) === 0) return 'This batch has reached its batch size.';
  if (!replacement && isBatchFrozen(b, today)) {
    return `Registration closed on ${freezeDateOf(b)}, ${FREEZE_DAYS_BEFORE_START} days before the batch starts. Only a replacement for a dropped student is allowed.`;
  }
  return '';
}

/** Index of the level that decides next (the first level until the batch is sent for approval). */
export function currentApprovalLevel(b: BatchRecord): number {
  return Math.min(Math.max(b.approvalLevel ?? 0, 0), BATCH_APPROVAL_LEVELS.length - 1);
}

export function isFinalApprovalLevel(level: number): boolean {
  return level >= BATCH_APPROVAL_LEVELS.length - 1;
}

/** Designation of the level that decides next. */
export function currentApprover(b: BatchRecord): string {
  return BATCH_APPROVAL_LEVELS[currentApprovalLevel(b)];
}

/** Designation the batch goes to when the current level forwards it, or an empty text at the last level. */
export function nextApprover(b: BatchRecord): string {
  const level = currentApprovalLevel(b);
  return isFinalApprovalLevel(level) ? '' : BATCH_APPROVAL_LEVELS[level + 1];
}

export function batchDisplayStatus(b: BatchRecord | undefined): BatchDisplayStatus {
  if (isBatchWithdrawn(b)) return 'WITHDRAWN';
  if (isBatchRejected(b)) return 'REJECTED';
  if (isBatchApproved(b)) return 'APPROVED';
  if (isBatchReturned(b)) return 'RETURNED';
  return 'PENDING';
}

/** Status in words: "Pending approval", "Approved", "Rejected", "Returned to TP". */
export function batchStatusLabel(b: BatchRecord | undefined): string {
  switch (batchDisplayStatus(b)) {
    case 'APPROVED':
      return 'Approved';
    case 'WITHDRAWN':
      return 'Withdrawn';
    case 'REJECTED':
      return 'Rejected';
    case 'RETURNED':
      return 'Returned to TP';
    default:
      return 'Pending approval';
  }
}

/** Second line under the status of an approved batch: when registration closes, or that it has closed. */
export function registrationLine(b: BatchRecord | undefined, today: string = todayIso()): string {
  if (!b || !isRunnable(b)) return '';
  return isBatchFrozen(b, today) ? 'Registration closed' : `Registration open till ${freezeDateOf(b)}`;
}
