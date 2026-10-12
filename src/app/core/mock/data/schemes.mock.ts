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
    refNo: 'RSLDC/EOI/VYUPY/2026-27/01',
    schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
    schemeTitle: 'Vishwakarma Yuva Udyami Protsahan Yojana',
    code: 'VYUPY-2026',
    schemeCategory: 'Rajvik',
    category: 'Rajvik',
    datePublished: '15/09/2026',
    closingDate: '30/11/2026',
    eoiCategory: 'General',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake Skill Training under Vishwakarma Yuva Udyami Protsahan Yojana',
    status: 'Open',
    rfpDocSize: '2.4 MB',
    sopDocSize: '1.8 MB',
    preBidDate: '05-Oct-2026 11:30 AM',
    techBidDate: '05-Dec-2026 02:30 PM',
    emdFee: '₹50,000',
    processFee: '₹10,000',
    committeeMembers: []
  },
  {
    id: 'scheme-2',
    sNo: 2,
    refNo: 'RSLDC/EOI/MYSY/2026-27/01',
    schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
    schemeTitle: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
    code: 'MYSY-2026',
    schemeCategory: 'samarth',
    category: 'samarth',
    datePublished: '18/09/2026',
    closingDate: '25/11/2026',
    eoiCategory: 'Special',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake Skill Training under Mukhyamantri Yuva Swarojgar Yojana (2026)',
    status: 'Open',
    rfpDocSize: '3.1 MB',
    sopDocSize: '2.0 MB',
    preBidDate: '08-Oct-2026 11:00 AM',
    techBidDate: '01-Dec-2026 03:30 PM',
    emdFee: '₹75,000',
    processFee: '₹15,000',
    committeeMembers: []
  },
  {
    id: 'scheme-3',
    sNo: 3,
    refNo: 'RSLDC/EOI/MYSAMBAL/2026-27/01',
    schemeName: 'Mukhyamantri Yuva Sambal Yojana',
    schemeTitle: 'Mukhyamantri Yuva Sambal Yojana',
    code: 'MYSAMBAL-2026',
    schemeCategory: 'saksham',
    category: 'saksham',
    datePublished: '20/09/2026',
    closingDate: '15/12/2026',
    eoiCategory: 'General',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake Skill Training under Mukhyamantri Yuva Sambal Yojana',
    status: 'Open',
    rfpDocSize: '4.2 MB',
    sopDocSize: '2.2 MB',
    preBidDate: '10-Oct-2026 11:00 AM',
    techBidDate: '20-Dec-2026 02:00 PM',
    emdFee: '₹25,000',
    processFee: '₹5,000',
    committeeMembers: []
  },
  {
    id: 'scheme-4',
    sNo: 4,
    refNo: 'RSLDC/EOI/MMYKY/2026-27/01',
    schemeName: 'Mukhya Mantri Yuva Kaushal Yojana',
    schemeTitle: 'Mukhya Mantri Yuva Kaushal Yojana',
    code: 'MMYKY-2026',
    schemeCategory: 'Rajvik, samarth',
    category: 'Rajvik, samarth',
    datePublished: '22/09/2026',
    closingDate: '10/12/2026',
    eoiCategory: 'Special',
    eoiDescription: 'Expression of Interest for submission of proposal to undertake Skill Training under Mukhya Mantri Yuva Kaushal Yojana',
    status: 'Open',
    rfpDocSize: '2.1 MB',
    sopDocSize: '1.4 MB',
    preBidDate: '12-Oct-2026 03:00 PM',
    techBidDate: '15-Dec-2026 03:00 PM',
    emdFee: '₹1,00,000',
    processFee: '₹25,000',
    committeeMembers: []
  }
]);

/** Distinct scheme short names, used to populate Scheme selection dropdowns. */
export const SCHEME_NAME_OPTIONS: string[] = Array.from(
  new Set(MOCK_SCHEMES.map(s => s.schemeName))
);
