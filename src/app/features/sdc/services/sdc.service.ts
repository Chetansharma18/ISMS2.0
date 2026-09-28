import { Injectable, signal, computed } from '@angular/core';
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
  /** Reactive list of all SDC records */
  private readonly _sdcs = signal<SdcRecord[]>([
    {
      id: 'sdc-101',
      sdcCode: 'SDC-0001',
      sdcName: 'Jaipur Skill Center',
      scheme: 'SAMARTH',
      schemeCategory: 'RAJKVIK',
      sector: 'Aerospace and Aviation',
      tpName: 'ARNOLD SAMARTH',
      mouRefNo: 'MOU/2026/001',
      proposedStartDate: '2026-10-01',
      totalTrainedAspirants: 500,
      totalPlacedAspirants: 400,
      state: 'Rajasthan',
      district: 'Jaipur District',
      assemblyConstituency: 'Sanganer',
      parliamentConstituency: 'Jaipur Rural',
      division: 'Jaipur Division',
      block: 'Jaipur',
      sdcCapacity: 120,
      centerEmail: 'sdc.jaipur@skillmasters.in',
      pincode: '302029',
      fullAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri, Jaipur, Rajasthan',
      latitude: 26.8524,
      longitude: 75.8073,
      remarks: 'Equipped with dedicated smart labs and biometrics',
      allocatedCourses: [
        {
          sector: 'IT & ITeS',
          courseName: 'Domestic Data Entry Operator',
          qpCode: 'SSC/Q2212',
          nsqfLevel: 4,
          durationHours: 400
        },
        {
          sector: 'Automotive & Electronics',
          courseName: 'Drone Operator',
          qpCode: 'AAS/Q6301',
          nsqfLevel: 4,
          durationHours: 430
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Lease_Agreement_Jaipur_Center.pdf', fileSize: '2.8 MB', uploadedAt: '2026-09-01' },
        fireNocDoc: { fileName: 'Fire_Safety_NOC_Jaipur.pdf', fileSize: '1.2 MB', uploadedAt: '2026-09-01' },
        signboardPhotoDoc: { fileName: 'Center_Front_Signboard.jpg', fileSize: '3.4 MB', uploadedAt: '2026-09-01' },
        layoutDiagramDoc: { fileName: 'Classroom_Lab_Blueprint.pdf', fileSize: '4.1 MB', uploadedAt: '2026-09-01' }
      },
      centerPhotos: [
        {
          id: 'p1',
          name: 'Center_Front_Building.jpg',
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"%3E%3Crect width="400" height="260" fill="%230b3558"/%3E%3Crect x="60" y="50" width="280" height="150" fill="%23174a6e" rx="6"/%3E%3Crect x="90" y="80" width="50" height="40" fill="%23ffffff" opacity="0.9" rx="3"/%3E%3Crect x="175" y="80" width="50" height="40" fill="%23ffffff" opacity="0.9" rx="3"/%3E%3Crect x="260" y="80" width="50" height="40" fill="%23ffffff" opacity="0.9" rx="3"/%3E%3Crect x="170" y="140" width="60" height="60" fill="%2338bdf8" rx="2"/%3E%3Ctext x="200" y="235" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3ECENTER FRONT VIEW &amp; SIGNBOARD%3C/text%3E%3C/svg%3E',
          size: '2.1 MB',
          tag: 'Photo 1'
        },
        {
          id: 'p2',
          name: 'IT_Computer_Lab.jpg',
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"%3E%3Crect width="400" height="260" fill="%230483ac"/%3E%3Crect x="70" y="60" width="70" height="45" rx="4" fill="%230b3558" stroke="%23ffffff" stroke-width="2"/%3E%3Crect x="165" y="60" width="70" height="45" rx="4" fill="%230b3558" stroke="%23ffffff" stroke-width="2"/%3E%3Crect x="260" y="60" width="70" height="45" rx="4" fill="%230b3558" stroke="%23ffffff" stroke-width="2"/%3E%3Cline x1="50" y1="130" x2="350" y2="130" stroke="%23ffffff" stroke-width="3"/%3E%3Ctext x="200" y="235" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3ECOMPUTER LAB &amp; IT FACILITY%3C/text%3E%3C/svg%3E',
          size: '2.8 MB',
          tag: 'Photo 2'
        },
        {
          id: 'p3',
          name: 'Practical_Training_Classroom.jpg',
          url: 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"%3E%3Crect width="400" height="260" fill="%231e3a5f"/%3E%3Crect x="60" y="45" width="280" height="80" rx="4" fill="%230b3558" stroke="%2338bdf8" stroke-width="2"/%3E%3Ctext x="200" y="85" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="11"%3ESMART CLASSROOM BENCHES%3C/text%3E%3Ctext x="200" y="235" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-family="sans-serif" font-size="13" font-weight="bold"%3EPRACTICAL CLASSROOM%3C/text%3E%3C/svg%3E',
          size: '3.1 MB',
          tag: 'Photo 3'
        }
      ],
      declarationAccepted: true,
      status: 'APPROVED',
      createdAt: '2026-09-01T10:00:00.000Z',
      submittedAt: '2026-09-02T14:30:00.000Z',
      inspection: {
        auditorName: 'Er. Rajesh Verma',
        auditorPhone: '+91 98290 11223',
        inspectionDate: '2026-09-10',
        physicalExistenceVerified: true,
        signboardVerified: true,
        classroomsLabsVerified: true,
        biometricAebasVerified: true,
        auditorLatitude: 26.8526,
        auditorLongitude: 75.8075,
        geoDistanceMeters: 28,
        geoMatched: true,
        auditorRemarks: 'Center infrastructure complies with RSLDC guidelines. Biometric AEBAS is functional.',
        recommendation: 'RECOMMENDED'
      },
      approval: {
        approvedTargetCapacity: 120,
        approvalRemarks: 'Approved with full capacity allocation for MMKVY courses.',
        approvedDate: '2026-09-15',
        approvedBy: 'Joint Director (Apprenticeship & Skilling), RSLDC'
      },
      activeBatchesCount: 2,
      enrolledTraineesCount: 54
    },
    {
      id: 'sdc-102',
      sdcCode: 'SDC-0002',
      sdcName: 'Ajmer Training Inst.',
      scheme: 'SAMARTH',
      schemeCategory: 'SAMARTH',
      sector: 'Green Jobs',
      tpName: 'ARNOLD SAMARTH',
      mouRefNo: 'MOU/2026/002',
      proposedStartDate: '2026-11-01',
      totalTrainedAspirants: 320,
      totalPlacedAspirants: 260,
      state: 'Rajasthan',
      district: 'Ajmer District',
      assemblyConstituency: 'Sardarshahar',
      parliamentConstituency: 'Jodhpur',
      division: 'Jodhpur Division',
      block: 'Mandore',
      sdcCapacity: 90,
      centerEmail: 'sdc.jodhpur@skillmasters.in',
      pincode: '342001',
      fullAddress: 'Mandore Industrial Area, Near RIICO Phase II, Jodhpur, Rajasthan',
      latitude: 26.3424,
      longitude: 73.0473,
      remarks: 'Solar PV rooftop installation lab available',
      allocatedCourses: [
        {
          sector: 'Green Energy',
          courseName: 'Solar Panel Installation Tech',
          qpCode: 'ELE/Q5901',
          nsqfLevel: 4,
          durationHours: 300
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Property_Ownership_Deed_Jodhpur.pdf', fileSize: '3.1 MB', uploadedAt: '2026-09-12' },
        fireNocDoc: { fileName: 'Fire_NOC_Jodhpur_2026.pdf', fileSize: '980 KB', uploadedAt: '2026-09-12' },
        signboardPhotoDoc: { fileName: 'Signboard_Mandore.jpg', fileSize: '2.5 MB', uploadedAt: '2026-09-12' },
        layoutDiagramDoc: { fileName: 'Lab_Layout_Diagram.pdf', fileSize: '1.9 MB', uploadedAt: '2026-09-12' }
      },
      declarationAccepted: true,
      status: 'PENDING_INSPECTION',
      createdAt: '2026-09-12T11:20:00.000Z',
      submittedAt: '2026-09-12T16:00:00.000Z',
      activeBatchesCount: 0,
      enrolledTraineesCount: 0
    },
    {
      id: 'sdc-103',
      sdcCode: 'SDC-003',
      sdcName: 'Kota Precision Engineering & IT Hub',
      scheme: 'RAJKViK',
      schemeCategory: 'RAJKVIK',
      sector: 'Capital Goods',
      tpName: 'SkillMasters Rajasthan Pvt Ltd',
      mouRefNo: 'MOU/2026/003',
      proposedStartDate: '2026-11-15',
      totalTrainedAspirants: 450,
      totalPlacedAspirants: 380,
      state: 'Rajasthan',
      district: 'Kota',
      assemblyConstituency: 'Kota South',
      parliamentConstituency: 'Kota',
      division: 'Kota Division',
      block: 'Ladpura',
      sdcCapacity: 100,
      centerEmail: 'sdc.kota@skillmasters.in',
      pincode: '324005',
      fullAddress: 'Plot 18, Road No. 2, Indraprastha Industrial Area, Kota, Rajasthan',
      latitude: 25.1324,
      longitude: 75.8473,
      remarks: 'CNC machine installed with 3-phase power backup',
      allocatedCourses: [
        {
          sector: 'Capital Goods',
          courseName: 'CNC Milling',
          qpCode: 'CSC/Q0417',
          nsqfLevel: 4,
          durationHours: 670
        },
        {
          sector: 'Construction',
          courseName: 'Assistant Electrician',
          qpCode: 'CON/Q0602',
          nsqfLevel: 3,
          durationHours: 460
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Kota_Industrial_Lease.pdf', fileSize: '2.4 MB', uploadedAt: '2026-09-14' },
        fireNocDoc: { fileName: 'Kota_Fire_Dept_NOC.pdf', fileSize: '1.5 MB', uploadedAt: '2026-09-14' },
        signboardPhotoDoc: { fileName: 'Kota_Center_Photo.jpg', fileSize: '4.2 MB', uploadedAt: '2026-09-14' },
        layoutDiagramDoc: { fileName: 'Kota_Floor_Plan.pdf', fileSize: '3.0 MB', uploadedAt: '2026-09-14' }
      },
      declarationAccepted: true,
      status: 'PENDING_APPROVAL',
      createdAt: '2026-09-14T09:15:00.000Z',
      submittedAt: '2026-09-14T12:00:00.000Z',
      inspection: {
        auditorName: 'Smt. Anjali Sharma (RSLDC Inspector)',
        auditorPhone: '+91 94140 55443',
        inspectionDate: '2026-09-20',
        physicalExistenceVerified: true,
        signboardVerified: true,
        classroomsLabsVerified: true,
        biometricAebasVerified: true,
        auditorLatitude: 25.1326,
        auditorLongitude: 75.8475,
        geoDistanceMeters: 31,
        geoMatched: true,
        auditorRemarks: 'Physical labs and CNC machine verified. Location matches GPS within 31 meters.',
        recommendation: 'RECOMMENDED'
      },
      activeBatchesCount: 0,
      enrolledTraineesCount: 0
    }
  ]);

  readonly sdcs = this._sdcs.asReadonly();

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
    this._sdcs.update(list =>
      list.map(item => {
        if (item.id === id) {
          updatedRecord = { ...item, ...updates };
          return updatedRecord;
        }
        return item;
      })
    );
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

    this._sdcs.update(list => [newRecord, ...list]);
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

    this._sdcs.update(list =>
      list.map(item =>
        item.id === id
          ? {
              ...item,
              inspection: completeInspection,
              status: 'PENDING_APPROVAL'
            }
          : item
      )
    );
  }

  /**
   * STAGE 4: Department Approval
   */
  approveSdc(id: string, targetCapacity: number, remarks: string): void {
    this._sdcs.update(list =>
      list.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'APPROVED',
              approval: {
                approvedTargetCapacity: targetCapacity,
                approvalRemarks: remarks,
                approvedDate: new Date().toISOString().split('T')[0],
                approvedBy: 'Department Approval Authority, RSLDC'
              }
            }
          : item
      )
    );
  }

  /**
   * STAGE 4: Department Rejection
   */
  rejectSdc(id: string, remarks: string): void {
    this._sdcs.update(list =>
      list.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'REJECTED',
              approval: {
                approvedTargetCapacity: 0,
                approvalRemarks: remarks,
                approvedDate: new Date().toISOString().split('T')[0],
                approvedBy: 'Department Approval Authority, RSLDC'
              }
            }
          : item
      )
    );
  }

  /**
   * STAGE 4: Return to TP for corrections
   */
  returnToTp(id: string, remarks: string): void {
    this._sdcs.update(list =>
      list.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'RETURNED_TO_TP',
              remarks: `Returned by Department: ${remarks}`
            }
          : item
      )
    );
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
