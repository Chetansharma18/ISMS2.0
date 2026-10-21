import type { SdcRecord } from '../models/sdc.model';

/** Most trainees one batch can hold. */
export const MAX_TRAINEES_PER_BATCH = 30;

/** Fewest trainees a batch needs registered before it can be sent for approval. */
export const MIN_TRAINEES_PER_BATCH = 12;

/** The target of an SDC: what the department approved, or the one asked for. */
export function sdcTarget(sdc: Pick<SdcRecord, 'approval' | 'sdcCapacity'>): number {
  return Number(sdc.approval?.approvedTargetCapacity || sdc.sdcCapacity) || 0;
}

/**
 * How many batches an SDC can run: its target in batches of at most 30 trainees (a target of 90 allows 3 batches,
 * a target of 100 allows 4, the last one holding the 10 left over).
 */
export function maxBatchesFor(target: number): number {
  return Math.ceil(Math.max(0, target) / MAX_TRAINEES_PER_BATCH);
}
