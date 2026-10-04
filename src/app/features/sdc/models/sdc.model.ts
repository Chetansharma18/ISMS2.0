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
  | 'RAJKVIK'
  | 'MNSKSY'
  | 'ELSTP'
  | 'IM_Shakti'
  | 'RAJKVIKRTD'
  | 'MMYKY'
  | 'SAKSHM';

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
  scheme?: SdcScheme | '';
  sector?: string;
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

export interface CenterPhotoItem {
  id?: string;
  name: string;
  url: string;
  size?: string;
  tag?: string;
}

export const SDC_SECTOR_OPTIONS: string[] = [
  'Aerospace and Aviation',
  'Agriculture',
  'Apparel',
  'Automotive',
  'Beauty & Wellness',
  'BFSI',
  'Capital Goods',
  'Construction',
  'Domestic Workers',
  'Electronics',
  'Food Processing',
  'Furniture & Fittings',
  'Green Jobs',
  'Handicrafts and Carpet',
  'Healthcare',
  'Hydrocarbon',
  'Information Technology Sector',
  'Infrastructure Equipment',
  'Iron and Steel',
  'IT-ITeS',
  'Leather',
  'Life Sciences',
  'Logistics',
  'Management',
  'Media & Entertainment',
  'Mining',
  'Plumbing',
  'Power',
  'Sports',
  'Telecom',
  'Textile',
  'Tourism & Hospitality',
  'PwD',
  'Retail',
  'Rubber'
];

export interface SdcNewRegistrationData {
  sdcName?: string;
  sector?: string;
  tpName: string;
  scheme?: SdcScheme | '';
  schemeCategory?: string;
  sdcCode?: string;
  state: string;
  district: string;
  assemblyConstituency?: string;
  parliamentConstituency?: string;
  division?: string;
  block?: string;
  proposedStartDate: string;
  sdcCapacity: number | null;
  centerEmail: string;
  fullAddress: string;
  pincode: string;
  remarks?: string;
  totalTrainedAspirants?: number | null;
  totalPlacedAspirants?: number | null;
  hostelCategory?: string;
  latitude?: number | null;
  longitude?: number | null;
  tpRecommendation?: string;
  tpMandatoryMeasures?: string;
  tpRemarks?: string;
  documentType?: string;
  uploadedDocument?: SdcDocumentItem | null;
  centerPhotos?: CenterPhotoItem[];
}

export interface SdcRecord {
  id: string;
  sdcCode: string;
  sdcName: string;
  scheme: SdcScheme;
  schemeCategory?: string;
  sector?: string;
  tpName: string;
  mouRefNo?: string;
  proposedStartDate: string;
  totalTrainedAspirants?: number;
  totalPlacedAspirants?: number;
  hostelCategory?: string;
  tpRecommendation?: string;

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

  // Documents & Photos
  uploadedDocument?: SdcDocumentItem;
  centerPhotos?: CenterPhotoItem[];
  allocatedCourses: AllocatedCourse[];
  documents?: SdcDocuments;
  declarationAccepted?: boolean;

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
  { value: 'MMKVY', label: 'MMKVY', badge: 'State Fund' },
  { value: 'MNSKSY', label: 'MNSKSY', badge: 'State Special' },
  { value: 'IM_Shakti', label: 'IM_Shakti', badge: 'Women Scheme' },
  { value: 'RAJKVIKRTD', label: 'RAJKVIKRTD', badge: 'Category I' },
  { value: 'MMYKY', label: 'MMYKY', badge: 'Youth Scheme' },
  { value: 'SAMARTH', label: 'SAMARTH', badge: 'State Fund' },
  { value: 'RAJKVIK', label: 'RAJKVIK', badge: 'Category I' },
  { value: 'SAKSHM', label: 'SAKSHM', badge: 'Category III' },
  { value: 'PMKVY', label: 'PMKVY', badge: 'Central Fund' },
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
  ipaNumber: string;
  appId?: string;
  agencyName?: string;
  tpCode?: string;
  scheme?: string;
  schemeName: string;
  category: 'RAJKVIK' | 'SAMARTH' | 'SAKSHM' | string;
  district?: string;
  sectors?: string[];
  sanctionTarget?: number;
  grade?: string;
  mouStartDate: string;
  mouExpiryDate: string;
  totalSdc: number;
  approvedSdcCount: number;
}

export const MOCK_SANCTION_ORDERS: SanctionOrder[] = [
  {
    id: 'so-1',
    ipaNumber: 'RSLDC/IPA/2026/001',
    appId: 'APP-004661',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001658',
    schemeName: 'MMKVY',
    scheme: 'MMKVY',
    category: 'RAJKVIK',
    district: 'Alwar',
    sectors: ['Healthcare & Paramedical', 'IT-ITeS'],
    sanctionTarget: 150,
    grade: 'A',
    mouStartDate: '08/09/2023',
    mouExpiryDate: '02/08/2026',
    totalSdc: 6,
    approvedSdcCount: 2
  },
  {
    id: 'so-2',
    ipaNumber: 'RSLDC/IPA/2026/002',
    appId: 'APP-004662',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001659',
    schemeName: 'MNSKSY',
    scheme: 'MNSKSY',
    category: 'SAMARTH',
    district: 'Jodhpur',
    sectors: ['Textile & Handloom'],
    sanctionTarget: 150,
    grade: 'A',
    mouStartDate: '15/10/2023',
    mouExpiryDate: '14/10/2026',
    totalSdc: 4,
    approvedSdcCount: 1
  },
  {
    id: 'so-3',
    ipaNumber: 'RSLDC/IPA/2026/003',
    appId: 'APP-004664',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001660',
    schemeName: 'MMKVY',
    scheme: 'MMKVY',
    category: 'SAMARTH',
    district: 'Jaipur',
    sectors: ['Healthcare', 'Electronics'],
    sanctionTarget: 150,
    grade: 'A',
    mouStartDate: '01/11/2023',
    mouExpiryDate: '31/10/2026',
    totalSdc: 5,
    approvedSdcCount: 3
  },
  {
    id: 'so-4',
    ipaNumber: 'RSLDC/IPA/2026/004',
    appId: 'APP-004667',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001661',
    schemeName: 'IM_Shakti',
    scheme: 'IM_Shakti',
    category: 'SAMARTH',
    district: 'Udaipur',
    sectors: ['Apparel', 'Beauty & Wellness'],
    sanctionTarget: 120,
    grade: 'A',
    mouStartDate: '12/12/2023',
    mouExpiryDate: '11/12/2026',
    totalSdc: 8,
    approvedSdcCount: 4
  },
  {
    id: 'so-5',
    ipaNumber: 'RSLDC/IPA/2026/005',
    appId: 'APP-004670',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001662',
    schemeName: 'RAJKVIKRTD',
    scheme: 'RAJKVIKRTD',
    category: 'RAJKVIK',
    district: 'Kota',
    sectors: ['Automotive', 'Capital Goods'],
    sanctionTarget: 200,
    grade: 'A',
    mouStartDate: '05/01/2024',
    mouExpiryDate: '04/01/2027',
    totalSdc: 6,
    approvedSdcCount: 2
  },
  {
    id: 'so-6',
    ipaNumber: 'RSLDC/IPA/2026/006',
    appId: 'APP-004675',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001663',
    schemeName: 'MMYKY',
    scheme: 'MMYKY',
    category: 'RAJKVIK',
    district: 'Bikaner',
    sectors: ['IT-ITeS', 'BFSI'],
    sanctionTarget: 180,
    grade: 'A',
    mouStartDate: '20/01/2024',
    mouExpiryDate: '19/01/2027',
    totalSdc: 4,
    approvedSdcCount: 2
  },
  {
    id: 'so-7',
    ipaNumber: 'RSLDC/IPA/2026/007',
    appId: 'APP-004680',
    agencyName: 'Apex Skill Development Foundation',
    tpCode: 'MoU-001664',
    schemeName: 'SAMARTH',
    scheme: 'SAMARTH',
    category: 'SAMARTH',
    district: 'Ajmer',
    sectors: ['Handicrafts and Carpet', 'Leather'],
    sanctionTarget: 100,
    grade: 'B',
    mouStartDate: '10/02/2024',
    mouExpiryDate: '09/02/2027',
    totalSdc: 5,
    approvedSdcCount: 1
  }
];

