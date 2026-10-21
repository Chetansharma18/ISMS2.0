import type { IpaCourseRow } from '../../eoi/services/eoi-state.models';

/** Follows the status of the SDC: PENDING until the department decides, then APPROVED, REJECTED or RETURNED. */
export type AllocationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';

/** One IPA course row given to the SDC: the IPA fixes the batches, trainees and cost. */
export interface IpaAllocationCourse {
  courseRowId: string;
  courseName: string;
  courseCode: string;
  sector: string;
  district: string;
  /** Batches (cycles) of this course the SDC runs, as set by the IPA. */
  cycles: number;
  /** Trainees per batch, from the IPA. */
  approvedTrainees: number;
  costPerBatch: number;
  durationHours: number;
}

/**
 * What an IPA gives to the new SDC registered for it in one district. Every IPA needs its own new SDC (the
 * building may be the same); the IPA fixes the courses, batches and trainees, and the department approves
 * the SDC, which approves the allocation with it.
 */
export interface IpaAllocation {
  id: string;
  ipaId: string;
  ipaNumber: string;
  schemeId: string;
  appId: string;
  tpName: string;
  scheme: string;
  sdcId: string;
  sdcName: string;
  district: string;
  sectors: string[];
  courses: IpaAllocationCourse[];
  createdAt: string;
}

/** An issued IPA with its allowance, read from the released sanction order and IPA letter. */
export interface ResolvedIpa {
  ipaId: string;
  ipaNumber: string;
  schemeId: string;
  appId: string;
  tpName: string;
  /** Districts of the IPA. One new SDC is registered for each. */
  districts: string[];
  sectors: string[];
  /** Course rows of the IPA; every row has a district. */
  courses: IpaCourseRow[];
}
