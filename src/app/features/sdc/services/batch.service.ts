import { INITIAL_BATCH_RECORDS } from '../../../core/mock/data/batches.mock';
import { Injectable, signal, computed, inject } from '@angular/core';
import { createPersistedStore } from '../../../core/services/persisted-store';
import { canUploadStudyMaterial } from '../utils/study-material.util';
import { BatchAttender, StudyMaterial, BatchRecord, CreateBatchDto, BatchTrainee, BatchApprovalStatus, BatchInspectionStatus, BatchStatus } from '../models/batch.model';
import { SdcService } from './sdc.service';
import { MIN_TRAINEES_PER_BATCH, maxBatchesFor, sdcTarget } from '../utils/batch-limit.util';
import {
  BATCH_APPROVAL_LEVELS,
  BatchApprovalOutcome,
  canRegisterAspirants,
  canRegisterReplacement,
  currentApprovalLevel,
  freezeDateOf,
  isBatchApproved,
  isBatchWithdrawn,
  isBatchInApproval,
  isBatchRejected,
  isBatchReturned,
  isFinalApprovalLevel
} from '../utils/batch-approval.util';

export { isBatchApproved, isBatchRejected, isBatchWithdrawn, batchDisplayStatus as getBatchDisplayStatus } from '../utils/batch-approval.util';

/** Marks batches that are on the create-then-approve flow (see BatchRecord.approvalFlowVersion). */
const APPROVAL_FLOW_VERSION = 4;

/**
 * Brings batches saved on an older flow onto the current one. Batches of the seed take their state from the seed.
 * The other batches keep a decision already taken; a batch that was only a draft or waiting goes to the first
 * approval level, because a batch now goes to approval as soon as it is created.
 */
function migrateApprovalFlow(b: BatchRecord, canonical: BatchRecord | undefined): BatchRecord {
  if (b.approvalFlowVersion === APPROVAL_FLOW_VERSION) return b;

  if (canonical) {
    return {
      ...b,
      approvalFlowVersion: APPROVAL_FLOW_VERSION,
      status: canonical.status,
      approvalStatus: canonical.approvalStatus,
      approvalLevel: canonical.approvalLevel,
      approvalTrail: canonical.approvalTrail ?? [],
      submittedAt: canonical.submittedAt,
      approvedAt: canonical.approvedAt,
      approvedBy: canonical.approvedBy,
      approvalRemarks: canonical.approvalRemarks,
      rejectionReason: canonical.rejectionReason,
      returnRemarks: canonical.returnRemarks,
      startDate: canonical.startDate,
      endDate: canonical.endDate,
      freezeDate: canonical.freezeDate,
      minStrength: canonical.minStrength,
      maxStrength: canonical.maxStrength,
      mappedAspirantsCount: canonical.mappedAspirantsCount
    };
  }

  const legacy = b as { status: string };
  const wasDraft = legacy.status === 'DRAFT';
  const at = b.submittedAt ?? b.createdAt ?? new Date().toISOString();
  return {
    ...b,
    mappedAspirantsCount: b.mappedAspirantsCount ?? b.trainees?.length ?? 0,
    minStrength: MIN_TRAINEES_PER_BATCH,
    freezeDate: freezeDateOf(b),
    approvalFlowVersion: APPROVAL_FLOW_VERSION,
    approvalTrail: wasDraft ? [{ action: 'SUBMITTED' as const, designation: 'Training Partner', officer: b.tpName, at }] : (b.approvalTrail ?? []),
    ...(wasDraft
      ? { status: 'PENDING_APPROVAL' as BatchStatus, approvalStatus: 'PENDING' as BatchApprovalStatus, approvalLevel: 0, submittedAt: at }
      : {})
  };
}

/**
 * Refreshes saved batches with canonical seed fields, moves older batches onto the approval flow,
 * de-duplicates batch codes, and appends seed batches not yet saved.
 */
function reconcileBatches(stored: BatchRecord[], seed: readonly BatchRecord[]): BatchRecord[] {
  const canonicalMap = new Map(seed.map(b => [b.id, b]));

  const updated = stored.map(saved => {
    const canonical = canonicalMap.get(saved.id);
    const b = migrateApprovalFlow(saved, canonical);

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
        // Sample faculty and attender of batches saved before they carried an SSO ID.
        faculty: b.faculty?.some(f => f.ssoId) ? b.faculty : canonical.faculty,
        attender: b.attender !== undefined ? b.attender : canonical.attender,
        inspectionStatus: b.inspectionStatus || canonical.inspectionStatus
      };
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
  const added = seed.filter(b => !existingIds.has(b.id)).map(b => ({ ...b, approvalFlowVersion: APPROVAL_FLOW_VERSION }));
  return [...updated, ...added];
}

@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private sdcService = inject(SdcService);

  private readonly store = createPersistedStore<BatchRecord>({
    key: 'isms_batch_records',
    seed: INITIAL_BATCH_RECORDS,
    reconcile: reconcileBatches
  });

  /** Reactive list of batches, restored from storage with seed fallback */
  private readonly _batches = this.store.items;

  readonly batches = this._batches.asReadonly();

  private persist(records?: BatchRecord[]): void {
    this.store.persist(records);
  }

  /** Stats */
  readonly stats = computed(() => {
    const list = this._batches();
    const approved = list.filter(b => isBatchApproved(b)).length;
    const rejected = list.filter(b => isBatchRejected(b)).length;
    const pending = list.filter(b => isBatchInApproval(b)).length;

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

  /**
   * Sends a returned batch for approval again, from the first department level. A new batch goes to approval when it
   * is created, so this is used when the partner saves the corrections. Returns false when the batch is not returned.
   */
  submitForApproval(batchId: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchReturned(batch)) return false;

    const at = new Date().toISOString();
    this.updateBatch(batchId, {
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING',
      approvalLevel: 0,
      submittedAt: at,
      returnRemarks: undefined,
      approvalTrail: [
        ...(batch.approvalTrail ?? []),
        { action: 'SUBMITTED', designation: 'Training Partner', officer: batch.tpName, at }
      ]
    });
    return true;
  }

  /**
   * A department level approves the batch. A level below the last one forwards it to the next level; the last level
   * approves it. Returns null when the batch is not waiting for a decision.
   */
  approveBatch(batchId: string, remarks?: string, officerName?: string): BatchApprovalOutcome | null {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchInApproval(batch)) return null;

    const level = currentApprovalLevel(batch);
    const designation = BATCH_APPROVAL_LEVELS[level];
    const final = isFinalApprovalLevel(level);
    const at = new Date().toISOString();
    const officer = officerName || designation;
    const trail = [
      ...(batch.approvalTrail ?? []),
      { action: final ? ('APPROVED' as const) : ('FORWARDED' as const), designation, officer, at, remarks: remarks?.trim() || undefined }
    ];

    this.updateBatch(
      batchId,
      final
        ? {
          approvalStatus: 'APPROVED',
          status: 'APPROVED',
          approvalLevel: level,
          approvalTrail: trail,
          approvedAt: at,
          approvedBy: officer,
          approvalRemarks: remarks?.trim() || 'Batch approved after infrastructure & inspection verification.'
        }
        : { approvalLevel: level + 1, approvalTrail: trail }
    );
    return final ? 'APPROVED' : 'FORWARDED';
  }

  /**
   * A department level sends the batch back to the training partner for corrections. Saving the corrections sends it
   * for approval again, starting at the first level.
   */
  returnToTp(batchId: string, remarks: string, officerName?: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchInApproval(batch)) return false;

    const designation = BATCH_APPROVAL_LEVELS[currentApprovalLevel(batch)];
    this.updateBatch(batchId, {
      status: 'RETURNED_TO_TP',
      approvalStatus: 'RETURNED',
      returnRemarks: remarks,
      approvalTrail: [
        ...(batch.approvalTrail ?? []),
        { action: 'RETURNED', designation, officer: officerName || designation, at: new Date().toISOString(), remarks }
      ]
    });
    return true;
  }

  /** A department level adds a remark to the batch. The decision stays as it is. Returns false when the batch or the remark is missing. */
  addRemark(batchId: string, remark: string, officerName?: string): boolean {
    const batch = this.getBatchById(batchId);
    const text = remark.trim();
    if (!batch || !text) return false;

    const designation = BATCH_APPROVAL_LEVELS[currentApprovalLevel(batch)];
    this.updateBatch(batchId, {
      approvalTrail: [
        ...(batch.approvalTrail ?? []),
        { action: 'REMARKED', designation, officer: officerName || designation, at: new Date().toISOString(), remarks: text }
      ]
    });
    return true;
  }

  /** A department level rejects a batch that is waiting for a decision. */
  rejectBatch(batchId: string, reason: string, officerName?: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchInApproval(batch)) return false;

    const designation = BATCH_APPROVAL_LEVELS[currentApprovalLevel(batch)];
    this.updateBatch(batchId, {
      approvalStatus: 'REJECTED',
      status: 'REJECTED',
      rejectionReason: reason,
      approvalTrail: [
        ...(batch.approvalTrail ?? []),
        { action: 'REJECTED', designation, officer: officerName || designation, at: new Date().toISOString(), remarks: reason }
      ]
    });
    return true;
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
  recordInspectionResult(batchId: string, passed: boolean, remarks: string, score: number = 90, checklist?: BatchRecord['checklist']): boolean {
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
            approvalLevel: 0,
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

  /**
   * Gives an approved batch its Attender User. Only one can be assigned: returns false when the batch is not approved,
   * already has one, or does not exist.
   */
  /** Withdraw an approved batch. Stops candidate registration and marks batch as withdrawn. */
  withdrawBatch(batchId: string, reason?: string, byUser?: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchApproved(batch)) return false;

    const designation = byUser || 'Department';
    return this.updateBatch(batchId, {
      status: 'WITHDRAWN',
      approvalStatus: 'WITHDRAWN',
      approvalTrail: [
        ...(batch.approvalTrail ?? []),
        {
          action: 'WITHDRAWN',
          designation,
          officer: designation,
          at: new Date().toISOString(),
          remarks: reason ? `Batch Withdrawn: ${reason}` : 'Batch Withdrawn'
        }
      ]
    });
  }

  assignAttender(batchId: string, attender: Omit<BatchAttender, 'assignedAt'>): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchApproved(batch) || batch.attender) return false;
    this.updateBatch(batchId, { attender: { ...attender, assignedAt: new Date().toISOString() } });
    return true;
  }

  /** Replaces the Attender User of an approved batch with another person. Returns false when the batch has none to replace. */
  changeAttender(batchId: string, attender: Omit<BatchAttender, 'assignedAt'>): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !isBatchApproved(batch) || !batch.attender) return false;
    this.updateBatch(batchId, { attender: { ...attender, assignedAt: new Date().toISOString() } });
    return true;
  }

  /** Takes the Attender User off the batch, so another can be assigned. */
  unassignAttender(batchId: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !batch.attender) return false;
    // null (not undefined) marks it as taken off on purpose, so the sample data does not bring it back.
    this.updateBatch(batchId, { attender: null });
    return true;
  }

  /** Changes the trainer type and qualification of a faculty member in every batch they are in. */
  updateFacultyProfile(ssoId: string, changes: { trainerType: string; qualification: string }): number {
    const wanted = ssoId.trim().toLowerCase();
    let changed = 0;
    for (const batch of this._batches()) {
      if (!(batch.faculty ?? []).some(f => f.ssoId?.toLowerCase() === wanted)) continue;
      this.updateBatch(batch.id, {
        faculty: batch.faculty.map(f =>
          f.ssoId?.toLowerCase() === wanted ? { ...f, trainerType: changes.trainerType, type: changes.trainerType, qualification: changes.qualification } : f
        )
      });
      changed++;
    }
    return changed;
  }

  /**
   * Takes a faculty member off every batch that is not closed (rejected, completed or cancelled). A batch keeps the
   * faculty member when they are its only trainer.
   */
  unmapFaculty(ssoId: string): { removed: number; kept: number } {
    const wanted = ssoId.trim().toLowerCase();
    let removed = 0;
    let kept = 0;
    for (const batch of this._batches()) {
      const isHis = (f: { ssoId?: string }) => f.ssoId?.toLowerCase() === wanted;
      if (!(batch.faculty ?? []).some(isHis)) continue;
      const rest = batch.faculty.filter(f => !isHis(f));
      const closed = isBatchRejected(batch) || batch.status === 'COMPLETED' || batch.status === 'CANCELLED';
      if (closed || rest.length === 0) {
        kept++;
        continue;
      }
      this.updateBatch(batch.id, { faculty: rest });
      removed++;
    }
    return { removed, kept };
  }

  /** Adds a piece of study material to an approved batch. Returns it, or null when the batch is not approved. */
  addStudyMaterial(batchId: string, material: Omit<StudyMaterial, 'id' | 'uploadedAt'>): StudyMaterial | null {
    const batch = this.getBatchById(batchId);
    if (!batch || !canUploadStudyMaterial(batch)) return null;
    const added: StudyMaterial = { ...material, id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`, uploadedAt: new Date().toISOString() };
    this.updateBatch(batchId, { studyMaterials: [added, ...(batch.studyMaterials ?? [])] });
    return added;
  }

  /** Replaces the details of a piece of study material; its id and upload date stay. */
  updateStudyMaterial(batchId: string, materialId: string, material: Omit<StudyMaterial, 'id' | 'uploadedAt'>): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !canUploadStudyMaterial(batch)) return false;
    const list = batch.studyMaterials ?? [];
    if (!list.some(m => m.id === materialId)) return false;
    this.updateBatch(batchId, { studyMaterials: list.map(m => (m.id === materialId ? { ...material, id: m.id, uploadedAt: m.uploadedAt } : m)) });
    return true;
  }

  /** Removes a piece of study material from the batch. */
  removeStudyMaterial(batchId: string, materialId: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch || !canUploadStudyMaterial(batch)) return false;
    this.updateBatch(batchId, { studyMaterials: (batch.studyMaterials ?? []).filter(m => m.id !== materialId) });
    return true;
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
    // A center can run only as many batches as its target allows (at most 30 trainees per batch).
    const center = dto.sdcId ? this.sdcService.getSdcById(dto.sdcId) : undefined;
    if (center) {
      const registered = this.getBatchesBySdc(center.id).filter(b => b.status !== 'REJECTED' && b.status !== 'CANCELLED').length;
      const allowed = maxBatchesFor(sdcTarget(center));
      if (registered >= allowed) {
        throw new Error(`All ${allowed} batches allowed for this center's target are already registered.`);
      }
    }

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
    const startDate = dto.startDate || dto.batchStartDate || '2026-10-01';
    const submittedAt = new Date().toISOString();

    const newRecord: BatchRecord = {
      id: newId,
      batchCode,
      sdcId: dto.sdcId || 'sdc-101',
      sdcCode: dto.sdcCode || 'SDC-0001',
      sdcName: dto.sdcName || 'Jaipur Skill Center',
      tpName: dto.tpName || 'Company 1',
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
      minStrength: MIN_TRAINEES_PER_BATCH,
      maxStrength: strength,
      approvedBatchStrength: strength,
      nipaNo: dto.nipaNo || `N-IPA/RSLDC/2026/${890 + nextNum}`,
      ipaId: dto.ipaId,
      ipaAllocationId: dto.ipaAllocationId,
      ipaCourseRowId: dto.ipaCourseRowId,
      cycleNo: dto.cycleNo,
      costPerBatch: dto.costPerBatch,
      psdStatus: (dto.psdPaymentStatus === 'SUCCESS' || dto.psdPaymentStatus === 'PAID') ? 'Active' : 'Inactive',
      psdPaymentStatus: dto.psdPaymentStatus || 'SUCCESS',
      psdFee: dto.psdFee || 500,
      psdPaymentRef: dto.psdPaymentRef || `PSD-TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      psdPaymentDate: dto.psdPaymentDate || new Date().toISOString().split('T')[0],
      remarks: dto.remarks || '',
      startDate,
      batchStartDate: startDate,
      endDate: dto.endDate || dto.batchEndDate || '2026-12-31',
      batchEndDate: dto.batchEndDate || dto.endDate || '2026-12-31',
      freezeDate: freezeDateOf({ startDate }),
      startTime: dto.startTime || dto.batchStartTime || '09:00',
      batchStartTime: dto.batchStartTime || dto.startTime || '09:00',
      endTime: dto.endTime || dto.batchEndTime || '17:00',
      batchEndTime: dto.batchEndTime || dto.endTime || '17:00',
      faculty: [...(dto.faculty || [])],
      cameras: [...(dto.cameras || [])],
      hostels: dto.hostels || (dto.hostel ? [dto.hostel] : []),
      hostel: dto.hostel || (dto.hostels && dto.hostels.length > 0 ? dto.hostels[0] : undefined),
      // A new batch goes to approval at once; aspirants are registered after it is approved.
      status: 'PENDING_APPROVAL',
      approvalStatus: 'PENDING',
      approvalLevel: 0,
      submittedAt,
      approvalFlowVersion: APPROVAL_FLOW_VERSION,
      approvalTrail: [{ action: 'SUBMITTED', designation: 'Training Partner', officer: dto.tpName || 'Company 1', at: submittedAt }],
      mappedAspirantsCount: 0,
      biometricAttendanceRate: 0,
      trainees: [],
      createdAt: submittedAt
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
  mapCandidateToBatch(
    batchId: string,
    candidate: { name: string; aadhaarMasked: string; mobile: string },
    options: { replacement?: boolean } = {}
  ): boolean {
    const batch = this.getBatchById(batchId);
    // After the freeze date only a replacement for a dropped student can take a free seat.
    const allowed = options.replacement ? canRegisterReplacement(batch) : canRegisterAspirants(batch);
    if (!batch || !allowed) {
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
          // Registering a trainee never changes the approval state.
          return {
            ...b,
            mappedAspirantsCount: (b.mappedAspirantsCount || 0) + 1,
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

  /** A student leaves the batch: the seat is freed so a replacement can take it. */
  releaseSeat(batchId: string, aadhaarMasked: string): boolean {
    const batch = this.getBatchById(batchId);
    if (!batch) return false;
    this.updateBatch(batchId, {
      mappedAspirantsCount: Math.max(0, (batch.mappedAspirantsCount || 0) - 1),
      trainees: (batch.trainees ?? []).filter(t => t.aadhaarMasked !== aadhaarMasked)
    });
    return true;
  }
}
