import { BatchRecord } from '../../../features/sdc/models/batch.model';
import { resolveMock } from '../mock.config';
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

export interface CameraBatchItem {
  id: string;
  batchName: string;
  batchCode: string;
  sdcName: string;
  tpName: string;
  branch: string;
  cameraStatus: string;
}

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


export const INITIAL_BATCH_RECORDS: BatchRecord[] = resolveMock([
  {
    id: 'batch-201',
    batchCode: 'B-26-0001',
    batchName: 'Solar Tech Batch 01',
    sdcId: 'sdc-101',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
    sdcDistrict: 'Jaipur',
    tpName: 'ARNOLD SAMARTH',
    scheme: 'SAMARTH',
    sector: 'Aerospace and Aviation',
    courseName: 'Domestic Data Entry Operator',
    qpCode: 'SSC/Q2212',
    courseVersion: 'NSQF v2.0',
    theoryHours: 100,
    practicalHours: 150,
    softSkillHours: 50,
    totalHours: 300,
    residential: false,
    minStrength: 15,
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
        name: 'Vikas Purohit',
        type: 'Primary Trainer',
        qualification: 'B.Tech Electrical (TOT Certified)',
        experienceYears: 6
      }
    ],
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
    approvedAt: '2026-08-25T14:30:00.000Z',
    approvedBy: 'Sh. Alok Sharma (Joint Director, RSLDC)',
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
    tpName: 'ARNOLD SAMARTH',
    scheme: 'SAMARTH',
    sector: 'Aerospace and Aviation',
    courseName: 'Domestic Data Entry Operator',
    qpCode: 'SSC/Q2212',
    courseVersion: 'NSQF v1.2',
    theoryHours: 120,
    practicalHours: 200,
    softSkillHours: 80,
    totalHours: 400,
    residential: false,
    minStrength: 15,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/892',
    psdStatus: 'Active',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    freezeDate: '2026-09-25',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-2',
        name: 'Pooja Verma',
        type: 'Primary Trainer',
        qualification: 'MCA, TOT Certified',
        experienceYears: 4
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    approvedAt: '2026-09-20T11:00:00.000Z',
    approvedBy: 'Sh. Alok Sharma (Joint Director, RSLDC)',
    approvalRemarks: 'Sanction order granted. Commencement allowed.',
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
    scheme: 'RAJKViK',
    sector: 'Automotive',
    courseName: 'Four Wheeler Service Technician',
    qpCode: 'ASC/Q1402',
    courseVersion: 'NSQF v1.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 15,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/893',
    psdStatus: 'Active',
    startDate: '2026-10-15',
    endDate: '2027-01-15',
    freezeDate: '2026-10-05',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-3',
        name: 'Gaurav Bishnoi',
        type: 'Primary Trainer',
        qualification: 'Diploma Automobile Engineering',
        experienceYears: 5
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
    approvedAt: '2026-09-22T16:15:00.000Z',
    approvedBy: 'Dr. Vivek Vyas (Inspection Officer)',
    approvalRemarks: 'Lab hydraulic lifts and diagnostic equipment verified in person.',
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
    tpName: 'ARNOLD SAMARTH',
    scheme: 'SAMARTH',
    sector: 'Green Jobs',
    courseName: 'Solar PV Rooftop Grid-Tie Installer',
    qpCode: 'SGJ/Q0101',
    courseVersion: 'NSQF v2.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 15,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/894',
    psdStatus: 'Active',
    startDate: '2026-10-15',
    endDate: '2027-01-15',
    freezeDate: '2026-10-05',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-4',
        name: 'Rajesh Saini',
        type: 'Primary Trainer',
        qualification: 'B.Tech Electrical (TOT Certified)',
        experienceYears: 5
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
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
    scheme: 'RAJKViK',
    sector: 'Capital Goods',
    courseName: 'CNC Operator Turning',
    qpCode: 'CSC/Q0115',
    courseVersion: 'NSQF v1.5',
    theoryHours: 140,
    practicalHours: 210,
    softSkillHours: 50,
    totalHours: 400,
    residential: false,
    minStrength: 15,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/895',
    psdStatus: 'Active',
    startDate: '2026-10-20',
    endDate: '2027-01-30',
    freezeDate: '2026-10-10',
    startTime: '09:30 AM',
    endTime: '05:30 PM',
    faculty: [
      {
        id: 'fac-5',
        name: 'Sunil Jangid',
        type: 'Primary Trainer',
        qualification: 'Diploma Mechanical',
        experienceYears: 7
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
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
    tpName: 'CareFirst Foundation',
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
    minStrength: 15,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/896',
    psdStatus: 'Active',
    startDate: '2026-11-01',
    endDate: '2027-02-15',
    freezeDate: '2026-10-22',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-6',
        name: 'Dr. Pratibha Rathore',
        type: 'Primary Trainer',
        qualification: 'B.Sc Nursing (TOT Certified)',
        experienceYears: 6
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
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
    tpName: 'TechSkill India',
    scheme: 'SAMARTH',
    sector: 'Automotive',
    courseName: 'Electric Vehicle Service Technician',
    qpCode: 'ASC/Q1424',
    courseVersion: 'NSQF v2.0',
    theoryHours: 120,
    practicalHours: 180,
    softSkillHours: 50,
    totalHours: 350,
    residential: false,
    minStrength: 15,
    maxStrength: 25,
    nipaNo: 'N-IPA/RSLDC/2026/897',
    psdStatus: 'Active',
    startDate: '2026-10-25',
    endDate: '2027-01-25',
    freezeDate: '2026-10-15',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    faculty: [
      {
        id: 'fac-7',
        name: 'Praveen Malav',
        type: 'Primary Trainer',
        qualification: 'M.Tech Automotive',
        experienceYears: 4
      }
    ],
    status: 'PENDING_APPROVAL',
    approvalStatus: 'PENDING',
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
    minStrength: 15,
    maxStrength: 30,
    nipaNo: 'N-IPA/RSLDC/2026/898',
    psdStatus: 'Active',
    startDate: '2026-10-10',
    endDate: '2026-12-31',
    freezeDate: '2026-09-30',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    faculty: [
      {
        id: 'fac-8',
        name: 'Meena Bhati',
        type: 'Primary Trainer',
        qualification: 'MBA Marketing',
        experienceYears: 3
      }
    ],
    status: 'REJECTED',
    approvalStatus: 'REJECTED',
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
  }
]);