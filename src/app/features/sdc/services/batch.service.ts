import { Injectable, signal, computed } from '@angular/core';
import { BatchRecord, CreateBatchDto, BatchTrainee } from '../models/batch.model';

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  /** Reactive list of batches */
  private readonly _batches = signal<BatchRecord[]>([
    {
      id: 'batch-201',
      batchCode: 'B-26-0001',
      batchName: 'Solar Tech Batch 01',
      sdcId: 'sdc-101',
      sdcCode: 'SDC-001',
      sdcName: 'Apex Skill Development Center',
      tpName: 'Apex Skill Solutions Pvt Ltd',
      scheme: 'MMKVY',
      sector: 'Green Energy',
      courseName: 'Solar Panel Installation Technician',
      qpCode: 'ELE/Q5901',
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
      sdcCode: 'SDC-001',
      sdcName: 'Apex Skill Development Center',
      tpName: 'Apex Skill Solutions Pvt Ltd',
      scheme: 'SAMARTH',
      sector: 'IT & ITeS',
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
      sdcId: 'sdc-102',
      sdcCode: 'SDC-002',
      sdcName: 'Rajasthan Kaushal Kendra',
      tpName: 'Apex Skill Solutions Pvt Ltd',
      scheme: 'MNSKSY',
      sector: 'Automotive',
      courseName: 'Automotive Service Technician',
      qpCode: 'ASC/Q1411',
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
  ]);

  readonly batches = this._batches.asReadonly();

  /** Stats */
  readonly stats = computed(() => {
    const list = this._batches();
    return {
      total: list.length,
      ongoing: list.filter(b => b.status === 'ONGOING').length,
      approved: list.filter(b => b.status === 'APPROVED').length,
      totalTrainees: list.reduce((sum, b) => sum + b.mappedAspirantsCount, 0),
      avgAttendance: Math.round(
        list.reduce((sum, b) => sum + b.biometricAttendanceRate, 0) / (list.length || 1)
      )
    };
  });

  /** Get batches by SDC */
  getBatchesBySdc(sdcId: string): BatchRecord[] {
    return this._batches().filter(b => b.sdcId === sdcId);
  }

  /** Get single batch by id */
  getBatchById(id: string): BatchRecord | undefined {
    return this._batches().find(b => b.id === id);
  }

  /**
   * STAGE 5: Complete Batch Creation
   */
  createBatch(dto: CreateBatchDto): BatchRecord {
    const nextNum = this._batches().length + 1;
    const batchCode = `B-26-000${nextNum}`;
    const newId = `batch-${Date.now()}`;

    const newRecord: BatchRecord = {
      id: newId,
      batchCode,
      sdcId: dto.sdcId,
      sdcCode: dto.sdcCode,
      sdcName: dto.sdcName,
      tpName: dto.tpName,
      scheme: dto.scheme,
      sector: dto.sector,
      courseName: dto.courseName,
      qpCode: dto.qpCode,
      courseVersion: dto.courseVersion,
      theoryHours: dto.theoryHours,
      practicalHours: dto.practicalHours,
      softSkillHours: dto.softSkillHours,
      totalHours: dto.totalHours,
      residential: dto.residential,
      minStrength: dto.minStrength,
      maxStrength: dto.maxStrength,
      nipaNo: dto.nipaNo,
      psdStatus: dto.psdStatus,
      startDate: dto.startDate,
      endDate: dto.endDate,
      freezeDate: dto.freezeDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      faculty: [...dto.faculty],
      hostel: dto.hostel,
      status: 'APPROVED',
      mappedAspirantsCount: 0,
      biometricAttendanceRate: 0,
      trainees: [],
      createdAt: new Date().toISOString()
    };

    this._batches.update(list => [newRecord, ...list]);
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

    this._batches.update(list =>
      list.map(b =>
        b.id === batchId
          ? {
              ...b,
              mappedAspirantsCount: b.mappedAspirantsCount + 1,
              trainees: [newTrainee, ...b.trainees]
            }
          : b
      )
    );

    return true;
  }
}
