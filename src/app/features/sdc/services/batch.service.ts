import { INITIAL_BATCH_RECORDS } from '../../../core/mock/data/batches.mock';
import { Injectable, signal, computed, inject } from '@angular/core';
import { BatchRecord, CreateBatchDto, BatchTrainee, BatchApprovalStatus, BatchInspectionStatus, BatchStatus } from '../models/batch.model';
import { SdcService } from './sdc.service';



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
              const mappedCount = canonical ? canonical.mappedAspirantsCount : (b.mappedAspirantsCount ?? b.trainees?.length ?? 0);
              const maxStr = canonical?.maxStrength || b.maxStrength || 30;
              const isApproved = mappedCount >= 25 && mappedCount <= maxStr;
              const isRejected = b.status === 'REJECTED' || b.approvalStatus === 'REJECTED' || canonical?.status === 'REJECTED';

              const computedStatus: BatchStatus = isRejected ? 'REJECTED' : (isApproved ? 'APPROVED' : 'PENDING_APPROVAL');
              const computedApprovalStatus: BatchApprovalStatus = isRejected ? 'REJECTED' : (isApproved ? 'APPROVED' : 'PENDING');

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
                  status: computedStatus,
                  approvalStatus: computedApprovalStatus,
                  inspectionStatus: b.inspectionStatus || canonical.inspectionStatus
                };
              }
              
              return {
                ...b,
                mappedAspirantsCount: mappedCount,
                status: computedStatus,
                approvalStatus: computedApprovalStatus
              };
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
    const isApproved = (b: BatchRecord) => {
      if (b.status === 'REJECTED' || b.approvalStatus === 'REJECTED') return false;
      const count = b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
      const max = b.approvedBatchStrength || b.maxStrength || 30;
      return count >= 25 && count <= max;
    };
    const isRejected = (b: BatchRecord) => b.status === 'REJECTED' || b.approvalStatus === 'REJECTED';

    const approved = list.filter(b => isApproved(b)).length;
    const rejected = list.filter(b => isRejected(b)).length;
    const pending = list.filter(b => !isApproved(b) && !isRejected(b)).length;

    return {
      total: list.length,
      pending,
      inspectionPending: 0,
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
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING',
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
      const updated = list.map(b => {
        if (b.id === batchId) {
          const newCount = (b.mappedAspirantsCount || 0) + 1;
          const maxStr = b.approvedBatchStrength || b.maxStrength || 30;
          const isApproved = newCount >= 25 && newCount <= maxStr;
          const isRejected = b.status === 'REJECTED' || b.approvalStatus === 'REJECTED';

          return {
            ...b,
            mappedAspirantsCount: newCount,
            status: (isRejected ? 'REJECTED' : (isApproved ? 'APPROVED' : 'PENDING_APPROVAL')) as BatchStatus,
            approvalStatus: (isRejected ? 'REJECTED' : (isApproved ? 'APPROVED' : 'PENDING')) as BatchApprovalStatus,
            trainees: [newTrainee, ...(b.trainees || [])]
          };
        }
        return b;
      });
      this.persist(updated);
      return updated;
    });

    return true;
  }
}

/** Helper to check if a batch qualifies as APPROVED (25 to 30 mapped aspirants and not rejected) */
export function isBatchApproved(b: BatchRecord): boolean {
  if (!b) return false;
  if (b.status === 'REJECTED' || b.approvalStatus === 'REJECTED') return false;
  const count = b.mappedAspirantsCount ?? b.trainees?.length ?? 0;
  const max = b.approvedBatchStrength || b.maxStrength || 30;
  return count >= 25 && count <= max;
}

/** Helper to check if a batch is REJECTED */
export function isBatchRejected(b: BatchRecord): boolean {
  if (!b) return false;
  return b.status === 'REJECTED' || b.approvalStatus === 'REJECTED';
}

/** Helper to get canonical display status: APPROVED, REJECTED, or PENDING */
export function getBatchDisplayStatus(b: BatchRecord): 'APPROVED' | 'PENDING' | 'REJECTED' {
  if (isBatchRejected(b)) return 'REJECTED';
  if (isBatchApproved(b)) return 'APPROVED';
  return 'PENDING';
}
