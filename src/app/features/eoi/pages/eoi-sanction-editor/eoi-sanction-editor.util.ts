import type { ApplicantResponse } from '../../services/eoi-state.service';
import type { SanctionTableRow } from './eoi-sanction-editor.model';
import { matchesApplicationId } from '../../services/eoi-state.util';

export const AVAILABLE_DISTRICTS: readonly string[] = [
  'Jaipur', 'Jodhpur', 'Udaipur', 'Alwar', 'Kota', 'Sikar', 'Ajmer', 'Bhilwara', 'Beawar', 'Chittorgarh'
];

export const AVAILABLE_SECTORS: readonly string[] = [
  'Apparel, Agriculture', 'Media & Entertainment, IT-ITeS', 'Healthcare, Life Sciences', 'Electronics, Beauty & Wellness', 'Textile & Handloom'
];

/** Maps the scrutiny grade of an approved applicant to the letter printed in the sanction order. */
export function gradeToLetter(grade: string | undefined): string {
  // Grades from the Grading Master (for example "A+" or "B") are used as they are.
  if (grade && !grade.startsWith('Grade')) return grade;
  return grade === 'Grade A' ? 'A' : (grade === 'Grade B' ? 'B' : 'A');
}

/** Builds the allocated-targets table rows from the approved applicant responses. */
export function buildRowsFromApproved(approved: ApplicantResponse[]): SanctionTableRow[] {
  return approved.map((resp, idx) => ({
    id: resp.id,
    appId: resp.id,
    agencyName: resp.anonymousLabel || resp.actualLegalName,
    district: resp.trainingCentres?.[0]?.district || AVAILABLE_DISTRICTS[idx % AVAILABLE_DISTRICTS.length],
    sector: resp.placementTrackRecord?.[0]?.sector || AVAILABLE_SECTORS[idx % AVAILABLE_SECTORS.length],
    category: 'A-1 (Skill)',
    grade: gradeToLetter(resp.scrutinyDetails?.grade),
    target: 150
  }));
}

/**
 * Draft rows for the table: one per approved company, named "Company 1", "Company 2" and so on.
 * Edits saved earlier (district, sector, category, target) are kept for companies that are still approved.
 * Rows added by hand stay; rows of companies that are no longer approved are dropped.
 */
export function syncRowsWithApproved(
  saved: SanctionTableRow[],
  approved: ApplicantResponse[],
  allResponses: ApplicantResponse[]
): SanctionTableRow[] {
  const fresh = buildRowsFromApproved(approved);
  const synced = fresh.map(row => {
    const earlier = saved.find(s => s.appId === row.appId);
    return earlier
      ? { ...row, district: earlier.district, sector: earlier.sector, category: earlier.category, target: earlier.target }
      : row;
  });
  const manual = saved.filter(s => !allResponses.some(r => matchesApplicationId(r, s.appId)));
  return [...synced, ...manual];
}

/** Sample rows, shown only when no company has been approved yet. */
export function createFallbackTableRows(): SanctionTableRow[] {
  return [
    { id: 'APP-2024-001', appId: 'APP-2024-001', agencyName: 'Company 1', district: 'Alwar', sector: 'Apparel, Agriculture', category: 'A-1 (Skill)', grade: 'A', target: 150 },
    { id: 'APP-2024-002', appId: 'APP-2024-002', agencyName: 'Company 2', district: 'Jodhpur', sector: 'Textile & Handloom', category: 'A-1 (Skill)', grade: 'A', target: 150 },
    { id: 'APP-2024-003', appId: 'APP-2024-003', agencyName: 'Company 3', district: 'Udaipur', sector: 'Healthcare, Life Sciences', category: 'A-1 (Skill)', grade: 'A', target: 150 },
    { id: 'APP-2024-004', appId: 'APP-2024-004', agencyName: 'Company 4', district: 'Alwar', sector: 'Healthcare, Life Sciences', category: 'A-1 (Skill)', grade: 'A', target: 150 }
  ];
}

/** Row added by the "+ Add Row" action; `existingCount` is the current number of rows. */
export function createNewTableRow(existingCount: number): SanctionTableRow {
  return {
    id: (existingCount + 1).toString(),
    appId: `APP-00${4750 + existingCount}`,
    agencyName: `Agency ${existingCount + 1}`,
    district: 'Jaipur',
    sector: 'Healthcare, Life Sciences',
    category: 'A-1 (Skill)',
    grade: 'A',
    target: 150
  };
}

/** Default subject line for a scheme without a saved sanction order. */
export function buildSubjectForScheme(schemeTitle: string): string {
  return `Sanction order for allocation of physical targets for Financial Year 2026-27 to PIAs under "${schemeTitle}".`;
}

/** Default terms and conditions clauses (fresh array on every call). */
export function createDefaultTerms(): string[] {
  return [
    'PIA shall be allowed to conduct training in any one of the given two sectors or in both sectors, but PIA cannot exceed the ceiling given as above.',
    'PIA Shall be allowed to conduct residential training of 45 candidates only against the sanctioned target of 150, and 30 candidates only against the sanctioned target of 105.',
    'PIA shall ensure that only job roles with a duration of 1060 hours or less are selected. Job roles exceeding 1060 hours shall not be allotted under any case.',
    'All PIAs are required to sign the MoU within 10 (ten) working days from the date of issuance of this Sanction Order, failing which the sanction may be liable for cancellation.',
    'PIA will submit a Demand Draft (DD) of Rs. 10,000/- (Ten thousand) issued in the favor of Managing Director, Rajasthan Skill and Livelihoods Development Corporation (RSLDC) at the time of MoU signing.',
    'The PIA shall comply to Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK guidelines applicable from 01 April 2021 (as amended from time to time or revised guideline), branding guidelines and office orders, circulars & directions issued by RSLDC from time to time which can be downloaded from www.livelihoods.rajasthan.gov.in or may be taken from RSLDC, Jaipur office.',
    'PIA will enroll only targeted beneficiaries as mentioned in scheme guidelines, "Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK", and with reference to the course module.',
    'All PIAs will strictly comply the directives for the Aadhaar enabled Biometric Attendance System (AEBAS) for using the newly developed AEBAS process for marking the attendance of SDCs daily on the ISMS portal (Ref. No. : RSLDC/MIS/AEBAS/2024-25/18796-01 dated 03.12.2024) and the IP Camera Monitoring System (Kaushal Darpan) Order no: DSEE/RSLDC/MD/2024-25/153 dated 21.10.2024 and other orders issued by RSLDC time to time.',
    'The following are mandatory for the issuance of In-Principle Approval (IPA) from RSLDC (per batch):- Installation of IP camera-based face recognition system in classrooms and domain labs of SDC.',
    'To install IRIS / latest version of Aadhar Enabled Biometric Attendance System (AEBAS) for daily attendance (in & out) at the SDC and Hostel, as applicable, which has to be integrated with ISMS system of RSLDC.',
    'Mandatory Use of Masked Aadhaar: In compliance with UIDAI Regulations 2021, it is mandatory for all TPs to use masked Aadhaar displaying only the last four digits in all official documentation.'
  ];
}

/** Default "Copy to" distribution list (fresh array on every call). */
export function createDefaultCopyTo(): string[] {
  return [
    'PS to Hon\'ble Minister, DSEE, GoR',
    'PS to ACS, DSEE, GoR',
    'PS to Managing Director, RSLDC',
    'CAO, RSLDC',
    'GM-I (Admin.)',
    'OIC-MIS to upload on RSLDC website',
    'PM, PMCA',
    'Respective (Project Implementing Agencies) via mail',
    'File Copy'
  ];
}
