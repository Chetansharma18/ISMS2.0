export type SdcStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING_INSPECTION'
  | 'INSPECTION_COMPLETED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED_TO_TP';

export type SdcScheme =
  | 'SAMARTH'
  | 'MMKVY'
  | 'PMKVY'
  | 'RAJKViK'
  | 'MNSKSY'
  | 'ELSTP';

export interface SdcCourseCatalogItem {
  scheme: SdcScheme;
  sector: string;
  courseName: string;
  qpCode: string;
  nsqfLevel: number;
  durationHours: number;
}

export interface AllocatedCourse {
  sector: string;
  courseName: string;
  qpCode: string;
  nsqfLevel: number;
  durationHours: number;
}

export interface SdcDocumentItem {
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface SdcDocuments {
  rentalAgreementDoc?: SdcDocumentItem;
  fireNocDoc?: SdcDocumentItem;
  signboardPhotoDoc?: SdcDocumentItem;
  layoutDiagramDoc?: SdcDocumentItem;
}

export interface SdcStep1Data {
  scheme: SdcScheme | '';
  sdcName: string;
  mouRefNo: string;
  tpName: string;
  sdcCode: string;
  proposedStartDate: string;
  totalTrainedAspirants?: number | null;
  totalPlacedAspirants?: number | null;
}

export interface SdcStep2Data {
  state: string; // Fixed 'Rajasthan'
  district: string;
  assemblyConstituency?: string;
  parliamentConstituency?: string;
  division?: string;
  block?: string;
  sdcCapacity: number | null;
  centerEmail: string;
  pincode: string;
  fullAddress: string;
  latitude: number | null;
  longitude: number | null;
  remarks?: string;
}

export interface SdcStep3Data {
  allocatedCourses: AllocatedCourse[];
  documents: SdcDocuments;
}

export interface SdcStep4Data {
  declarationAccepted: boolean;
}

export interface SdcFormData {
  step1: SdcStep1Data;
  step2: SdcStep2Data;
  step3: SdcStep3Data;
  step4: SdcStep4Data;
}

export interface SdcInspectionData {
  auditorName: string;
  auditorPhone: string;
  inspectionDate: string;
  physicalExistenceVerified: boolean;
  signboardVerified: boolean;
  classroomsLabsVerified: boolean;
  biometricAebasVerified: boolean;
  auditorLatitude: number;
  auditorLongitude: number;
  geoDistanceMeters: number;
  geoMatched: boolean; // <= 100m threshold
  auditorRemarks: string;
  recommendation: 'RECOMMENDED' | 'REJECTED' | 'CORRECTION_REQUIRED';
}

export interface SdcApprovalData {
  approvedTargetCapacity: number;
  approvalRemarks: string;
  approvedDate: string;
  approvedBy: string;
}

export interface SdcRecord {
  id: string;
  sdcCode: string;
  sdcName: string;
  scheme: SdcScheme;
  tpName: string;
  mouRefNo: string;
  proposedStartDate: string;
  totalTrainedAspirants?: number;
  totalPlacedAspirants?: number;

  // Location
  state: string;
  district: string;
  assemblyConstituency?: string;
  parliamentConstituency?: string;
  division?: string;
  block?: string;
  sdcCapacity: number;
  centerEmail: string;
  pincode: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  remarks?: string;

  // Courses & Docs
  allocatedCourses: AllocatedCourse[];
  documents: SdcDocuments;
  declarationAccepted: boolean;

  // Lifecycle & Status
  status: SdcStatus;
  createdAt: string;
  submittedAt?: string;

  // Inspection
  inspection?: SdcInspectionData;

  // Approval
  approval?: SdcApprovalData;

  // Computed/Metrics
  activeBatchesCount?: number;
  enrolledTraineesCount?: number;
}

export const RAJASTHAN_DISTRICTS: string[] = [
  'Jaipur',
  'Ajmer',
  'Jodhpur',
  'Kota',
  'Udaipur',
  'Bikaner',
  'Alwar',
  'Bhilwara',
  'Sikar',
  'Bharatpur',
  'Pali',
  'Sri Ganganagar'
];

export const SDC_SCHEME_OPTIONS: { value: SdcScheme; label: string; badge: string }[] = [
  { value: 'SAMARTH', label: 'SAMARTH (State Fund)', badge: 'State Fund' },
  { value: 'MMKVY', label: 'MMKVY (State Fund)', badge: 'State Fund' },
  { value: 'PMKVY', label: 'PMKVY (Central Fund)', badge: 'Central Fund' },
  { value: 'RAJKViK', label: 'RAJKViK (Category I)', badge: 'Category I' },
  { value: 'MNSKSY', label: 'MNSKSY', badge: 'State Special' },
  { value: 'ELSTP', label: 'ELSTP', badge: 'Employment Linked' }
];

export const SCHEME_COURSE_CATALOG: SdcCourseCatalogItem[] = [
  // MMKVY
  {
    scheme: 'MMKVY',
    sector: 'IT & ITeS',
    courseName: 'Domestic Data Entry Operator',
    qpCode: 'SSC/Q2212',
    nsqfLevel: 4,
    durationHours: 400
  },
  {
    scheme: 'MMKVY',
    sector: 'Automotive & Electronics',
    courseName: 'Drone Operator',
    qpCode: 'AAS/Q6301',
    nsqfLevel: 4,
    durationHours: 430
  },
  {
    scheme: 'MMKVY',
    sector: 'IT & ITeS',
    courseName: 'AI-Machine Learning Engineer',
    qpCode: 'SSC/Q8113',
    nsqfLevel: 6,
    durationHours: 580
  },

  // SAMARTH
  {
    scheme: 'SAMARTH',
    sector: 'Green Energy',
    courseName: 'Solar Panel Installation Tech',
    qpCode: 'ELE/Q5901',
    nsqfLevel: 4,
    durationHours: 300
  },
  {
    scheme: 'SAMARTH',
    sector: 'Apparel & Handicrafts',
    courseName: 'Sewing Machine Operator',
    qpCode: 'AMH/Q1947',
    nsqfLevel: 3,
    durationHours: 240
  },
  {
    scheme: 'SAMARTH',
    sector: 'Beauty & Wellness',
    courseName: 'Beauty Therapist',
    qpCode: 'BWW/Q0101',
    nsqfLevel: 4,
    durationHours: 350
  },

  // RAJKVIK
  {
    scheme: 'RAJKViK',
    sector: 'Capital Goods',
    courseName: 'CNC Milling',
    qpCode: 'CSC/Q0417',
    nsqfLevel: 4,
    durationHours: 670
  },
  {
    scheme: 'RAJKViK',
    sector: 'Construction',
    courseName: 'Assistant Electrician',
    qpCode: 'CON/Q0602',
    nsqfLevel: 3,
    durationHours: 460
  },

  // PMKVY
  {
    scheme: 'PMKVY',
    sector: 'Green Energy',
    courseName: 'Solar PV Installer (Suryamitra)',
    qpCode: 'ELE/Q5901',
    nsqfLevel: 4,
    durationHours: 300
  },
  {
    scheme: 'PMKVY',
    sector: 'IT & ITeS',
    courseName: 'Junior Software Developer',
    qpCode: 'SSC/Q0508',
    nsqfLevel: 5,
    durationHours: 480
  },

  // MNSKSY
  {
    scheme: 'MNSKSY',
    sector: 'Handicraft & Traditional Arts',
    courseName: 'Hand Embroiderer',
    qpCode: 'AMH/Q1001',
    nsqfLevel: 3,
    durationHours: 200
  },
  {
    scheme: 'MNSKSY',
    sector: 'Retail',
    courseName: 'Retail Sales Associate',
    qpCode: 'RAS/Q0104',
    nsqfLevel: 4,
    durationHours: 280
  },

  // ELSTP
  {
    scheme: 'ELSTP',
    sector: 'Electronics',
    courseName: 'Electrician Domestic Solutions',
    qpCode: 'ELE/Q6001',
    nsqfLevel: 4,
    durationHours: 350
  },
  {
    scheme: 'ELSTP',
    sector: 'Automotive',
    courseName: 'Two Wheeler Service Technician',
    qpCode: 'ASC/Q1411',
    nsqfLevel: 4,
    durationHours: 400
  }
];

export interface SanctionOrder {
  id: string;
  tpCode: string;
  scheme: string;
  mouStartDate: string;
  mouExpiryDate: string;
  totalSdc: number;
  approvedSdcCount: number;
}

export const MOCK_SANCTION_ORDERS: SanctionOrder[] = [
  {
    id: 'so-1',
    tpCode: 'MoU-001658',
    scheme: 'SAMARTH',
    mouStartDate: '08/09/2023',
    mouExpiryDate: '02/08/2026',
    totalSdc: 6,
    approvedSdcCount: 2
  }
];
