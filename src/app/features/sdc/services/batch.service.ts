import { Injectable, signal, computed, inject } from '@angular/core';
import { BatchRecord, CreateBatchDto, BatchTrainee } from '../models/batch.model';
import { SdcService } from './sdc.service';

export const INITIAL_BATCH_RECORDS: BatchRecord[] = [
  {
    id: 'batch-201',
    batchCode: 'B-26-0001',
    batchName: 'Solar Tech Batch 01',
    sdcId: 'sdc-101',
    sdcCode: 'SDC-0001',
    sdcName: 'Jaipur Skill Center',
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
        qualification: 'B.Tech Electrical',
        experienceYears: 6
      }
    ],
    status: 'ONGOING',
    mappedAspirantsCount: 1,
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
    faculty: [],
    status: 'APPROVED',
    mappedAspirantsCount: 0,
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
    faculty: [],
    status: 'APPROVED',
    mappedAspirantsCount: 0,
    biometricAttendanceRate: 0,
    createdAt: '2026-09-18T14:00:00.000Z',
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
            const existingIds = new Set(parsed.map(p => p.id));
            const missing = INITIAL_BATCH_RECORDS.filter(b => !existingIds.has(b.id));
            return [...parsed, ...missing];
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
    return {
      total: list.length,
      ongoing: list.filter(b => b.status === 'ONGOING').length,
      approved: list.filter(b => b.status === 'APPROVED').length,
      completed: list.filter(b => b.status === 'COMPLETED').length,
      totalTrainees: list.reduce((sum, b) => sum + (b.trainees?.length || b.mappedAspirantsCount || 0), 0)
    };
  });

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
    const nextNum = this._batches().length + 1;
    const batchCode = `B-26-00${nextNum < 10 ? '0' + nextNum : nextNum}`;
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
