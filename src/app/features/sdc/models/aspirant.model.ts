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
}
