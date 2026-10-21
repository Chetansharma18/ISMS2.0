import type { BatchApprovalStep, BatchRecord } from '../../models/batch.model';
import { isBatchApproved, isBatchInApproval, isBatchRejected, isBatchReturned } from '../../utils/batch-approval.util';

/** The department can revert, reject or approve a batch only while it waits for a decision. */
export function canDecideBatch(b: BatchRecord | undefined): boolean {
  return isBatchInApproval(b);
}

/** What the department decided, for the card shown once the batch is approved, rejected or returned. */
export interface BatchDecisionRecord {
  kind: 'APPROVED' | 'REJECTED' | 'RETURNED';
  /** ISO date-time; empty when it is not known. */
  at: string;
  /** The remark of the decision. */
  text: string;
  /** Trainees sanctioned, for an approval. */
  capacity?: number;
}

/** The decision on a batch that is approved, rejected or returned, or null while it is still waiting for one. */
export function batchDecisionRecordOf(b: BatchRecord): BatchDecisionRecord | null {
  const trail = [...(b.approvalTrail ?? [])].reverse();
  if (isBatchRejected(b)) {
    const step = trail.find(s => s.action === 'REJECTED');
    return { kind: 'REJECTED', at: step?.at ?? '', text: b.rejectionReason || step?.remarks || '' };
  }
  if (isBatchApproved(b)) {
    const step = trail.find(s => s.action === 'APPROVED');
    return {
      kind: 'APPROVED',
      at: b.approvedAt ?? step?.at ?? '',
      text: b.approvalRemarks || step?.remarks || '',
      capacity: b.approvedBatchStrength || b.maxStrength || undefined
    };
  }
  if (isBatchReturned(b)) {
    const step = trail.find(s => s.action === 'RETURNED');
    return { kind: 'RETURNED', at: step?.at ?? '', text: b.returnRemarks || step?.remarks || '' };
  }
  return null;
}

/** A remark or decision of the department on a batch. */
export interface BatchRemark {
  id: string;
  /** ISO date-time. */
  at: string;
  kind: string;
  text: string;
}

const REMARK_KIND: Partial<Record<BatchApprovalStep['action'], string>> = {
  REMARKED: 'Remark',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RETURNED: 'Returned to TP'
};

/** The remarks and decisions of the department on a batch, oldest first. Steps without text, and those of the training partner, are left out. */
export function batchRemarksOf(b: BatchRecord): BatchRemark[] {
  return (b.approvalTrail ?? [])
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => REMARK_KIND[step.action] !== undefined && (step.remarks ?? '').trim().length > 0)
    .map(({ step, index }) => ({ id: `${index}-${step.at}`, at: step.at, kind: REMARK_KIND[step.action] as string, text: (step.remarks ?? '').trim() }));
}
