export type BatchStatus = 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'PENDING_APPROVAL' | 'INSPECTION_PENDING' | 'REJECTED';
export type BatchApprovalStatus = 'PENDING' | 'INSPECTION_PENDING' | 'APPROVED' | 'REJECTED';
export type BatchInspectionStatus = 'NOT_SCHEDULED' | 'SCHEDULED' | 'PASSED' | 'FAILED';

export type FacultyType = 'Primary Trainer' | 'Assistant Trainer' | 'Domain Trainer' | 'Master Trainer' | string;

export interface BatchFaculty {
  id?: string;
  name?: string;
  facultyName?: string;
  type?: FacultyType;
  trainerType?: string;
  qualification?: string;
  experienceYears?: number;
}

export interface BatchHostel {
  id?: string;
  code?: string;
  hostelCode?: string;
  type?: 'Boys' | 'Girls' | 'Co-ed' | 'Not Applicable' | string;
  hostelType?: string;
  capacity?: number;
  address?: string;
  hostelAddress?: string;
}

export interface BatchTrainee {
  id: string;
  name: string;
  aadhaarMasked: string;
  mobile: string;
  enrolledDate: string;
  biometricVerified: boolean;
  attendancePercent: number;
}

export interface BatchRecord {
  id: string;
  batchCode: string;
  batchName?: string;
  sdcId: string;
  sdcCode: string;
  sdcName: string;
  tpName: string;
  scheme: string;
  sector: string;
  courseName: string;
  course?: string;
  qpCode: string;
  courseVersion: string;
  
  // Hours Breakdown
  theoryHours?: number;
  practicalHours?: number;
  softSkillHours?: number;
  totalHours: number;
  batchDurationHours?: number;

  // Identity & Capacity
  residential?: boolean;
  minStrength?: number;
  maxStrength: number;
  approvedBatchStrength?: number;
  nipaNo?: string;
  psdStatus?: 'Active' | 'Inactive';
  
  // PSD Payment Details
  psdFee?: number;
  psdPaymentStatus?: 'SUCCESS' | 'PAID' | 'PENDING' | string;
  psdPaymentRef?: string;
  psdPaymentMode?: string;
  psdPaymentDate?: string;

  // Remarks
  remarks?: string;

  // Dates & Schedule
  startDate: string;
  batchStartDate?: string;
  endDate: string;
  batchEndDate?: string;
  freezeDate?: string;
  startTime: string;
  batchStartTime?: string;
  endTime: string;
  batchEndTime?: string;

  // Faculty mapping
  faculty: BatchFaculty[];

  // Hostel (if residential)
  hostel?: BatchHostel;
  hostels?: BatchHostel[];

  // Execution
  status: BatchStatus;
  mappedAspirantsCount: number;
  biometricAttendanceRate: number;
  trainees: BatchTrainee[];
  createdAt: string;

  // Approval & Inspection
  approvalStatus?: BatchApprovalStatus;
  approvedAt?: string;
  approvedBy?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  inspectionStatus?: BatchInspectionStatus;
  inspectionDate?: string;
  inspectorName?: string;
  inspectionRemarks?: string;
  inspectionScore?: number;
  sdcDistrict?: string;
  checklist?: {
    classroomNormsMet: boolean;
    equipmentAndToolsVerified: boolean;
    cctvAndBiometricActive: boolean;
    trainerTotCertified: boolean;
    safetyAndHygieneCompliant: boolean;
    candidateDossiersVerified: boolean;
  };
}

export interface CreateBatchDto {
  sdcId: string;
  sdcCode: string;
  sdcName: string;
  tpName: string;
  batchName?: string;
  scheme: string;
  sector: string;
  courseName?: string;
  course: string;
  qpCode?: string;
  courseVersion?: string;
  theoryHours?: number;
  practicalHours?: number;
  softSkillHours?: number;
  totalHours?: number;
  batchDurationHours: number;
  residential?: boolean;
  minStrength?: number;
  maxStrength?: number;
  approvedBatchStrength: number;
  nipaNo?: string;
  psdStatus?: 'Active' | 'Inactive';
  
  // PSD Payment
  psdFee?: number;
  psdPaymentStatus: 'SUCCESS' | 'PAID' | 'PENDING' | string;
  psdPaymentRef?: string;
  psdPaymentMode?: string;
  psdPaymentDate?: string;

  // Remarks
  remarks?: string;

  // Schedule
  startDate: string;
  batchStartDate?: string;
  endDate: string;
  batchEndDate?: string;
  freezeDate?: string;
  startTime: string;
  batchStartTime?: string;
  endTime: string;
  batchEndTime?: string;

  faculty: BatchFaculty[];
  hostel?: BatchHostel;
  hostels?: BatchHostel[];
}
