import { INITIAL_SDC_RECORDS } from '../../../core/mock/data/sdc.mock';
import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  SdcRecord,
  SdcFormData,
  SdcInspectionData,
  SdcStatus,
  SCHEME_COURSE_CATALOG
} from '../models/sdc.model';



@Injectable({
  providedIn: 'root'
})
export class SdcService {
  private readonly STORAGE_KEY = 'isms_sdc_records';

  /** Reactive list of all SDC records initialized from localStorage with seed fallback */
  private readonly _sdcs = signal<SdcRecord[]>(this.loadInitialRecords());

  readonly sdcs = this._sdcs.asReadonly();

  constructor() {
    // Cross-tab and window storage synchronization
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (!environment.useMockData) return;
        if (event.key === this.STORAGE_KEY && event.newValue) {
          try {
            const records: SdcRecord[] = JSON.parse(event.newValue);
            if (Array.isArray(records) && records.length > 0) {
              this._sdcs.set(records);
            }
          } catch { }
        }
      });
    }
  }

  private loadInitialRecords(): SdcRecord[] {
    if (!environment.useMockData) {
      return [];
    }
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed: SdcRecord[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const realPhotos = [
              { id: 'p1', name: 'Center_Front_Building.jpg', url: '/center-photos/center-building.jpg', size: '2.4 MB', tag: 'Photo 1' },
              { id: 'p2', name: 'IT_Computer_Lab.jpg', url: '/center-photos/computer-lab.jpg', size: '2.8 MB', tag: 'Photo 2' },
              { id: 'p3', name: 'Practical_Training_Classroom.jpg', url: '/center-photos/practical-training.jpg', size: '3.1 MB', tag: 'Photo 3' }
            ];

            // Canonical mapping to sanitize stale localStorage items
            const canonicalMap = new Map(INITIAL_SDC_RECORDS.map(s => [s.id, s]));

            const updated = parsed.map(sdc => {
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
                  centerPhotos: (sdc.centerPhotos && sdc.centerPhotos.some(p => p.url && p.url.startsWith('data:image/svg+xml')))
                    ? realPhotos
                    : (sdc.centerPhotos || realPhotos)
                };
              }
              if (sdc.centerPhotos && sdc.centerPhotos.some(p => p.url && p.url.startsWith('data:image/svg+xml'))) {
                return { ...sdc, centerPhotos: realPhotos };
              }
              return sdc;
            });

            // Keep user updates, but if any seed records are missing, append them
            const existingIds = new Set(updated.map(p => p.id));
            const missing = INITIAL_SDC_RECORDS.filter(s => !existingIds.has(s.id));
            const merged = [...updated, ...missing];
            this.persist(merged);
            return merged;
          }
        }
      } catch (e) {
        console.error('Failed to load SDC records from localStorage', e);
      }
    }
    this.persist(INITIAL_SDC_RECORDS);
    return INITIAL_SDC_RECORDS;
  }

  private persist(records?: SdcRecord[]): void {
    if (!environment.useMockData) {
      return;
    }
    const list = records || this._sdcs();
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Failed to persist SDC records to localStorage', e);
      }
    }
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
      scheme: (s1.scheme || formData.scheme || 'SAMARTH') as any,
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
  approveSdc(id: string, targetCapacity: number, remarks: string): void {
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
                approvedBy: 'Department Approval Authority, RSLDC'
              }
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
  rejectSdc(id: string, remarks: string): void {
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
                approvedBy: 'Department Approval Authority, RSLDC'
              }
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
  returnToTp(id: string, remarks: string): void {
    this._sdcs.update(list => {
      const updated: SdcRecord[] = list.map((item): SdcRecord =>
        item.id === id
          ? {
              ...item,
              status: 'RETURNED_TO_TP' as SdcStatus,
              remarks: `Returned by Department: ${remarks}`
            }
          : item
      );
      this.persist(updated);
      return updated;
    });
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
