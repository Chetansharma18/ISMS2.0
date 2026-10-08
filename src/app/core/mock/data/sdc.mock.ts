import { SdcRecord } from '../../../features/sdc/models/sdc.model';
import { resolveMock } from '../mock.config';
export interface MockSdcItem {
  id: string;
  centreCode: string;
  centreName: string;
  district: string;
  block: string;
  tpName: string;
  tpCode: string;
  scheme: string;
  capacity: number;
  classrooms: number;
  labs: number;
  status: 'Accredited' | 'Pending Inspection' | 'Suspended';
  contactPerson: string;
  contactNumber: string;
  address: string;
}

export const MOCK_SDC_CENTRES: MockSdcItem[] = resolveMock([
  {
    id: 'sdc-1',
    centreCode: 'SDC-JPR-001',
    centreName: 'Jaipur Skill Development Centre - Vidhyadhar Nagar',
    district: 'Jaipur',
    block: 'Jhotwara',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    tpCode: 'TP-RJ-2026-081',
    scheme: 'MMKVY',
    capacity: 240,
    classrooms: 4,
    labs: 2,
    status: 'Accredited',
    contactPerson: 'Rajesh Sharma',
    contactNumber: '9829012345',
    address: 'Plot 45, Sector 2, Vidhyadhar Nagar, Jaipur, Rajasthan 302039'
  },
  {
    id: 'sdc-2',
    centreCode: 'SDC-JOD-002',
    centreName: 'Marwar Kaushal Kendra - Mandore',
    district: 'Jodhpur',
    block: 'Mandore',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    tpCode: 'TP-RJ-2026-081',
    scheme: 'MMKVY',
    capacity: 180,
    classrooms: 3,
    labs: 2,
    status: 'Accredited',
    contactPerson: 'Sunil Rathore',
    contactNumber: '9829023456',
    address: 'Near Old Bus Stand, Mandore Road, Jodhpur, Rajasthan 342007'
  },
  {
    id: 'sdc-3',
    centreCode: 'SDC-KTA-003',
    centreName: 'Hadoti Technical Training Centre - Vigyan Nagar',
    district: 'Kota',
    block: 'Ladpura',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    tpCode: 'TP-RJ-2026-081',
    scheme: 'RAJKVIK',
    capacity: 150,
    classrooms: 3,
    labs: 1,
    status: 'Pending Inspection',
    contactPerson: 'Amit Meena',
    contactNumber: '9829034567',
    address: 'Industrial Area Phase 1, Vigyan Nagar, Kota, Rajasthan 324005'
  },
  {
    id: 'sdc-4',
    centreCode: 'SDC-UDR-004',
    centreName: 'Mewar Rural Livelihoods Centre',
    district: 'Udaipur',
    block: 'Girwa',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    tpCode: 'TP-RJ-2026-081',
    scheme: 'MMKVY',
    capacity: 200,
    classrooms: 4,
    labs: 2,
    status: 'Accredited',
    contactPerson: 'Priyanka Sen',
    contactNumber: '9829045678',
    address: 'Sub City Centre, Savina, Udaipur, Rajasthan 313002'
  }
]);


export const INITIAL_SDC_RECORDS: SdcRecord[] = resolveMock([
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
      sdcName: 'Jodhpur Commerce & Retail Academy',
      scheme: 'MMKVY',
      schemeCategory: 'SAMARTH',
      sector: 'Retail',
      tpName: 'Company 1',
      mouRefNo: 'MOU/2026/002',
      proposedStartDate: '2026-11-01',
      totalTrainedAspirants: 320,
      totalPlacedAspirants: 260,
      state: 'Rajasthan',
      district: 'Jodhpur',
      assemblyConstituency: 'Sardarpura',
      parliamentConstituency: 'Jodhpur',
      division: 'Jodhpur Division',
      block: 'Mandore',
      sdcCapacity: 90,
      centerEmail: 'sdc.jodhpur@company1.in',
      pincode: '342001',
      fullAddress: 'Mandore Industrial Area, Near RIICO Phase II, Jodhpur, Rajasthan',
      latitude: 26.3424,
      longitude: 73.0473,
      remarks: 'Modern retail mockup store and POS lab available',
      allocatedCourses: [
        {
          sector: 'Retail',
          courseName: 'Retail Sales Associate',
          qpCode: 'RAS/Q0104',
          nsqfLevel: 4,
          durationHours: 280
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Property_Ownership_Deed_Jodhpur.pdf', fileSize: '3.1 MB', uploadedAt: '2026-09-12' },
        fireNocDoc: { fileName: 'Fire_NOC_Jodhpur_2026.pdf', fileSize: '980 KB', uploadedAt: '2026-09-12' },
        signboardPhotoDoc: { fileName: 'Signboard_Mandore.jpg', fileSize: '2.5 MB', uploadedAt: '2026-09-12' },
        layoutDiagramDoc: { fileName: 'Lab_Layout_Diagram.pdf', fileSize: '1.9 MB', uploadedAt: '2026-09-12' }
      },
      declarationAccepted: true,
      status: 'APPROVED',
      createdAt: '2026-09-12T11:20:00.000Z',
      submittedAt: '2026-09-12T16:00:00.000Z',
      inspection: {
        auditorName: 'Smt. Kavita Gehlot',
        auditorPhone: '+91 94140 77889',
        inspectionDate: '2026-09-18',
        physicalExistenceVerified: true,
        signboardVerified: true,
        classroomsLabsVerified: true,
        biometricAebasVerified: true,
        auditorLatitude: 26.3426,
        auditorLongitude: 73.0475,
        geoDistanceMeters: 22,
        geoMatched: true,
        auditorRemarks: 'Center verified for retail training programs.',
        recommendation: 'RECOMMENDED'
      },
      approval: {
        approvedTargetCapacity: 90,
        approvalRemarks: 'Approved for MMKVY retail sector training.',
        approvedDate: '2026-09-20',
        approvedBy: 'Director (Operations), RSLDC'
      },
      activeBatchesCount: 1,
      enrolledTraineesCount: 0
    },
    {
      id: 'sdc-103',
      sdcCode: 'SDC-0003',
      sdcName: 'Kota Technical Training Center',
      scheme: 'SAMARTH',
      schemeCategory: 'SAMARTH',
      sector: 'Automotive',
      tpName: 'TechSkill India',
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
      centerEmail: 'sdc.kota@techskillindia.in',
      pincode: '324005',
      fullAddress: 'Plot 18, Road No. 2, Indraprastha Industrial Area, Kota, Rajasthan',
      latitude: 25.1324,
      longitude: 75.8473,
      remarks: 'EV workshop setup installed with diagnostic equipment',
      allocatedCourses: [
        {
          sector: 'Automotive',
          courseName: 'Electric Vehicle Service Technician',
          qpCode: 'ASC/Q1424',
          nsqfLevel: 4,
          durationHours: 350
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'Kota_Industrial_Lease.pdf', fileSize: '2.4 MB', uploadedAt: '2026-09-14' },
        fireNocDoc: { fileName: 'Kota_Fire_Dept_NOC.pdf', fileSize: '1.5 MB', uploadedAt: '2026-09-14' },
        signboardPhotoDoc: { fileName: 'Kota_Center_Photo.jpg', fileSize: '4.2 MB', uploadedAt: '2026-09-14' },
        layoutDiagramDoc: { fileName: 'Kota_Floor_Plan.pdf', fileSize: '3.0 MB', uploadedAt: '2026-09-14' }
      },
      declarationAccepted: true,
      status: 'APPROVED',
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
        auditorRemarks: 'Physical labs and automotive equipment verified. Location matches GPS within 31 meters.',
        recommendation: 'RECOMMENDED'
      },
      approval: {
        approvedTargetCapacity: 100,
        approvalRemarks: 'Approved for SAMARTH EV training.',
        approvedDate: '2026-09-22',
        approvedBy: 'Joint Director, RSLDC'
      },
      activeBatchesCount: 1,
      enrolledTraineesCount: 0
    },
    {
      id: 'sdc-104',
      sdcCode: 'SDC-0004',
      sdcName: 'Udaipur Healthcare Institute',
      scheme: 'MMKVY',
      schemeCategory: 'RAJKVIK',
      sector: 'Healthcare',
      tpName: 'CareFirst Foundation',
      mouRefNo: 'MOU/2026/004',
      proposedStartDate: '2026-11-20',
      totalTrainedAspirants: 620,
      totalPlacedAspirants: 510,
      state: 'Rajasthan',
      district: 'Udaipur',
      assemblyConstituency: 'Udaipur Rural',
      parliamentConstituency: 'Udaipur',
      division: 'Udaipur',
      block: 'Girwa',
      sdcCapacity: 150,
      centerEmail: 'sdc.udaipur@carefirst.org',
      pincode: '313002',
      fullAddress: 'Plot 22, Sector 5, Hiran Magri, Udaipur, Rajasthan',
      latitude: 24.5854,
      longitude: 73.7125,
      hostelCategory: 'Residential (Both Boys & Girls)',
      remarks: 'Simulated hospital ward setup with nursing demo manikins',
      allocatedCourses: [
        {
          sector: 'Healthcare',
          courseName: 'General Duty Assistant (GDA)',
          qpCode: 'HSS/Q5101',
          nsqfLevel: 4,
          durationHours: 360
        }
      ],
      documents: {
        rentalAgreementDoc: { fileName: 'CareFirst_Udaipur_Lease.pdf', fileSize: '2.9 MB', uploadedAt: '2026-09-18' },
        fireNocDoc: { fileName: 'CareFirst_Fire_Certificate.pdf', fileSize: '1.1 MB', uploadedAt: '2026-09-18' },
        signboardPhotoDoc: { fileName: 'CareFirst_Front_Signboard.jpg', fileSize: '3.6 MB', uploadedAt: '2026-09-18' },
        layoutDiagramDoc: { fileName: 'CareFirst_Lab_Floor_Plan.pdf', fileSize: '2.7 MB', uploadedAt: '2026-09-18' }
      },
      declarationAccepted: true,
      status: 'APPROVED',
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
        auditorLatitude: 24.5856,
        auditorLongitude: 73.7127,
        geoDistanceMeters: 26,
        geoMatched: true,
        auditorRemarks: 'Healthcare practical lab verified and AEBAS active.',
        recommendation: 'RECOMMENDED'
      },
      approval: {
        approvedTargetCapacity: 150,
        approvalRemarks: 'Approved for Healthcare GDA program.',
        approvedDate: '2026-09-24',
        approvedBy: 'Director (Operations), RSLDC'
      },
      activeBatchesCount: 1,
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
      tpName: 'Company 1',
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
      centerEmail: 'bikaner@company1.com',
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
      activeBatchesCount: 2,
      enrolledTraineesCount: 2
    }
]);