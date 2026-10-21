import { INITIAL_SDC_RECORDS } from '../../../core/mock/data/sdc.mock';
import { Injectable, signal, computed } from '@angular/core';
import { createPersistedStore } from '../../../core/services/persisted-store';
import {
  SdcActivityEntry,
  SdcRecord,
  SdcFormData,
  SdcInspectionData,
  SdcStatus,
  SdcCenterHead,
  SdcPsdPayment,
  SCHEME_COURSE_CATALOG
} from '../models/sdc.model';
import { DepartmentOfficer, departmentOfficer } from '../utils/department-officer.util';



const REAL_CENTER_PHOTOS = [
  { id: 'p1', name: 'Center_Front_Building.jpg', url: '/center-photos/center-building.jpg', size: '2.4 MB', tag: 'Photo 1' },
  { id: 'p2', name: 'IT_Computer_Lab.jpg', url: '/center-photos/computer-lab.jpg', size: '2.8 MB', tag: 'Photo 2' },
  { id: 'p3', name: 'Practical_Training_Classroom.jpg', url: '/center-photos/practical-training.jpg', size: '3.1 MB', tag: 'Photo 3' }
];

const hasPlaceholderPhotos = (sdc: SdcRecord): boolean =>
  !!sdc.centerPhotos && sdc.centerPhotos.some(p => p.url && p.url.startsWith('data:image/svg+xml'));

/**
 * Refreshes saved SDC records with the canonical seed fields (so stale saves self-heal),
 * swaps placeholder photos for the real ones, and appends any seed records not yet saved.
 */
function reconcileSdcs(stored: SdcRecord[], seed: readonly SdcRecord[]): SdcRecord[] {
  const canonicalMap = new Map(seed.map(s => [s.id, s]));

  const updated = stored.map(sdc => {
    const canonical = canonicalMap.get(sdc.id);
    if (canonical) {
      return {
        ...sdc,
        sdcCode: canonical.sdcCode,
        sdcName: canonical.sdcName,
        district: canonical.district,
        tpName: canonical.tpName,
        scheme: canonical.scheme,
        sector: canonical.sector,
        status: sdc.status || canonical.status,
        centerHead: sdc.centerHead !== undefined ? sdc.centerHead : canonical.centerHead,
        centerPhotos: hasPlaceholderPhotos(sdc) ? REAL_CENTER_PHOTOS : (sdc.centerPhotos || REAL_CENTER_PHOTOS)
      };
    }
    return hasPlaceholderPhotos(sdc) ? { ...sdc, centerPhotos: REAL_CENTER_PHOTOS } : sdc;
  });

  const existingIds = new Set(updated.map(p => p.id));
  return [...updated, ...seed.filter(s => !existingIds.has(s.id))];
}

/** The activity log of an SDC with one more entry (the log is kept oldest first). */
function withEntry(
  sdc: SdcRecord,
  action: SdcActivityEntry['action'],
  officer: DepartmentOfficer | undefined,
  text: string,
  capacity?: number
): SdcActivityEntry[] {
  const who = officer ?? departmentOfficer();
  const entry: SdcActivityEntry = {
    id: `sdc-act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    action,
    actor: who.name,
    designation: who.designation,
    at: new Date().toISOString(),
    text: text.trim(),
    ...(capacity !== undefined ? { capacity } : {})
  };
  return [...(sdc.activityLog ?? []), entry];
}

@Injectable({
  providedIn: 'root'
})
export class SdcService {
  private readonly store = createPersistedStore<SdcRecord>({
    key: 'isms_sdc_records',
    seed: INITIAL_SDC_RECORDS,
    reconcile: reconcileSdcs
  });

  /** Reactive list of all SDC records, restored from storage with seed fallback */
  private readonly _sdcs = this.store.items;

  readonly sdcs = this._sdcs.asReadonly();

  private persist(records?: SdcRecord[]): void {
    this.store.persist(records);
  }

  /** Stats computed across all SDCs */
  readonly stats = computed(() => {
    const list = this._sdcs();
    return {
      total: list.length,
      approved: list.filter(s => s.status === 'APPROVED').length,
      pendingInspection: list.filter(s => s.status === 'PENDING_INSPECTION').length,
      pendingApproval: list.filter(s => s.status === 'PENDING_APPROVAL').length,
      totalCapacity: list
        .filter(s => s.status === 'APPROVED')
        .reduce((sum, s) => sum + (s.approval?.approvedTargetCapacity || s.sdcCapacity), 0)
    };
  });

  /** Get SDC by ID */
  getSdcById(id: string): SdcRecord | undefined {
    return this._sdcs().find(s => s.id === id);
  }

  /**
   * Gives an approved SDC its Center Head. Only one Center Head can be assigned: returns false when the SDC is
   * not approved, already has one, or does not exist.
   */
  assignCenterHead(id: string, head: Omit<SdcCenterHead, 'assignedAt'>): boolean {
    const sdc = this.getSdcById(id);
    if (!sdc || sdc.status !== 'APPROVED' || sdc.centerHead) return false;
    this.updateSdc(id, { centerHead: { ...head, assignedAt: new Date().toISOString() } });
    return true;
  }

  /** Replaces the Center Head of an approved SDC with another person. Returns false when the SDC has none to replace. */
  changeCenterHead(id: string, head: Omit<SdcCenterHead, 'assignedAt'>): boolean {
    const sdc = this.getSdcById(id);
    if (!sdc || sdc.status !== 'APPROVED' || !sdc.centerHead) return false;
    this.updateSdc(id, { centerHead: { ...head, assignedAt: new Date().toISOString() } });
    return true;
  }

  /** Takes the Center Head off the SDC, so another can be assigned. */
  unassignCenterHead(id: string): boolean {
    const sdc = this.getSdcById(id);
    if (!sdc || !sdc.centerHead) return false;
    // null (not undefined) marks it as taken off on purpose, so the sample data does not bring it back.
    this.updateSdc(id, { centerHead: null });
    return true;
  }

  /** Saves the PSD paid for an SDC. It is taken once, with the first batch; returns false if it was already paid. */
  recordPsdPayment(id: string, payment: SdcPsdPayment): boolean {
    const sdc = this.getSdcById(id);
    if (!sdc || sdc.psdPayment) return false;
    this.updateSdc(id, { psdPayment: payment });
    return true;
  }

  /** Update an existing SDC record with edited creation details */
  updateSdc(id: string, updates: Partial<SdcRecord>): SdcRecord | undefined {
    let updatedRecord: SdcRecord | undefined;
    this._sdcs.update(list => {
      const updated = list.map(item => {
        if (item.id === id) {
          updatedRecord = { ...item, ...updates };
          return updatedRecord;
        }
        return item;
      });
      this.persist(updated);
      return updated;
    });
    return updatedRecord;
  }

  /**
   * STAGE 2: SDC Registration Form Submission
   * Creates a new SDC and immediately transitions to PENDING_INSPECTION
   */
  createSdc(formData: any): SdcRecord {
    const raw: any = formData || {};
    const s1 = raw.step1 || raw;
    const s2 = raw.step2 || raw;
    const s3 = raw.step3 || raw;
    const s4 = raw.step4 || raw;

    const nextNum = this._sdcs().length + 1;
    const generatedCode = s1.sdcCode || raw.sdcCode || `SDC-00${nextNum}`;
    const newId = `sdc-${Date.now()}`;

    const newRecord: SdcRecord = {
      id: newId,
      sdcCode: generatedCode,
      sdcName: s1.sdcName || formData.sdcName || 'Rajasthan Skill Development Center',
      scheme: (s1.scheme || formData.scheme || 'SAMARTH') as SdcRecord['scheme'],
      schemeCategory: raw.schemeCategory || s1.schemeCategory || (raw.scheme === 'SAMARTH' ? 'SAMARTH' : 'RAJKVIK'),
      sector: formData.sector || s1.sector || 'Aerospace and Aviation',
      tpName: s1.tpName || formData.tpName || 'SkillMasters Rajasthan Pvt Ltd',
      mouRefNo: s1.mouRefNo || formData.mouRefNo,
      proposedStartDate: s1.proposedStartDate || formData.proposedStartDate || new Date().toISOString().split('T')[0],
      totalTrainedAspirants: s1.totalTrainedAspirants ?? formData.totalTrainedAspirants ?? undefined,
      totalPlacedAspirants: s1.totalPlacedAspirants ?? formData.totalPlacedAspirants ?? undefined,
      hostelCategory: formData.hostelCategory || s1.hostelCategory,
      tpRecommendation: formData.tpRecommendation || s1.tpRecommendation,
      
      state: s2.state || formData.state || 'Rajasthan',
      district: s2.district || formData.district || 'Jaipur',
      assemblyConstituency: s2.assemblyConstituency || formData.assemblyConstituency,
      parliamentConstituency: s2.parliamentConstituency || formData.parliamentConstituency,
      division: s2.division || formData.division,
      block: s2.block || formData.block,
      sdcCapacity: Number(s2.sdcCapacity || formData.sdcCapacity) || 60,
      centerEmail: s2.centerEmail || formData.centerEmail || 'sdc.center@skillmasters.in',
      pincode: s2.pincode || formData.pincode || '302029',
      fullAddress: s2.fullAddress || formData.fullAddress || 'Rajasthan',
      latitude: Number(s2.latitude || formData.latitude) || 26.9124,
      longitude: Number(s2.longitude || formData.longitude) || 75.7873,
      remarks: s2.remarks || formData.remarks,

      uploadedDocument: formData.uploadedDocument || s3.uploadedDocument,
      centerPhotos: formData.centerPhotos || s3.centerPhotos || [],
      allocatedCourses: s3.allocatedCourses || formData.allocatedCourses || [],
      documents: s3.documents || formData.documents || {},
      declarationAccepted: s4.declarationAccepted ?? formData.declarationAccepted ?? true,

      // Initial transition to PENDING_INSPECTION
      status: 'PENDING_INSPECTION',
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      activeBatchesCount: 0,
      enrolledTraineesCount: 0
    };

    this._sdcs.update(list => {
      const updated = [newRecord, ...list];
      this.persist(updated);
      return updated;
    });
    return newRecord;
  }

  /**
   * STAGE 3: Submit Physical Inspection & GPS Auditor Match
   * Calculates Haversine distance in meters and verifies <= 100m threshold
   */
  submitInspection(id: string, inspection: Partial<SdcInspectionData>): void {
    const sdc = this.getSdcById(id);
    if (!sdc) return;

    const auditorLat = Number(inspection.auditorLatitude) || sdc.latitude;
    const auditorLng = Number(inspection.auditorLongitude) || sdc.longitude;

    const distanceMeters = this.calculateHaversineDistance(
      sdc.latitude,
      sdc.longitude,
      auditorLat,
      auditorLng
    );

    const geoMatched = distanceMeters <= 100;

    const completeInspection: SdcInspectionData = {
      auditorName: inspection.auditorName || 'Er. State Inspector',
      auditorPhone: inspection.auditorPhone || '+91 98290 00000',
      inspectionDate: inspection.inspectionDate || new Date().toISOString().split('T')[0],
      physicalExistenceVerified: inspection.physicalExistenceVerified ?? true,
      signboardVerified: inspection.signboardVerified ?? true,
      classroomsLabsVerified: inspection.classroomsLabsVerified ?? true,
      biometricAebasVerified: inspection.biometricAebasVerified ?? true,
      auditorLatitude: auditorLat,
      auditorLongitude: auditorLng,
      geoDistanceMeters: Math.round(distanceMeters),
      geoMatched,
      auditorRemarks: inspection.auditorRemarks || 'Auditor physical inspection report submitted.',
      recommendation: inspection.recommendation || 'RECOMMENDED'
    };

    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id
          ? {
              ...item,
              inspection: completeInspection,
              status: 'PENDING_APPROVAL' as SdcStatus
            }
          : item
      );
      this.persist(updated);
      return updated;
    });
  }

  /**
   * STAGE 4: Department Approval
   */
  approveSdc(id: string, targetCapacity: number, remarks: string, officer?: DepartmentOfficer): void {
    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id
          ? {
              ...item,
              status: 'APPROVED' as SdcStatus,
              approval: {
                approvedTargetCapacity: targetCapacity,
                approvalRemarks: remarks,
                approvedDate: new Date().toISOString().split('T')[0],
                approvedBy: 'Department, RSLDC'
              },
              activityLog: withEntry(item, 'APPROVED', officer, remarks, targetCapacity)
            }
          : item
      );
      this.persist(updated);
      return updated;
    });
  }

  /**
   * STAGE 4: Department Rejection
   */
  rejectSdc(id: string, remarks: string, officer?: DepartmentOfficer): void {
    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id
          ? {
              ...item,
              status: 'REJECTED' as SdcStatus,
              approval: {
                approvedTargetCapacity: 0,
                approvalRemarks: remarks,
                approvedDate: new Date().toISOString().split('T')[0],
                approvedBy: 'Department, RSLDC'
              },
              activityLog: withEntry(item, 'REJECTED', officer, remarks)
            }
          : item
      );
      this.persist(updated);
      return updated;
    });
  }

  /**
   * STAGE 4: Return to TP for corrections
   */
  returnToTp(id: string, remarks: string, officer?: DepartmentOfficer): void {
    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id
          ? {
              ...item,
              status: 'RETURNED_TO_TP' as SdcStatus,
              remarks: `Returned by Department: ${remarks}`,
              activityLog: withEntry(item, 'RETURNED', officer, remarks)
            }
          : item
      );
      this.persist(updated);
      return updated;
    });
  }

  /** A department officer adds a remark to an SDC. The decision stays as it is. Returns false when the SDC is not found. */
  addRemark(id: string, remark: string, officer?: DepartmentOfficer): boolean {
    const text = remark.trim();
    if (!text || !this.getSdcById(id)) return false;
    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id ? { ...item, activityLog: withEntry(item, 'REMARK_ADDED', officer, text) } : item
      );
      this.persist(updated);
      return updated;
    });
    return true;
  }

  /**
   * Increment active batches count for SDC upon new batch creation
   */
  incrementBatchesCount(id: string): void {
    this._sdcs.update(list => {
      const updated = list.map(item =>
        item.id === id
          ? { ...item, activeBatchesCount: (item.activeBatchesCount || 0) + 1 }
          : item
      );
      this.persist(updated);
      return updated;
    });
  }

  /**
   * Haversine formula to compute great-circle distance between two GPS coordinates in meters
   */
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}
