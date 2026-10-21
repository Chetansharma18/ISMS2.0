import { BatchRecord } from '../../../features/sdc/models/batch.model';
import { resolveMock } from '../mock.config';
import { CameraBatchItem } from '../../models/camera.model';
export interface MockBatchItem {
  id: string;
  batchCode: string;
  centreId: string;
  centreName: string;
  scheme: string;
  sector: string;
  course: string;
  targetCount: number;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  status: 'Proposed' | 'Ongoing' | 'Completed' | 'Assessed';
  trainerName: string;
  attendancePercent: number;
}

export type { CameraBatchItem };

export const MOCK_CAMERA_BATCHES: CameraBatchItem[] = resolveMock([
  {
    id: 'B-001',
    batchName: 'Batch 1',
    batchCode: 'B-26-0001',
    sdcName: 'SDC 1',
    tpName: 'TP 1',
    branch: 'Jaipur',
    cameraStatus: 'Configured (4 Cameras)'
  },
  {
    id: 'B-002',
    batchName: 'Batch 2',
    batchCode: 'B-26-0005',
    sdcName: 'SDC 1',
    tpName: 'TP 1',
    branch: 'Jaipur',
    cameraStatus: 'Configured (2 Cameras)'
  },
  {
    id: 'B-003',
    batchName: 'Batch 3',
    batchCode: 'B-26-0007',
    sdcName: 'SDC 1',
    tpName: 'TP 1',
    branch: 'Jaipur',
    cameraStatus: 'Configured (1 Camera)'
  }
]);

export const MOCK_BATCHES: MockBatchItem[] = resolveMock([
  {
    id: 'batch-1',
    batchCode: 'BAT-2026-001',
    centreId: 'sdc-1',
    centreName: 'Jaipur Skill Development Centre - Vidhyadhar Nagar',
    scheme: 'MMKVY',
    sector: 'Electronics & Hardware',
    course: 'Solar Panel Installation Technician',
    targetCount: 30,
    enrolledCount: 30,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    status: 'Ongoing',
    trainerName: 'Manish Verma',
    attendancePercent: 92
  },
  {
    id: 'batch-2',
    batchCode: 'BAT-2026-002',
    centreId: 'sdc-1',
    centreName: 'Jaipur Skill Development Centre - Vidhyadhar Nagar',
    scheme: 'MMKVY',
    sector: 'IT-ITeS',
    course: 'Domestic Data Entry Operator',
    targetCount: 30,
    enrolledCount: 28,
    startDate: '2026-09-15',
    endDate: '2026-12-15',
    status: 'Ongoing',
    trainerName: 'Neha Kumari',
    attendancePercent: 88
  },
  {
    id: 'batch-3',
    batchCode: 'BAT-2026-003',
    centreId: 'sdc-2',
    centreName: 'Marwar Kaushal Kendra - Mandore',
    scheme: 'MMKVY',
    sector: 'Apparel & Made-Ups',
    course: 'Self Employed Tailor',
    targetCount: 30,
    enrolledCount: 30,
    startDate: '2026-08-01',
    endDate: '2026-10-31',
    status: 'Ongoing',
    trainerName: 'Sita Devi',
    attendancePercent: 95
  },
  {
    id: 'batch-4',
    batchCode: 'BAT-2026-004',
    centreId: 'sdc-4',
    centreName: 'Mewar Rural Livelihoods Centre',
    scheme: 'MMKVY',
    sector: 'Healthcare',
    course: 'General Duty Assistant',
    targetCount: 25,
    enrolledCount: 25,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    status: 'Completed',
    trainerName: 'Dr. R.K. Joshi',
    attendancePercent: 91
  }
]);

/** A date (yyyy-mm-dd) this many days from today, so the sample batch with open registration stays open. */
function daysFromToday(days: number): string {
  const at = new Date();
  at.setDate(at.getDate() + days);
  const m = String(at.getMonth() + 1).padStart(2, '0');
  const d = String(at.getDate()).padStart(2, '0');
  return `${at.getFullYear()}-${m}-${d}`;
}

/** B-26-0002 starts 30 days from today, so its registration is open for the next 23 days. */
const OPEN_BATCH_START = daysFromToday(30);
const OPEN_BATCH_FREEZE = daysFromToday(23);
const OPEN_BATCH_END = daysFromToday(30 + 92);

export const INITIAL_BATCH_RECORDS: BatchRecord[] = resolveMock([
  {
    id: 'batch-201',
    batchCode: 'B-26-0001',
    batchName: 'Solar Tech Batch 01',
    sdcId: 'sdc-101',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
    sdcDistrict: 'Jaipur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Aerospace and Aviation',
    courseName: 'Domestic Data Entry Operator',
    qpCode: 'SSC/Q2212',
    courseVersion: 'NSQF v2.0',
    theoryHours: 100,
    practicalHours: 150,
    softSkillHours: 50,
    totalHours: 300,
    residential: false,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/891',
    psdStatus: 'Active',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    freezeDate: '2026-08-25',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-1',
        name: 'Faculty 1',
        ssoId: 'FACULTY1',
        type: 'Primary Trainer',
        qualification: 'B.Tech Electrical (TOT Certified)',
        experienceYears: 6
      }
    ],
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    submittedAt: '2026-08-21T10:00:00.000Z',
    approvalLevel: 1,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-08-21T10:00:00.000Z' },
      { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-08-23T11:15:00.000Z', remarks: 'Documents and center facility verified.' },
      { action: 'APPROVED', designation: 'Department', officer: 'Department', at: '2026-08-25T14:30:00.000Z', remarks: 'Center facility verified; biometric live feed confirmed.' }
    ],
    attender: {
      ssoId: 'ATTENDER1',
      name: 'Attender 1',
      mobile: '9876500021',
      email: 'attender1@example.com',
      designation: 'Attendance Officer',
      assignedAt: '2026-08-27T10:00:00.000Z'
    },
    approvedAt: '2026-08-25T14:30:00.000Z',
    approvedBy: 'Department',
    approvalRemarks: 'Center facility verified; biometric live feed confirmed.',
    inspectionStatus: 'PASSED',
    inspectionDate: '2026-08-22',
    inspectorName: 'Er. R.K. Mathur (DSO Jaipur)',
    inspectionScore: 96,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: true,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 28,
    biometricAttendanceRate: 94.2,
    createdAt: '2026-08-20T10:00:00.000Z',
    trainees: [
      {
        id: 'tr-1',
        name: 'Sunil Kumar Sharma',
        aadhaarMasked: 'XXXX-XXXX-4812',
        mobile: '98291-88412',
        enrolledDate: '2026-09-01',
        biometricVerified: true,
        attendancePercent: 96
      }
    ]
  },
  {
    id: 'batch-202',
    batchCode: 'B-26-0002',
    batchName: 'Data Entry Batch A',
    sdcId: 'sdc-101',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
    sdcDistrict: 'Jaipur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Aerospace and Aviation',
    courseName: 'Domestic Data Entry Operator',
    qpCode: 'SSC/Q2212',
    courseVersion: 'NSQF v1.2',
    theoryHours: 120,
    practicalHours: 200,
    softSkillHours: 80,
    totalHours: 400,
    residential: false,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/892',
    psdStatus: 'Active',
    startDate: OPEN_BATCH_START,
    endDate: OPEN_BATCH_END,
    freezeDate: OPEN_BATCH_FREEZE,
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-2',
        name: 'Faculty 2',
        ssoId: 'FACULTY2',
        type: 'Primary Trainer',
        qualification: 'MCA, TOT Certified',
        experienceYears: 4
      }
    ],
    // Approved; registration is open until the freeze date.
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    submittedAt: '2026-09-16T10:00:00.000Z',
    approvalLevel: 1,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-16T10:00:00.000Z' },
      { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-09-18T12:00:00.000Z', remarks: 'Documents and facility verified.' },
      { action: 'APPROVED', designation: 'Department', officer: 'Department', at: '2026-09-20T12:00:00.000Z', remarks: 'Batch approved.' }
    ],
    approvedAt: '2026-09-20T12:00:00.000Z',
    approvedBy: 'Department',
    approvalRemarks: 'Batch approved.',
    inspectionStatus: 'PASSED',
    inspectionDate: '2026-09-18',
    inspectorName: 'Er. R.K. Mathur (DSO Jaipur)',
    inspectionScore: 92,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: true,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 1,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-15T11:30:00.000Z',
    trainees: []
  },
  {
    id: 'batch-203',
    batchCode: 'B-26-0003',
    batchName: 'Auto Service Batch 01',
    sdcId: 'sdc-106',
    sdcCode: 'SDC-0006',
    sdcName: 'Bikaner Automotive & Capital Goods Center',
    sdcDistrict: 'Bikaner',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Automotive',
    courseName: 'Four Wheeler Service Technician',
    qpCode: 'ASC/Q1402',
    courseVersion: 'NSQF v1.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 12,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/893',
    psdStatus: 'Active',
    startDate: '2026-10-15',
    endDate: '2027-01-15',
    freezeDate: '2026-10-08',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-3',
        name: 'Faculty 3',
        ssoId: 'FACULTY3',
        type: 'Primary Trainer',
        qualification: 'Diploma Automobile Engineering',
        experienceYears: 5
      }
    ],
    // Approved; the start date is close, so registration has closed and only a replacement is allowed.
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    submittedAt: '2026-09-22T09:00:00.000Z',
    approvalLevel: 1,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-22T09:00:00.000Z' },
      { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-09-23T11:00:00.000Z', remarks: 'Documents and facility verified.' },
      { action: 'APPROVED', designation: 'Department', officer: 'Department', at: '2026-09-24T10:00:00.000Z', remarks: 'Batch approved.' }
    ],
    approvedAt: '2026-09-24T10:00:00.000Z',
    approvedBy: 'Department',
    approvalRemarks: 'Batch approved.',
    inspectionStatus: 'PASSED',
    inspectionDate: '2026-09-21',
    inspectorName: 'Dr. Vivek Vyas (DSO Bikaner)',
    inspectionScore: 95,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: true,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 2,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-18T14:00:00.000Z',
    trainees: []
  },
  {
    id: 'batch-204',
    batchCode: 'B-26-0004',
    batchName: 'Solar PV Installer Batch 01',
    sdcId: 'sdc-101',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
    sdcDistrict: 'Jaipur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Green Jobs',
    courseName: 'Solar PV Rooftop Grid-Tie Installer',
    qpCode: 'SGJ/Q0101',
    courseVersion: 'NSQF v2.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/894',
    psdStatus: 'Active',
    startDate: '2026-10-15',
    endDate: '2027-01-15',
    freezeDate: '2026-10-08',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-4',
        name: 'Faculty 1',
        ssoId: 'FACULTY1',
        type: 'Primary Trainer',
        qualification: 'B.Tech Electrical (TOT Certified)',
        experienceYears: 5
      }
    ],
    // Created and sent for approval; waiting for the department.
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    submittedAt: '2026-09-24T10:15:00.000Z',
    approvalLevel: 0,
    approvalTrail: [{ action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-24T10:15:00.000Z' }],
    inspectionStatus: 'SCHEDULED',
    inspectionDate: '2026-10-04',
    inspectorName: 'Er. Alok Sharma (DSO Jaipur)',
    inspectionScore: 88,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: true,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-24T10:15:00.000Z',
    trainees: []
  },
  {
    id: 'batch-205',
    batchCode: 'B-26-0005',
    batchName: 'CNC Turning Operator Batch A',
    sdcId: 'sdc-106',
    sdcCode: 'SDC-0006',
    sdcName: 'Bikaner Automotive & Capital Goods Center',
    sdcDistrict: 'Bikaner',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Capital Goods',
    courseName: 'CNC Operator Turning',
    qpCode: 'CSC/Q0115',
    courseVersion: 'NSQF v1.5',
    theoryHours: 140,
    practicalHours: 210,
    softSkillHours: 50,
    totalHours: 400,
    residential: false,
    minStrength: 12,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/895',
    psdStatus: 'Active',
    startDate: '2026-10-20',
    endDate: '2027-01-30',
    freezeDate: '2026-10-13',
    startTime: '09:30 AM',
    endTime: '05:30 PM',
    faculty: [
      {
        id: 'fac-5',
        name: 'Faculty 2',
        ssoId: 'FACULTY2',
        type: 'Primary Trainer',
        qualification: 'Diploma Mechanical',
        experienceYears: 7
      }
    ],
    // Sent for approval; waiting for the department.
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    submittedAt: '2026-09-25T14:45:00.000Z',
    approvalLevel: 1,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-25T14:45:00.000Z' },
      { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-09-27T12:00:00.000Z', remarks: 'Documents and facility verified.' }
    ],
    inspectionStatus: 'NOT_SCHEDULED',
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: false,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: false
    },
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-25T14:45:00.000Z',
    trainees: []
  },
  {
    id: 'batch-206',
    batchCode: 'B-26-0006',
    batchName: 'General Duty Assistant (GDA) Batch 02',
    sdcId: 'sdc-104',
    sdcCode: 'SDC-0004',
    sdcName: 'Udaipur Healthcare Institute',
    sdcDistrict: 'Udaipur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Healthcare',
    courseName: 'General Duty Assistant (GDA)',
    qpCode: 'HSS/Q5101',
    courseVersion: 'NSQF v2.0',
    theoryHours: 120,
    practicalHours: 190,
    softSkillHours: 50,
    totalHours: 360,
    residential: true,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/896',
    psdStatus: 'Active',
    startDate: '2026-11-01',
    endDate: '2027-02-15',
    freezeDate: '2026-10-25',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-6',
        name: 'Faculty 3',
        ssoId: 'FACULTY3',
        type: 'Primary Trainer',
        qualification: 'B.Sc Nursing (TOT Certified)',
        experienceYears: 6
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    submittedAt: '2026-09-26T09:30:00.000Z',
    approvalLevel: 0,
    approvalTrail: [{ action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-26T09:30:00.000Z' }],
    inspectionStatus: 'PASSED',
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-26T09:30:00.000Z',
    trainees: []
  },
  {
    id: 'batch-207',
    batchCode: 'B-26-0007',
    batchName: 'Electric Vehicle Service Tech Batch 01',
    sdcId: 'sdc-103',
    sdcCode: 'SDC-0003',
    sdcName: 'Kota Technical Training Center',
    sdcDistrict: 'Kota',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Automotive',
    courseName: 'Electric Vehicle Service Technician',
    qpCode: 'ASC/Q1424',
    courseVersion: 'NSQF v2.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 12,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/897',
    psdStatus: 'Active',
    startDate: '2026-10-25',
    endDate: '2027-01-25',
    freezeDate: '2026-10-18',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-7',
        name: 'Faculty 1',
        ssoId: 'FACULTY1',
        type: 'Primary Trainer',
        qualification: 'M.Tech Automotive',
        experienceYears: 4
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    submittedAt: '2026-09-26T16:20:00.000Z',
    approvalLevel: 1,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-26T16:20:00.000Z' },
      { action: 'FORWARDED', designation: 'Department', officer: 'Department', at: '2026-09-28T10:30:00.000Z', remarks: 'Documents and facility verified.' }
    ],
    inspectionStatus: 'PASSED',
    inspectorName: 'Er. M.K. Sharma (Technical Officer)',
    inspectionScore: 94,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: true,
      cctvAndBiometricActive: true,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-26T16:20:00.000Z',
    trainees: []
  },
  {
    id: 'batch-208',
    batchCode: 'B-26-0008',
    batchName: 'Retail Sales Associate Batch 03',
    sdcId: 'sdc-102',
    sdcCode: 'SDC-0002',
    sdcName: 'Jodhpur Commerce & Retail Academy',
    sdcDistrict: 'Jodhpur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Retail',
    courseName: 'Retail Sales Associate',
    qpCode: 'RAS/Q0104',
    courseVersion: 'NSQF v1.0',
    theoryHours: 100,
    practicalHours: 130,
    softSkillHours: 50,
    totalHours: 280,
    residential: false,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/898',
    psdStatus: 'Active',
    startDate: '2026-10-10',
    endDate: '2026-12-31',
    freezeDate: '2026-10-03',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    faculty: [
      {
        id: 'fac-8',
        name: 'Faculty 2',
        ssoId: 'FACULTY2',
        type: 'Primary Trainer',
        qualification: 'MBA Marketing',
        experienceYears: 3
      }
    ],
    status: 'REJECTED',
    approvalStatus: 'REJECTED',
    submittedAt: '2026-09-23T10:00:00.000Z',
    approvalLevel: 0,
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-23T10:00:00.000Z' },
      { action: 'REJECTED', designation: 'Department', officer: 'Department', at: '2026-09-25T15:00:00.000Z', remarks: 'Biometric attendance machine not configured; CCTV cloud storage link expired and lab POS terminal missing.' }
    ],
    rejectionReason: 'Biometric AEBAS attendance machine not configured; CCTV cloud storage link expired and lab POS terminal missing.',
    inspectionStatus: 'FAILED',
    inspectorName: 'Smt. Kavita Gehlot (Inspection Officer)',
    inspectionRemarks: 'Failed on IT compliance and CCTV live streaming verification.',
    inspectionScore: 54,
    checklist: {
      classroomNormsMet: true,
      equipmentAndToolsVerified: false,
      cctvAndBiometricActive: false,
      trainerTotCertified: true,
      safetyAndHygieneCompliant: true,
      candidateDossiersVerified: true
    },
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-22T11:00:00.000Z',
    trainees: []
  },
  {
    // Sent back by the department: the partner edits it and saving sends it again.
    id: 'batch-209',
    batchCode: 'B-26-0009',
    batchName: 'Retail Sales Associate Batch 04',
    sdcId: 'sdc-102',
    sdcCode: 'SDC-0002',
    sdcName: 'Jodhpur Commerce & Retail Academy',
    sdcDistrict: 'Jodhpur',
    tpName: 'Company 1',
    scheme: 'MMKVY',
    sector: 'Retail',
    courseName: 'Retail Sales Associate',
    qpCode: 'RAS/Q0104',
    courseVersion: 'NSQF v1.0',
    theoryHours: 100,
    practicalHours: 130,
    softSkillHours: 50,
    totalHours: 280,
    residential: false,
    minStrength: 12,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/899',
    psdStatus: 'Active',
    startDate: '2026-11-10',
    endDate: '2027-01-31',
    freezeDate: '2026-11-03',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    faculty: [
      {
        id: 'fac-9',
        name: 'Faculty 3',
        ssoId: 'FACULTY3',
        type: 'Primary Trainer',
        qualification: 'MBA Marketing',
        experienceYears: 3
      }
    ],
    status: 'RETURNED_TO_TP',
    approvalStatus: 'RETURNED',
    submittedAt: '2026-09-27T10:00:00.000Z',
    approvalLevel: 0,
    returnRemarks: 'Camera live feed link is not reachable and the faculty qualification is missing. Correct both and save the batch to send it again.',
    approvalTrail: [
      { action: 'SUBMITTED', designation: 'Training Partner', officer: 'Company 1', at: '2026-09-27T10:00:00.000Z' },
      { action: 'RETURNED', designation: 'Department', officer: 'Department', at: '2026-09-29T13:00:00.000Z', remarks: 'Camera live feed link is not reachable and the faculty qualification is missing. Correct both and save the batch to send it again.' }
    ],
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-26T11:00:00.000Z',
    trainees: []
  }
]);