/**
 * A batch goes to approval as soon as it is created (PENDING_APPROVAL). Aspirants are registered only after it is APPROVED.
 * RETURNED_TO_TP: sent back by the department for corrections; saving the corrections sends it for approval again.
 */
export type BatchStatus = 'RETURNED_TO_TP' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'PENDING_APPROVAL' | 'INSPECTION_PENDING' | 'REJECTED' | 'WITHDRAWN';
export type BatchApprovalStatus = 'RETURNED' | 'PENDING' | 'INSPECTION_PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';

/** One entry of the approval history of a batch. */
export interface BatchApprovalStep {
  action: 'SUBMITTED' | 'FORWARDED' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'REMARKED' | 'WITHDRAWN';
  /** Who acted: the training partner for "SUBMITTED", otherwise the designation of the approval level. */
  designation: string;
  officer: string;
  /** ISO date-time. */
  at: string;
  remarks?: string;
}
export type BatchInspectionStatus = 'NOT_SCHEDULED' | 'SCHEDULED' | 'PASSED' | 'FAILED';

export type FacultyType = 'Primary Trainer' | 'Assistant Trainer' | 'Domain Trainer' | 'Master Trainer' | string;

/** A camera that records the batch: vendor, address, credentials and the live feed link. */
export interface BatchCamera {
  vendor: string;
  ipAddress: string;
  username: string;
  password: string;
  liveFeedUrl: string;
}

export interface BatchFaculty {
  id?: string;
  /** SSO ID of the trainer. */
  ssoId?: string;
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

/** The one Attender User of a batch: the person is picked by SSO ID and the details come from SSO. */
export interface BatchAttender {
  ssoId: string;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  assignedAt: string;
}

/** Kinds of E-Campus material a training partner can upload for an approved batch. */
export type StudyMaterialType = 'E_COURSE_CONTENT' | 'SYLLABUS' | 'DOCUMENT' | 'VIDEO' | 'DIGITAL_MEDIA' | 'LIVE_VIDEO';

/**
 * One piece of study material of a batch. Only the details are kept here (the file itself goes to the E-Campus
 * storage when the backend exists). A material applies to the whole course or to one session.
 */
export interface StudyMaterial {
  id: string;
  type: StudyMaterialType;
  title: string;
  description?: string;
  /** Session the material belongs to; empty when it is for the whole course. */
  sessionNo?: number;
  sessionTopic?: string;
  /** For file materials. */
  fileName?: string;
  fileSize?: string;
  /** MIME type of the file, kept so a later edit can check the format again. */
  fileMime?: string;
  /** For a live training video: the link, and when it is held (yyyy-mm-dd and HH:mm). */
  link?: string;
  liveDate?: string;
  liveTime?: string;
  /** ISO date-time. */
  uploadedAt: string;
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

  // IPA this batch runs under (the allocation of the IPA to the centre, and the course row used)
  ipaId?: string;
  ipaAllocationId?: string;
  ipaCourseRowId?: string;
  /** 1 for the first batch of that course under the allocation, 2 for the second, and so on. */
  cycleNo?: number;
  costPerBatch?: number;
  
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
  /** Cameras of the centre that record this batch. */
  cameras?: BatchCamera[];

  /** E-Campus study material uploaded once the batch is approved. */
  studyMaterials?: StudyMaterial[];

  /** Set once an approved batch has its Attender User; only one can be assigned. */
  attender?: BatchAttender | null;

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
  /** 3 once the batch is on the create-then-approve flow; older saved batches are moved onto it when they load. */
  approvalFlowVersion?: number;
  /** When the training partner sent the batch for approval (ISO date-time). */
  submittedAt?: string;
  /** Index (0 = first) of the approval level that decides next; see BATCH_APPROVAL_LEVELS. */
  approvalLevel?: number;
  /** History of the batch through the approval levels. Absent on batches saved before the approval flow existed. */
  approvalTrail?: BatchApprovalStep[];
  approvedAt?: string;
  approvedBy?: string;
  approvalRemarks?: string;
  rejectionReason?: string;
  /** What the department asked the partner to correct, while the batch is returned. */
  returnRemarks?: string;
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

  // IPA this batch runs under
  ipaId?: string;
  ipaAllocationId?: string;
  ipaCourseRowId?: string;
  cycleNo?: number;
  costPerBatch?: number;
  
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
  cameras?: BatchCamera[];
  hostel?: BatchHostel;
  hostels?: BatchHostel[];
}
