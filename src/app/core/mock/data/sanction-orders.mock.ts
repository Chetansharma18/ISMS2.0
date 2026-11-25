import { resolveMock } from '../mock.config';

export interface SanctionOrderItem {
  id: string;
  ipaNumber: string;
  appId: string;
  agencyName: string;
  tpCode: string;
  schemeName: string;
  scheme: string;
  category: string;
  district: string;
  sectors: string[];
  sanctionTarget: number;
  grade: string;
  mouStartDate: string;
  mouExpiryDate: string;
  totalSdc: number;
  approvedSdcCount: number;
}

export const MOCK_SANCTION_ORDERS: SanctionOrderItem[] = resolveMock([
  {
    id: 'so-1',
    ipaNumber: 'MoU-2024-001',
    appId: 'APP-2024-001',
    agencyName: 'Company 1',
    tpCode: 'MoU-001658',
    schemeName: 'MMKVY',
    scheme: 'MMKVY',
    category: 'RAJKVIK',
    district: 'Jaipur',
    sectors: ['Healthcare', 'IT-ITeS'],
    sanctionTarget: 360,
    grade: 'A',
    mouStartDate: '08/09/2023',
    mouExpiryDate: '02/08/2026',
    totalSdc: 6,
    approvedSdcCount: 2
  },
  {
    id: 'so-2',
    ipaNumber: 'MoU-2024-002',
    appId: 'APP-2024-002',
    agencyName: 'Company 2',
    tpCode: 'MoU-001659',
    schemeName: 'MNSKSY',
    scheme: 'MNSKSY',
    category: 'SAMARTH',
    district: 'Jodhpur',
    sectors: ['Apparel', 'Automotive'],
    sanctionTarget: 240,
    grade: 'A',
    mouStartDate: '15/10/2023',
    mouExpiryDate: '14/10/2026',
    totalSdc: 4,
    approvedSdcCount: 1
  },
  {
    id: 'so-3',
    ipaNumber: 'MoU-2024-003',
    appId: 'APP-2024-003',
    agencyName: 'Company 3',
    tpCode: 'MoU-001660',
    schemeName: 'MMKVY',
    scheme: 'MMKVY',
    category: 'SAMARTH',
    district: 'Udaipur',
    sectors: ['Tourism & Hospitality'],
    sanctionTarget: 300,
    grade: 'A',
    mouStartDate: '01/11/2023',
    mouExpiryDate: '31/10/2026',
    totalSdc: 5,
    approvedSdcCount: 3
  },
  {
    id: 'so-4',
    ipaNumber: 'MoU-2024-004',
    appId: 'APP-2024-004',
    agencyName: 'Company 4',
    tpCode: 'MoU-001661',
    schemeName: 'IM_Shakti',
    scheme: 'IM_Shakti',
    category: 'SAMARTH',
    district: 'Bikaner',
    sectors: ['Beauty & Wellness', 'Retail'],
    sanctionTarget: 480,
    grade: 'A',
    mouStartDate: '12/12/2023',
    mouExpiryDate: '11/12/2026',
    totalSdc: 8,
    approvedSdcCount: 4
  },
  {
    id: 'so-5',
    ipaNumber: 'MoU-2024-005',
    appId: 'APP-2024-005',
    agencyName: 'Rajasthan Vocational Foundation',
    tpCode: 'MoU-001662',
    schemeName: 'RAJKVIKRTD',
    scheme: 'RAJKVIKRTD',
    category: 'RAJKVIK',
    district: 'Kota',
    sectors: ['Electronics', 'Construction'],
    sanctionTarget: 360,
    grade: 'A',
    mouStartDate: '05/01/2024',
    mouExpiryDate: '04/01/2027',
    totalSdc: 6,
    approvedSdcCount: 2
  },
  {
    id: 'so-6',
    ipaNumber: 'MoU-2024-006',
    appId: 'APP-2024-006',
    agencyName: 'Surya Skill Academy',
    tpCode: 'MoU-001663',
    schemeName: 'MMYKY',
    scheme: 'MMYKY',
    category: 'RAJKVIK',
    district: 'Ajmer',
    sectors: ['Logistics', 'Agriculture'],
    sanctionTarget: 240,
    grade: 'A',
    mouStartDate: '20/01/2024',
    mouExpiryDate: '19/01/2027',
    totalSdc: 4,
    approvedSdcCount: 2
  },
  {
    id: 'so-7',
    ipaNumber: 'MoU-2024-007',
    appId: 'APP-2024-007',
    agencyName: 'Aravalli Technical Training Pvt Ltd',
    tpCode: 'MoU-001664',
    schemeName: 'SAMARTH',
    scheme: 'SAMARTH',
    category: 'SAMARTH',
    district: 'Alwar',
    sectors: ['Green Jobs', 'Solar Energy'],
    sanctionTarget: 600,
    grade: 'A',
    mouStartDate: '10/02/2024',
    mouExpiryDate: '09/02/2027',
    totalSdc: 10,
    approvedSdcCount: 5
  },
  {
    id: 'so-8',
    ipaNumber: 'MoU-2024-008',
    appId: 'APP-2024-008',
    agencyName: 'Dharohar Skill Foundation',
    tpCode: 'MoU-001665',
    schemeName: 'RAJKVIK',
    scheme: 'RAJKVIK',
    category: 'RAJKVIK',
    district: 'Bhilwara',
    sectors: ['Textiles & Handloom'],
    sanctionTarget: 360,
    grade: 'A',
    mouStartDate: '01/03/2024',
    mouExpiryDate: '28/02/2027',
    totalSdc: 6,
    approvedSdcCount: 3
  },
  {
    id: 'so-9',
    ipaNumber: 'MoU-2024-009',
    appId: 'APP-2024-009',
    agencyName: 'Desert Bloom Foundation',
    tpCode: 'MoU-001666',
    schemeName: 'SAKSHM',
    scheme: 'SAKSHM',
    category: 'SAKSHM',
    district: 'Sikar',
    sectors: ['Handicrafts', 'Telecom'],
    sanctionTarget: 300,
    grade: 'A',
    mouStartDate: '15/03/2024',
    mouExpiryDate: '14/03/2027',
    totalSdc: 5,
    approvedSdcCount: 2
  },
  {
    id: 'so-10',
    ipaNumber: 'MoU-2024-010',
    appId: 'APP-2024-010',
    agencyName: 'Vision India Skill Center',
    tpCode: 'MoU-001667',
    schemeName: 'RAJKVIK',
    scheme: 'RAJKVIK',
    category: 'RAJKVIK',
    district: 'Bharatpur',
    sectors: ['Food Processing', 'Security'],
    sanctionTarget: 420,
    grade: 'A',
    mouStartDate: '01/04/2024',
    mouExpiryDate: '31/03/2027',
    totalSdc: 7,
    approvedSdcCount: 4
  }
]);
