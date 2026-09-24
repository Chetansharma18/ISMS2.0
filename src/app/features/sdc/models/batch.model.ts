export type BatchStatus = 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type FacultyType = 'Primary Trainer' | 'Assistant Trainer' | 'Domain Trainer';

export interface BatchFaculty {
  id?: string;
  name: string;
  type: FacultyType;
  qualification: string;
  experienceYears: number;
}

export interface BatchHostel {
  code: string;
  type: 'Boys' | 'Girls' | 'Co-ed';
  capacity: number;
  address: string;
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
  qpCode: string;
  courseVersion: string;
  
  // Hours Breakdown
  theoryHours: number;
  practicalHours: number;
  softSkillHours: number;
  totalHours: number;

  // Identity & Capacity
  residential: boolean;
  minStrength: number;
  maxStrength: number;
  nipaNo: string;
  psdStatus: 'Active' | 'Inactive';
  
  // Dates & Schedule
  startDate: string;
  endDate: string;
  freezeDate: string;
  startTime: string;
  endTime: string;

  // Faculty mapping
  faculty: BatchFaculty[];

  // Hostel (if residential)
  hostel?: BatchHostel;

  // Stage 6 Execution
  status: BatchStatus;
  mappedAspirantsCount: number;
  biometricAttendanceRate: number;
  trainees: BatchTrainee[];
  createdAt: string;
}

export interface CreateBatchDto {
  sdcId: string;
  sdcCode: string;
  sdcName: string;
  tpName: string;
  batchName?: string;
  scheme: string;
  sector: string;
  courseName: string;
  qpCode: string;
  courseVersion: string;
  theoryHours: number;
  practicalHours: number;
  softSkillHours: number;
  totalHours: number;
  residential: boolean;
  minStrength: number;
  maxStrength: number;
  nipaNo: string;
  psdStatus: 'Active' | 'Inactive';
  startDate: string;
  endDate: string;
  freezeDate: string;
  startTime: string;
  endTime: string;
  faculty: BatchFaculty[];
  hostel?: BatchHostel;
}
