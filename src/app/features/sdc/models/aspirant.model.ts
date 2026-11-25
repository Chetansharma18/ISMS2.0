import { AspirantFormData, AspirantDocumentItem } from '../config/aspirant-form.config';

export type AspirantTrainingStatus = 'ENROLLED' | 'IN_TRAINING' | 'COMPLETED' | 'CERTIFIED' | 'DROPOUT';

export interface AspirantRecord extends AspirantFormData {
  id: string; // e.g. ASP-RJ-2026-98412
  
  // Center (SDC) Information
  sdcId: string;
  sdcCode: string;
  sdcName: string;
  sdcDistrict: string;

  // Batch Information
  batchId: string;
  batchCode: string;
  batchName?: string;
  courseName: string;
  scheme: string;
  sector: string;

  // Status & Biometric Tracking
  enrollmentDate: string;
  trainingStatus: AspirantTrainingStatus;
  biometricVerified: boolean;
  attendancePercent: number;
  aadhaarMasked: string;

  /** Set when the aspirant dropped out of the batch: why, and when (ISO date-time). */
  dropReason?: string;
  droppedAt?: string;
  /** The aspirant registered in the seat this aspirant left. */
  replacedByAspirantId?: string;
  /** The dropped aspirant whose seat this aspirant took. */
  replacesAspirantId?: string;
}

/** Reasons a training partner can pick when a student leaves the batch. */
export const DROP_REASONS: readonly string[] = ['Left the training', 'Not attending', 'Found employment', 'Medical or personal reasons', 'Other'];
