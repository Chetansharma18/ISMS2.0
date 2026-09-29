import { Injectable, signal, computed, inject } from '@angular/core';
import { BatchRecord, CreateBatchDto, BatchTrainee, BatchApprovalStatus, BatchInspectionStatus, BatchStatus } from '../models/batch.model';
import { SdcService } from './sdc.service';

export const INITIAL_BATCH_RECORDS: BatchRecord[] = [
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
    mappedAspirantsCount: 3,
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
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
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
    tpName: 'Apex Vocational Solutions',
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
    status: 'APPROVED',
    approvalStatus: 'APPROVED',
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
    tpName: 'Apex Vocational Solutions',
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
    tpName: 'Apex Skill Works',
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
];

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private sdcService = inject(SdcService);
  private readonly STORAGE_KEY = 'isms_batch_records';

  /** Reactive list of batches initialized with localStorage fallback */
  private readonly _batches = signal<BatchRecord[]>(this.loadInitialBatches());

  readonly batches = this._batches.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === this.STORAGE_KEY && event.newValue) {
          try {
            const records: BatchRecord[] = JSON.parse(event.newValue);
            if (Array.isArray(records) && records.length > 0) {
              this._batches.set(records);
            }
          } catch { }
        }
      });
    }
  }

  private loadInitialBatches(): BatchRecord[] {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed: BatchRecord[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const canonicalMap = new Map(INITIAL_BATCH_RECORDS.map(b => [b.id, b]));

            // Sanitize existing items with canonical data
            const updated = parsed.map(b => {
              const canonical = canonicalMap.get(b.id);
              if (canonical) {
                return {
                  ...b,
                  batchCode: canonical.batchCode,
                  batchName: canonical.batchName,
                  sdcId: canonical.sdcId,
                  sdcCode: canonical.sdcCode,
                  sdcName: canonical.sdcName,
                  sdcDistrict: canonical.sdcDistrict,
                  tpName: canonical.tpName,
                  scheme: canonical.scheme,
                  sector: canonical.sector,
                  courseName: canonical.courseName,
                  maxStrength: canonical.maxStrength,
                  mappedAspirantsCount: canonical.mappedAspirantsCount,
                  status: (b.status === 'ONGOING' ? 'APPROVED' : (b.status === 'INSPECTION_PENDING' ? 'PENDING_APPROVAL' : b.status)) || canonical.status,
                  approvalStatus: (b.approvalStatus === 'INSPECTION_PENDING' ? 'PENDING' : b.approvalStatus) || canonical.approvalStatus,
                  inspectionStatus: b.inspectionStatus || canonical.inspectionStatus
                };
              }
              if (b.status === 'ONGOING') {
                b.status = 'APPROVED';
              }
              if (b.status === 'INSPECTION_PENDING') {
                b.status = 'PENDING_APPROVAL';
              }
              if (b.approvalStatus === 'INSPECTION_PENDING') {
                b.approvalStatus = 'PENDING';
              }
              if (!b.approvalStatus) {
                b.approvalStatus = (b.status === 'APPROVED' || b.status === 'COMPLETED') ? 'APPROVED' : 'PENDING';
              }
              return b;
            });

            // Ensure unique batch codes across all items
            const seenCodes = new Set<string>();
            let maxCodeSeq = 0;
            updated.forEach(b => {
              const m = b.batchCode?.match(/B-26-(\d+)/);
              if (m) {
                const seq = parseInt(m[1], 10);
                if (seq > maxCodeSeq) maxCodeSeq = seq;
              }
            });

            updated.forEach(b => {
              if (seenCodes.has(b.batchCode)) {
                maxCodeSeq++;
                b.batchCode = `B-26-${String(maxCodeSeq).padStart(4, '0')}`;
              }
              seenCodes.add(b.batchCode);
            });

            const existingIds = new Set(updated.map(p => p.id));
            const missing = INITIAL_BATCH_RECORDS.filter(b => !existingIds.has(b.id));
            const combined = [...updated, ...missing];
            this.persist(combined);
            return combined;
          }
        }
      } catch (e) {
        console.error('Failed to load batches from localStorage', e);
      }
    }
    this.persist(INITIAL_BATCH_RECORDS);
    return INITIAL_BATCH_RECORDS;
  }

  private persist(records?: BatchRecord[]): void {
    const list = records || this._batches();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to persist batches to localStorage', e);
      }
    }
  }

  /** Stats */
  readonly stats = computed(() => {
    const list = this._batches();
    const pending = list.filter(b => b.approvalStatus === 'PENDING' || b.status === 'PENDING_APPROVAL').length;
    const inspectionPending = list.filter(b => b.approvalStatus === 'INSPECTION_PENDING' || b.inspectionStatus === 'SCHEDULED').length;
    const approved = list.filter(b => b.approvalStatus === 'APPROVED' || b.status === 'APPROVED' || b.status === 'ONGOING').length;
    const rejected = list.filter(b => b.approvalStatus === 'REJECTED' || b.status === 'CANCELLED' || b.status === 'REJECTED').length;
    return {
      total: list.length,
      pending,
      inspectionPending,
      approved,
      rejected,
      ongoing: list.filter(b => b.status === 'ONGOING').length,
      completed: list.filter(b => b.status === 'COMPLETED').length,
      totalTrainees: list.reduce((sum, b) => sum + (b.trainees?.length || b.mappedAspirantsCount || 0), 0)
    };
  });

  /** Approve Batch */
  approveBatch(batchId: string, remarks?: string, officerName?: string): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            approvalStatus: 'APPROVED' as BatchApprovalStatus,
            status: (b.status === 'PENDING_APPROVAL' || b.status === 'INSPECTION_PENDING' || b.status === 'REJECTED') ? 'APPROVED' as BatchStatus : b.status,
            approvedAt: new Date().toISOString(),
            approvedBy: officerName || 'Department Scrutiny Officer',
            approvalRemarks: remarks || 'Batch approved after infrastructure & inspection verification.'
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Reject Batch */
  rejectBatch(batchId: string, reason: string): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            approvalStatus: 'REJECTED' as BatchApprovalStatus,
            status: 'REJECTED' as BatchStatus,
            rejectionReason: reason
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Update Batch Record */
  updateBatch(batchId: string, updates: Partial<BatchRecord>): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            ...updates
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Schedule Inspection */
  scheduleInspection(batchId: string, date: string, inspector: string): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            approvalStatus: 'INSPECTION_PENDING' as BatchApprovalStatus,
            status: 'INSPECTION_PENDING' as BatchStatus,
            inspectionStatus: 'SCHEDULED' as BatchInspectionStatus,
            inspectionDate: date,
            inspectorName: inspector
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Record Inspection Result */
  recordInspectionResult(batchId: string, passed: boolean, remarks: string, score: number = 90, checklist?: any): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            inspectionStatus: (passed ? 'PASSED' : 'FAILED') as BatchInspectionStatus,
            inspectionRemarks: remarks,
            inspectionScore: score,
            checklist: checklist || b.checklist
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Revert / Revoke Approval */
  revertApproval(batchId: string): boolean {
    let success = false;
    this._batches.update(list => {
      const updated = list.map(b => {
        if (b.id === batchId) {
          success = true;
          return {
            ...b,
            approvalStatus: 'PENDING' as BatchApprovalStatus,
            status: 'PENDING_APPROVAL' as BatchStatus,
            approvedAt: undefined,
            approvedBy: undefined,
            approvalRemarks: undefined
          };
        }
        return b;
      });
      if (success) this.persist(updated);
      return updated;
    });
    return success;
  }

  /** Get batch by ID */
  getBatchById(id: string): BatchRecord | undefined {
    return this._batches().find(b => b.id === id);
  }

  /** Batches for a specific SDC */
  getBatchesBySdc(sdcId: string): BatchRecord[] {
    return this._batches().filter(b => b.sdcId === sdcId);
  }

  /**
   * STAGE 5: Create Batch with PSD Payment Receipt & SDC sync
   */
  createBatch(dto: CreateBatchDto): BatchRecord {
    const existingNums = this._batches().map(b => {
      const match = b.batchCode?.match(/B-26-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = Math.max(0, ...existingNums);
    const nextNum = maxNum + 1;
    const batchCode = `B-26-${String(nextNum).padStart(4, '0')}`;
    const newId = `batch-${Date.now()}`;

    const duration = dto.totalHours || dto.batchDurationHours || 300;
    const strength = dto.approvedBatchStrength || dto.maxStrength || 30;
    const course = dto.courseName || dto.course || 'Domestic Data Entry Operator';

    const newRecord: BatchRecord = {
      id: newId,
      batchCode,
      sdcId: dto.sdcId || 'sdc-101',
      sdcCode: dto.sdcCode || 'SDC-0001',
      sdcName: dto.sdcName || 'Jaipur Skill Center',
      tpName: dto.tpName || 'ARNOLD SAMARTH',
      scheme: dto.scheme || 'SAMARTH',
      sector: dto.sector || 'Electronics',
      courseName: course,
      course,
      qpCode: dto.qpCode || 'ELE/Q5901',
      courseVersion: dto.courseVersion || 'NSQF v2.0',
      theoryHours: dto.theoryHours ?? Math.round(duration * 0.4),
      practicalHours: dto.practicalHours ?? Math.round(duration * 0.5),
      softSkillHours: dto.softSkillHours ?? Math.round(duration * 0.1),
      totalHours: duration,
      batchDurationHours: duration,
      residential: dto.residential ?? false,
      minStrength: dto.minStrength || 15,
      maxStrength: strength,
      approvedBatchStrength: strength,
      nipaNo: dto.nipaNo || `N-IPA/RSLDC/2026/${890 + nextNum}`,
      psdStatus: (dto.psdPaymentStatus === 'SUCCESS' || dto.psdPaymentStatus === 'PAID') ? 'Active' : 'Inactive',
      psdPaymentStatus: dto.psdPaymentStatus || 'SUCCESS',
      psdFee: dto.psdFee || 500,
      psdPaymentRef: dto.psdPaymentRef || `PSD-TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      psdPaymentDate: dto.psdPaymentDate || new Date().toISOString().split('T')[0],
      remarks: dto.remarks || '',
      startDate: dto.startDate || dto.batchStartDate || '2026-10-01',
      batchStartDate: dto.batchStartDate || dto.startDate || '2026-10-01',
      endDate: dto.endDate || dto.batchEndDate || '2026-12-31',
      batchEndDate: dto.batchEndDate || dto.endDate || '2026-12-31',
      freezeDate: dto.freezeDate || '2026-09-25',
      startTime: dto.startTime || dto.batchStartTime || '09:00',
      batchStartTime: dto.batchStartTime || dto.startTime || '09:00',
      endTime: dto.endTime || dto.batchEndTime || '17:00',
      batchEndTime: dto.batchEndTime || dto.endTime || '17:00',
      faculty: [...(dto.faculty || [])],
      hostels: dto.hostels || (dto.hostel ? [dto.hostel] : []),
      hostel: dto.hostel || (dto.hostels && dto.hostels.length > 0 ? dto.hostels[0] : undefined),
      status: 'APPROVED',
      mappedAspirantsCount: 0,
      biometricAttendanceRate: 0,
      trainees: [],
      createdAt: new Date().toISOString()
    };

    this._batches.update(list => {
      const updated = [newRecord, ...list];
      this.persist(updated);
      return updated;
    });

    // Synchronize batch count on associated SDC
    if (dto.sdcId) {
      this.sdcService.incrementBatchesCount(dto.sdcId);
    }

    return newRecord;
  }

  /**
   * STAGE 6: Map candidate to batch
   */
  mapCandidateToBatch(batchId: string, candidate: { name: string; aadhaarMasked: string; mobile: string }): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || batch.mappedAspirantsCount >= batch.maxStrength) {
      return false;
    }

    const newTrainee: BatchTrainee = {
      id: `tr-${Date.now()}`,
      name: candidate.name,
      aadhaarMasked: candidate.aadhaarMasked,
      mobile: candidate.mobile,
      enrolledDate: new Date().toISOString().split('T')[0],
      biometricVerified: true,
      attendancePercent: 100
    };

    this._batches.update(list => {
      const updated = list.map(b =>
        b.id === batchId
          ? {
            ...b,
            mappedAspirantsCount: b.mappedAspirantsCount + 1,
            trainees: [newTrainee, ...b.trainees]
          }
          : b
      );
      this.persist(updated);
      return updated;
    });

    return true;
  }
}
