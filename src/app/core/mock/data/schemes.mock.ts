import { resolveMock } from '../mock.config';

export interface SchemeTenderItem {
  id?: string;
  sNo: number;
  refNo: string;
  schemeName: string;
  schemeTitle?: string;
  schemeCategory: string;
  datePublished: string;
  closingDate: string;
  eoiCategory: string;
  eoiDescription: string;
  category?: string;
  code?: string;
  status?: 'Open' | 'Closed';
  rfpDocSize?: string;
  sopDocSize?: string;
  preBidDate?: string;
  techBidDate?: string;
  emdFee?: string;
  processFee?: string;
  attachedDocs?: Array<{ sNo: number; name: string; size: string }>;
  committeeMembers?: string[];
  createdAt?: number;
  isActive?: boolean;
  isFrozen?: boolean;
}

export const MOCK_AVAILABLE_ADMINS = [
  { id: 'adm-1', name: 'Ramesh Suresh', ssoId: 'SSO_SUPER_01', role: 'Super Admin' },
  { id: 'adm-2', name: 'Ram Shyaam', ssoId: 'SSO_SUPER_02', role: 'Super Admin' },
  { id: 'adm-3', name: 'Siddesh', ssoId: 'SSO_ADM_01', role: 'Scheme OC' },
  { id: 'adm-4', name: 'Rahul Sharma', ssoId: 'SSO_ADM_02', role: 'MIS Manager' },
  { id: 'adm-5', name: 'Amit Kumar', ssoId: 'SSO_ADM_03', role: 'Programmer' },
  { id: 'adm-6', name: 'Priya Singh', ssoId: 'SSO_ADM_04', role: 'GM' },
  { id: 'adm-7', name: 'Vikram Patel', ssoId: 'SSO_ADM_05', role: 'ZC' }
];

export const MOCK_RFP_DOCUMENTS = [
  { sNo: 1, name: 'Request for Proposal (RFP)', size: '2.4 MB' },
  { sNo: 2, name: 'Standard Operating Procedure (SOP) for Training Partners', size: '1.8 MB' }
];

export const MOCK_ANNEXURE_DOCUMENTS = [
  { sNo: 1, name: 'Annexure-1: Covering Letter', size: '245 KB' },
  { sNo: 2, name: 'Annexure-3: Audited Financial Statements Format for Last Three Consecutive Financial Years', size: '1.2 MB' },
  { sNo: 3, name: 'Annexure-4: Details of Active Skill Development Centre Format', size: '380 KB' },
  { sNo: 4, name: 'Annexure-5: Training and Placement Details Format', size: '520 KB' },
  { sNo: 5, name: 'Annexure-6: Affidavit Format for Not Being Blacklisted by Govt. / PSU', size: '180 KB' },
  { sNo: 6, name: 'Annexure-7: Self-Certificate / Declaration Format as per Annexure-7', size: '195 KB' },
  { sNo: 7, name: 'Annexure-8: Details of Board of Directors Format', size: '290 KB' },
  { sNo: 8, name: 'Annexure-9: Details of Placement Partnership / Industry Tie-ups Format', size: '440 KB' },
  { sNo: 9, name: 'Annexure-10: Details of Working Experience in Relevant Sector Format', size: '610 KB' },
  { sNo: 10, name: 'Annexure-11: List of Divisions and Group of District', size: '310 KB' },
  { sNo: 11, name: 'Annexure-12: Proposed Evaluation Matrix Template', size: '420 KB' },
  { sNo: 12, name: 'Annexure-13: Supporting Documents Checklist', size: '850 KB' }
];

export const MOCK_EOI_REQUIRED_INFO = [
  { sNo: 1, name: 'Company PAN Card', note: 'Self-attested copy' },
  { sNo: 2, name: 'GST Registration Certificate', note: 'If registered' },
  { sNo: 3, name: 'Certificate of Incorporation / Registration', note: 'Issued by respective authority' },
  { sNo: 4, name: 'MSME / Udyam Registration Certificate', note: 'If applicable' },
  { sNo: 5, name: 'Audited Financial Statements (Last 3 years)', note: 'Signed by CA with UDIN' },
  { sNo: 6, name: 'CA-Certified Turnover Certificate', note: 'For total & skill-sector turnover' },
  { sNo: 7, name: 'Affidavit for not being blacklisted by any Govt. / PSU', note: 'Notarized' },
  { sNo: 8, name: 'Authorized Person / Signatory Details', note: 'PAN, Aadhaar, Board resolution / authorization letter' },
  { sNo: 9, name: 'Details of Officer In-Charge (OIC)', note: 'PAN, Aadhaar, appointment letter' },
  { sNo: 10, name: 'Bank Account Details with Cancelled Cheque', note: 'IFSC code required' },
  { sNo: 11, name: 'Training Centre Infrastructure Details', note: 'As per Annexure-4 format' },
  { sNo: 12, name: 'Placement & Training Track Record', note: 'Sector-wise data as per Annexure-5' },
  { sNo: 13, name: 'NSDC Partnership Certificate', note: 'If applicable' },
  { sNo: 14, name: 'EOI Document with Sign & Seal on each page', note: 'By Company Secretary or Authorized Representative' }
];

export const MOCK_SCHEMES: SchemeTenderItem[] = resolveMock([
  {
    id: 'scheme-1',
    sNo: 1,
    refNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
    schemeName: 'MMKVY',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    code: 'MMKVY-2026',
    schemeCategory: 'ALL',
    category: 'ALL',
    datePublished: '15/09/2026',
    closingDate: '30/11/2026',
    eoiCategory: 'General',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme',
    status: 'Open',
    rfpDocSize: '2.4 MB',
    sopDocSize: '1.8 MB',
    preBidDate: '05-Oct-2026 11:30 AM',
    techBidDate: '05-Dec-2026 02:30 PM',
    emdFee: '₹50,000',
    processFee: '₹2,000',
    committeeMembers: []
  },
  {
    id: 'scheme-2',
    sNo: 2,
    refNo: 'RSLDC/EOI/MNSKSY/2026-27/01',
    schemeName: 'MNSKSY',
    schemeTitle: 'Mukhyamantri Nishulk Solar Krishi Sinchayee Yojana (MNSKSY)',
    code: 'MNSKSY-2026',
    schemeCategory: 'NA',
    category: 'NA',
    datePublished: '18/09/2026',
    closingDate: '25/11/2026',
    eoiCategory: 'General',
    eoiDescription: 'Expression of Interest (EOI) MNSKSY in RSLDC.',
    status: 'Open',
    rfpDocSize: '3.1 MB',
    sopDocSize: '2.0 MB',
    preBidDate: '08-Oct-2026 11:00 AM',
    techBidDate: '01-Dec-2026 03:30 PM',
    emdFee: '₹75,000',
    processFee: '₹2,500',
    committeeMembers: []
  },
  {
    id: 'scheme-3',
    sNo: 3,
    refNo: 'RSLDC/EOI/IMSHAKTI/2026-27/01',
    schemeName: 'IM_Shakti',
    schemeTitle: 'Indira Mahila Shakti Prashikshan Va Kaushal Samvardhan Yojana (IM_Shakti)',
    code: 'IM_SHAKTI-2026',
    schemeCategory: 'General',
    category: 'General',
    datePublished: '20/09/2026',
    closingDate: '15/12/2026',
    eoiCategory: 'General',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake the Skill Training under IM Shakti Scheme',
    status: 'Open',
    rfpDocSize: '4.2 MB',
    sopDocSize: '2.2 MB',
    preBidDate: '10-Oct-2026 11:00 AM',
    techBidDate: '20-Dec-2026 02:00 PM',
    emdFee: '₹1,00,000',
    processFee: '₹3,000',
    committeeMembers: []
  },
  {
    id: 'scheme-4',
    sNo: 4,
    refNo: 'RSLDC/EOI/2026-27/Cat-III/RAJKVIK RTD',
    schemeName: 'RAJKVIKRTD',
    schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram RTD (RAJKVIK RTD)',
    code: 'RAJKVIK-RTD-2026',
    schemeCategory: 'RAJKVIK',
    category: 'RAJKVIK',
    datePublished: '22/09/2026',
    closingDate: '10/12/2026',
    eoiCategory: 'General',
    eoiDescription: "EOI for Recruit-TrainDeploy (RTD) model under Mukhya Mantri Kaushal Vikas Yojana Category-1 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (MMKVY-CAT-III 'RAJKVIK')' scheme of RSLDC",
    status: 'Open',
    rfpDocSize: '2.1 MB',
    sopDocSize: '1.4 MB',
    preBidDate: '12-Oct-2026 03:00 PM',
    techBidDate: '15-Dec-2026 03:00 PM',
    emdFee: '₹40,000',
    processFee: '₹1,500',
    committeeMembers: []
  },
  {
    id: 'scheme-5',
    sNo: 5,
    refNo: 'RSLDC/MMYKY2/Eol26-27/01',
    schemeName: 'MMYKY',
    schemeTitle: 'Mukhya Mantri Yuva Kaushal Yojana (MMYKY 2.0)',
    code: 'MMYKY-2026',
    schemeCategory: 'General',
    category: 'General',
    datePublished: '24/09/2026',
    closingDate: '20/12/2026',
    eoiCategory: 'General',
    eoiDescription: 'Eol for MMYKY 2.0 for RSLDC',
    status: 'Open',
    rfpDocSize: '3.6 MB',
    sopDocSize: '2.5 MB',
    preBidDate: '14-Oct-2026 11:00 AM',
    techBidDate: '28-Dec-2026 03:00 PM',
    emdFee: '₹60,000',
    processFee: '₹2,000',
    committeeMembers: []
  },
  {
    id: 'scheme-6',
    sNo: 6,
    refNo: 'RSLDC/Eol/2026-27/1/MMKVYSAMARTH',
    schemeName: 'SAMARTH',
    schemeTitle: 'SAMARTH Skill Development Scheme (MMKVY Cat-II)',
    code: 'MMKVY-SAMARTH-2026',
    schemeCategory: 'SAMARTH',
    category: 'SAMARTH',
    datePublished: '25/09/2026',
    closingDate: '31/12/2026',
    eoiCategory: 'General',
    eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAMARTH) scheme of RSLDC',
    status: 'Open',
    rfpDocSize: '2.5 MB',
    sopDocSize: '1.6 MB',
    preBidDate: '15-Oct-2026 11:30 AM',
    techBidDate: '08-Jan-2027 02:30 PM',
    emdFee: '₹50,000',
    processFee: '₹2,000',
    committeeMembers: []
  },
  {
    id: 'scheme-7',
    sNo: 7,
    refNo: 'RSLDC/Eol/2026-27/1-RAJKVIK General',
    schemeName: 'RAJKVIK',
    schemeTitle: 'Rojgar Aadharit Jan Kaushal Vikas Karyakram (RAJKVIK General)',
    code: 'RAJKVIK-GEN-2026',
    schemeCategory: 'RAJKVIK',
    category: 'RAJKVIK',
    datePublished: '26/09/2026',
    closingDate: '05/01/2027',
    eoiCategory: 'General',
    eoiDescription: 'Eol for submission of proposal to undertake the project under RAJKVIK scheme of RSLDC.',
    status: 'Open',
    rfpDocSize: '3.0 MB',
    sopDocSize: '1.9 MB',
    preBidDate: '18-Oct-2026 02:00 PM',
    techBidDate: '12-Jan-2027 03:30 PM',
    emdFee: '₹50,000',
    processFee: '₹2,000',
    committeeMembers: []
  },
  {
    id: 'scheme-8',
    sNo: 8,
    refNo: 'RSLDC/Eol/2026-27/1/MMKVYSAKSHM',
    schemeName: 'SAKSHM',
    schemeTitle: 'SAKSHAM Skill Training Scheme (MMKVY Cat-II)',
    code: 'MMKVY-SAKSHM-2026',
    schemeCategory: 'SAKSHM',
    category: 'SAKSHM',
    datePublished: '27/09/2026',
    closingDate: '15/01/2027',
    eoiCategory: 'General',
    eoiDescription: 'Eol for submission of proposal to undertake the project under MMKVY (Cat-II: SAKSHM) scheme of RSLDC',
    status: 'Open',
    rfpDocSize: '2.2 MB',
    sopDocSize: '1.5 MB',
    preBidDate: '20-Oct-2026 03:00 PM',
    techBidDate: '22-Jan-2027 04:00 PM',
    emdFee: '₹40,000',
    processFee: '₹1,500',
    committeeMembers: []
  }
]);
