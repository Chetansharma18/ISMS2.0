import { Injectable, signal, computed } from '@angular/core';
import {
  SdcRecord,
  SdcFormData,
  SdcInspectionData,
  SdcStatus,
  SCHEME_COURSE_CATALOG
} from '../models/sdc.model';

export const INITIAL_SDC_RECORDS: SdcRecord[] = [
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
          url: '/center-photos/center-building.jpg',
          size: '2.4 MB',
          tag: 'Photo 1'
        },
        {
          id: 'p2',
          name: 'IT_Computer_Lab.jpg',
          url: '/center-photos/computer-lab.jpg',
          size: '2.8 MB',
          tag: 'Photo 2'
        },
        {
          id: 'p3',
          name: 'Practical_Training_Classroom.jpg',
          url: '/center-photos/practical-training.jpg',
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
    },
    {
      id: 'sdc-104',
      sdcCode: 'SDC-0004',
      sdcName: 'Jodhpur Renewable & Green Skills Hub',
      scheme: 'MMKVY',
      schemeCategory: 'SAMARTH',
      sector: 'Green Jobs',
      tpName: 'Apex Vocational Solutions',
      mouRefNo: 'MOU/2026/004',
      proposedStartDate: '2026-11-20',
      totalTrainedAspirants: 620,
      totalPlacedAspirants: 510,
      state: 'Rajasthan',
      district: 'Jodhpur',
      assemblyConstituency: 'Sardarpura',
      parliamentConstituency: 'Jodhpur',
      division: 'Jodhpur',
      block: 'Mandor',
      sdcCapacity: 150,
      centerEmail: 'jodhpur@apexvocational.com',
      pincode: '342003',
      fullAddress: 'Industrial Estate, Heavy Industrial Area, Jodhpur, Rajasthan',
      latitude: 26.2734,
      longitude: 73.0125,
      hostelCategory: 'Residential (Both Boys & Girls)',
      remarks: 'Equipped with solar array training laboratory and smart audio-visual aids',
      allocatedCourses: [
        {
          sector: 'Green Energy',
          courseName: 'Solar PV Site Surveyor',
          qpCode: 'SGJ/Q0101',
          nsqfLevel: 4,
          durationHours: 350
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Apex_Jodhpur_Lease.pdf', fileSize: '2.9 MB', uploadedAt: '2026-09-18' },
        fireNocDoc: { fileName: 'Apex_Fire_Certificate.pdf', fileSize: '1.1 MB', uploadedAt: '2026-09-18' },
        signboardPhotoDoc: { fileName: 'Apex_Front_Signboard.jpg', fileSize: '3.6 MB', uploadedAt: '2026-09-18' },
        layoutDiagramDoc: { fileName: 'Apex_Lab_Floor_Plan.pdf', fileSize: '2.7 MB', uploadedAt: '2026-09-18' }
      },
      declarationAccepted: true,
      status: 'PENDING_APPROVAL',
      createdAt: '2026-09-18T08:30:00.000Z',
      submittedAt: '2026-09-18T11:00:00.000Z',
      inspection: {
        auditorName: 'Shri Vikram Singh (RSLDC Inspection Officer)',
        auditorPhone: '+91 94141 88990',
        inspectionDate: '2026-09-22',
        physicalExistenceVerified: true,
        signboardVerified: true,
        classroomsLabsVerified: true,
        biometricAebasVerified: true,
        auditorLatitude: 26.2736,
        auditorLongitude: 73.0127,
        geoDistanceMeters: 26,
        geoMatched: true,
        auditorRemarks: 'Full verification completed. Training facility ready for candidate onboarding.',
        recommendation: 'RECOMMENDED'
      },
      activeBatchesCount: 0,
      enrolledTraineesCount: 0
    },
    {
      id: 'sdc-105',
      sdcCode: 'SDC-0005',
      sdcName: 'Udaipur Aviation & Hospitality Institute',
      scheme: 'SAMARTH',
      schemeCategory: 'RAJKVIK',
      sector: 'Aerospace and Aviation',
      tpName: 'Marwar Livelihoods Foundation',
      mouRefNo: 'MOU/2026/005',
      proposedStartDate: '2026-12-01',
      totalTrainedAspirants: 280,
      totalPlacedAspirants: 230,
      state: 'Rajasthan',
      district: 'Udaipur',
      assemblyConstituency: 'Udaipur',
      parliamentConstituency: 'Udaipur',
      division: 'Udaipur',
      block: 'Girwa',
      sdcCapacity: 90,
      centerEmail: 'udaipur.center@marwarlivelihoods.org',
      pincode: '313001',
      fullAddress: 'Sector 14, Hiran Magri, Udaipur, Rajasthan',
      latitude: 24.5854,
      longitude: 73.7125,
      hostelCategory: 'Residential (Girls Only)',
      remarks: 'Mock aircraft cabin and passenger terminal setup installed',
      allocatedCourses: [
        {
          sector: 'Aerospace and Aviation',
          courseName: 'Airline Customer Service Executive',
          qpCode: 'AAS/Q0301',
          nsqfLevel: 4,
          durationHours: 360
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Marwar_Udaipur_Rent_Deed.pdf', fileSize: '1.8 MB', uploadedAt: '2026-09-20' },
        fireNocDoc: { fileName: 'Udaipur_Fire_NOC.pdf', fileSize: '850 KB', uploadedAt: '2026-09-20' },
        signboardPhotoDoc: { fileName: 'Center_Signboard_Udaipur.jpg', fileSize: '2.1 MB', uploadedAt: '2026-09-20' },
        layoutDiagramDoc: { fileName: 'Udaipur_Campus_Layout.pdf', fileSize: '3.4 MB', uploadedAt: '2026-09-20' }
      },
      declarationAccepted: true,
      status: 'PENDING_INSPECTION',
      createdAt: '2026-09-20T10:00:00.000Z',
      submittedAt: '2026-09-20T14:45:00.000Z',
      activeBatchesCount: 0,
      enrolledTraineesCount: 0
    },
    {
      id: 'sdc-106',
      sdcCode: 'SDC-0006',
      sdcName: 'Bikaner Automotive & Capital Goods Center',
      scheme: 'RAJKViK',
      schemeCategory: 'RAJKVIK',
      sector: 'Automotive',
      tpName: 'Apex Vocational Solutions',
      mouRefNo: 'MOU/2026/006',
      proposedStartDate: '2026-10-15',
      totalTrainedAspirants: 400,
      totalPlacedAspirants: 340,
      state: 'Rajasthan',
      district: 'Bikaner',
      assemblyConstituency: 'Bikaner West',
      parliamentConstituency: 'Bikaner',
      division: 'Bikaner',
      block: 'Bikaner',
      sdcCapacity: 100,
      centerEmail: 'bikaner@apexvocational.com',
      pincode: '334001',
      fullAddress: 'Plot 55, Karni Industrial Area, Bikaner, Rajasthan',
      latitude: 28.0229,
      longitude: 73.3119,
      hostelCategory: 'Residential (Boys Only)',
      remarks: 'Multi-brand diagnostic testing bay and modern hydraulic lifts',
      allocatedCourses: [
        {
          sector: 'Automotive',
          courseName: 'Four Wheeler Service Technician',
          qpCode: 'ASC/Q1402',
          nsqfLevel: 4,
          durationHours: 450
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Bikaner_Karni_Lease.pdf', fileSize: '3.3 MB', uploadedAt: '2026-09-05' },
        fireNocDoc: { fileName: 'Bikaner_Fire_NOC.pdf', fileSize: '1.4 MB', uploadedAt: '2026-09-05' },
        signboardPhotoDoc: { fileName: 'Bikaner_Center_Front.jpg', fileSize: '4.0 MB', uploadedAt: '2026-09-05' },
        layoutDiagramDoc: { fileName: 'Bikaner_Workshop_Blueprint.pdf', fileSize: '2.5 MB', uploadedAt: '2026-09-05' }
      },
      declarationAccepted: true,
      status: 'APPROVED',
      createdAt: '2026-09-05T09:00:00.000Z',
      submittedAt: '2026-09-05T12:30:00.000Z',
      inspection: {
        auditorName: 'Er. Mahendra Rathore',
        auditorPhone: '+91 94142 33221',
        inspectionDate: '2026-09-12',
        physicalExistenceVerified: true,
        signboardVerified: true,
        classroomsLabsVerified: true,
        biometricAebasVerified: true,
        auditorLatitude: 28.0231,
        auditorLongitude: 73.3121,
        geoDistanceMeters: 30,
        geoMatched: true,
        auditorRemarks: 'Workshop tools and safety measures fully compliant with NSQF standards.',
        recommendation: 'RECOMMENDED'
      },
      approval: {
        approvedTargetCapacity: 100,
        approvalRemarks: 'Approved for full capacity batch mobilization.',
        approvedDate: '2026-09-18',
        approvedBy: 'Director (Training Operations), RSLDC'
      },
      activeBatchesCount: 1,
      enrolledTraineesCount: 30
    }
];

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
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed: SdcRecord[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Replace any old SVG placeholders with real center photos
            const realPhotos = [
              { id: 'p1', name: 'Center_Front_Building.jpg', url: '/center-photos/center-building.jpg', size: '2.4 MB', tag: 'Photo 1' },
              { id: 'p2', name: 'IT_Computer_Lab.jpg', url: '/center-photos/computer-lab.jpg', size: '2.8 MB', tag: 'Photo 2' },
              { id: 'p3', name: 'Practical_Training_Classroom.jpg', url: '/center-photos/practical-training.jpg', size: '3.1 MB', tag: 'Photo 3' }
            ];
            const updated = parsed.map(sdc => {
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
