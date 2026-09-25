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

  /**
   * STAGE 2: SDC Registration Form Submission
   * Creates a new SDC and immediately transitions to PENDING_INSPECTION
   */
  createSdc(formData: SdcFormData): SdcRecord {
    const nextNum = this._sdcs().length + 1;
    const generatedCode = formData.step1.sdcCode || `SDC-00${nextNum}`;
    const newId = `sdc-${Date.now()}`;

    const newRecord: SdcRecord = {
      id: newId,
      sdcCode: generatedCode,
      sdcName: formData.step1.sdcName,
      scheme: (formData.step1.scheme as any) || 'MMKVY',
      tpName: formData.step1.tpName || 'SkillMasters Rajasthan Pvt Ltd',
      mouRefNo: formData.step1.mouRefNo,
      proposedStartDate: formData.step1.proposedStartDate,
      totalTrainedAspirants: formData.step1.totalTrainedAspirants || undefined,
      totalPlacedAspirants: formData.step1.totalPlacedAspirants || undefined,
      
      state: 'Rajasthan',
      district: formData.step2.district,
      assemblyConstituency: formData.step2.assemblyConstituency,
      parliamentConstituency: formData.step2.parliamentConstituency,
      division: formData.step2.division,
      block: formData.step2.block,
      sdcCapacity: Number(formData.step2.sdcCapacity) || 60,
      centerEmail: formData.step2.centerEmail,
      pincode: formData.step2.pincode,
      fullAddress: formData.step2.fullAddress,
      latitude: Number(formData.step2.latitude) || 26.9124,
      longitude: Number(formData.step2.longitude) || 75.7873,
      remarks: formData.step2.remarks,

      allocatedCourses: [...formData.step3.allocatedCourses],
      documents: { ...formData.step3.documents },
      declarationAccepted: formData.step4.declarationAccepted,

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
