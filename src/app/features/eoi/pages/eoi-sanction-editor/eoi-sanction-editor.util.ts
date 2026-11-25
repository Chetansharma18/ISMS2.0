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

/**
 * Default terms and conditions, worded exactly as in the printed MMKVY sanction order (fresh array on every call).
 * Each entry carries its own number, as printed ("6.1.", "i."), because the order repeats numbers 7 to 9 after
 * clause 9. A line that starts with "Note:" has no number.
 */
export function createDefaultTerms(): string[] {
  return [
    '1. The PIA shall ensure that the total approved IPA budget does not exceed Rs. 70,00,000 (Rupees Seventy Lakh only) for a sanctioned target of 150 candidates and Rs. 50,00,000 (Fifty Lakh only) for a sanctioned target of 105 candidates. The said financial limit shall remain binding throughout the project period, and under no circumstances shall the IPA budget exceed the ceiling prescribed under this Sanction Order. The PIA can conduct skill training in any one of the given two sectors or in both sectors, but PIA cannot exceed the ceiling given as above.',
    '2. PIA Shall be allowed to conduct residential training of 45 candidates only against the sanctioned target of 150, and 30 candidates only against the sanctioned target of 105.',
    '3. PIA shall ensure that only job roles with a duration of 1060 hours or less are selected. Job roles exceeding 1060 hours shall not be allotted under any case.',
    '4. All PIAs are required to sign the MoU within 10 (ten) working days from the date of issuance of this Sanction Order, failing which the sanction may be liable for cancellation.',
    '5. PIA will submit a Demand Draft (DD) of Rs. 10,000/- (Ten thousand) issued in the favor of Managing Director, Rajasthan Skill and Livelihoods Development Corporation (RSLDC) at the time of MoU signing.',
    '6. The PIA shall comply to “Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK guidelines applicable from 01 April 2021 (as amended from time to time or revised guideline), branding guidelines and office orders, circulars & directions issued by RSLDC from time to time which can be downloaded from www.livelihoods.rajasthan.gov.in or may be taken from RSLDC, Jaipur office.',
    '7. PIA will enroll only targeted beneficiaries as mentioned in scheme guidelines, “Mukhya Mantri Kaushal Vikash Yojana- Cat.I, RAJKViK , and with reference to the course module.',
    '8. All PIAs will strictly comply the directives for the Aadhaar enabled Biometric Attendance System (AEBAS) for using the newly developed AEBAS process for marking the attendance of SDCs daily on the ISMS portal ( Ref. No. : RSLDC/MIS/AEBAS/2024-25/18796-01 dated 03.12.2024) and the IP Camera Monitoring System (Kaushal Darpan) Order no. DSEE/RSLDC/MD/2024-25/153 dated 21.10.2024 and other orders issued by RSLDC time to time.',
    '9. The following are mandatory for the issuance of In-Principle Approval (IPA) from RSLDC (per batch):-',
    '6.1. Installation of IP camera-based face recognition system in classrooms and domain labs of SDC. An undertaking duly verified by District Skill Consultant (DSC) in this regard is to be submitted at the time of submission of request for inspection / IPA. PIA shall also ensure to provide credentials of IP camera to MIS team of RSLDC and integration with Kaushal Darpan established at RSLDC HO and RSLDC website for live streaming.',
    'Note: - PIA will have to maintain video footage of complete skill training in lab/classroom from IP Camera for each batch until the payment for the batch is settled.',
    '6.2. To install IRIS / latest version of Aadhar Enabled Biometric Attendance System (AEBAS) for daily attendance (in & out) at the SDC and Hostel, as applicable, which has to be integrated with ISMS system of RSLDC. The PIA agrees to provide any other information as and when required by RSLDC.',
    '6.3. PIA must hire TOT certified and eligible trainers as per norms laid down in respective job role course modules under Mukhya Mantri Kaushal Vikas Yojana (MMKVY-Category-I) guidelines.',
    '6.4. All PIAs must submit inspection reports of at least one SDC along with all required/desired documents (i.e. SDC file) to the RSLDC HQ within 21 days from date of Sanction order (SO). If PIA fails to submit SDC file within timeline (i.e. within 21 days from the date of issuance of the Sanction Order) then request for submission of SDC file will be considered within next 7 (seven) days only with a penalty of Rs. 20,000/-. After that no request will be considered for SDC file submission, the Sanction Order will be cancelled and allotted target will be revoked.',
    '6.5. All PIA will ensure that video footage is stored and accessible for review until final settlement of UC claims.',
    '7. Logo of RSLDC shall be printed on all material to be provided to the trainees. PIAs will ensure branding guidelines issued by RSLDC.',
    '8. As far as possible, PIAs shall mobilize youth from their allocated districts of operations only. If PIAs are not able to find suitable candidates in allotted districts, they may mobilize youth from other districts as well, who fulfill eligibility criteria as per guidelines.',
    'Note: While enrolling the candidates in batches for skill training priority must be given to aspirants/youth already mobilized and registered on RSLDC portal on first come first serve basis.',
    '9. To arrange assessment and certification of trainees through concerned SSC/NCVT or any other agency nominated by RSLDC.',
    '10. The PIA shall select job roles strictly from the latest course list issued by RSLDC and with the approval of the concern Scheme. Prior to finalization, the PIA must ensure the validity of the selected course and confirm the availability of the Model Curriculum with the concerned Sector Skill Council. Selection of courses that are short expiry should be strictly avoided, as such courses may lead to challenges in conducting Training of Trainers (ToT) and in the assessment of trainees.',
    '11. PIAs will ensure that the SDCs and hostels are setup as per “Mukhya Mantri Kaushal Vikas Yojana" ]MMKVY-Cat.I, RAJKViK guidelines (as amended from time to time)/ order/circulars.',
    '12. PIA would facilitate inspection conducted by Representative of RSLDC and shall follow their directions, suggestions and recommendations.',
    '13. PIA will submit the complete documents of SDC (As per checklist) at the time of SDC inspection request.',
    '14. The PIA agrees to conduct the counselling of candidates in consensus with representatives from RSLDC, Principal / ITI and District Employment Officer followed by an aptitude test, for final creation of the batch at any of the SDC, as and when directed by RSLDC.',
    '15. PIA would conduct training as per Mukhya Mantri Kaushal Vikas Yojana (MMKVY-Category-I) guidelines (as amended from time to time) and shall follow all circulars, office orders and directions issued by RSLDC from time to time.',
    '16. Payment will be released only after thoroughly checking that the PIA does not have any outstanding/ pending recovery. Final payments will be made after deducting the outstanding payment if any in any scheme of RSLDC.',
    '17. PIA would submit batch wise reports of each batch within prescribed time limit as per guidelines (as amended from time to time). The PIA is required to submit the claims for payments of installments as per guideline (as amended from time to time)/Notifications/Circulars issued by RSLDC in proper checklist.',
    '18. PIA would maintain a separate and dedicated bank account for funds to be transferred by RSLDC and PIA will provide the dedicated bank account details with copy of PAN card and cancelled cheque.',
    '19. If PIA fails to utilize the grants for the purpose, the amount shall be refunded along with interest @ 10% proportionate to the extent training is not organized.',
    '20. The utilization of funds disbursed for skill training/activity may be audited not only by the CAG but also by the auditors appointed by RSLDC.',
    '21. One third of the total allotted/approved targets will be allowed to be implemented in residential mode only. This will be adherence to the issued IPA’s. However, conducting training in residential mode is not mandatory.',
    '22. Project Implementation Agencies (PIAs) training targets allotted for 2026-27, shall be reviewed from time to time and remaining targets of the poor performing PIAs may be reduced /revoked/ cancelled, and their remaining targets may be allotted to good performance or new PIAs. RSLDC shall have all rights to revise target criteria, annual plan and instruct on the future skills course of operations to PIA. PIA shall immediately comply with instructions of RSLDC regarding project execution as soon as such instructions are issued. Skilling targets may be revised at any stage by RSLDC, after reviewing the performance.',
    '23. In case, PIA is found guilty of violating scheme guidelines, branding guidelines, found subletting the SDC, found practicing illegal/malpractices at SDC, not followed instructions mentioned in this annual sanction order/IPA, disobey direction/circulars issued by RSLDC/found involve in any activity which may damage image of RSLDC then allotted batch(s)/SDC(s)/IPA/training targets/MoU may be cancelled with an immediate effect, and no payment shall be considered for such batches.',
    '24. PIA shall complete all documentary formalities as required/intimated by RSLDC immediately.',
    '25. PIA must furnish a Performance Security Deposit (PSD) of Rs. 2,00,000/- (Rupees Two Lakhs Only) per Skill Development Centre (SDC) to RSLDC at the time of establishment/onboarding of each new SDC.',
    '26. PIA must ensure a training kit and one set of uniforms for each trainee at the freezing time of every batch.',
    '27. PIA must ensure Wage Employment for 70% trained and certified youth within 60 days from the completion of training. The PIA must provide a minimum three-month retention to placed candidates and submit the required documents within 180 days from completion of training. PIA shall track placed youth for a period of one year.',
    '28. Mobilization from all related convergence departments viz. Rajasthan Gramin Ajeevika Vikas Parishad (RGAVP), Tribal Area Development, Women Empowerment Department, Minority Department & Water & Sanitation Support Organization (WSSO), etc. will be preferred for batch creations.',
    '29. PIAs are advised to ensure sufficient participation to conduct a training program in special categories as and when required by RSLDC.',
    '30. SDC shall not be allowed in basement/marriage garden in any condition, if found that PIA may be debarred from training for complete duration.',
    '31. A flexibility is permitted for running residential/non-residential courses depending on requirement of trainees and meeting of eligibility norms regarding training centers/ hostels as prescribed in “Mukhya Mantri Kaushal Vikas Yojana” (MMKVY- Category-I, RAJKViK) guidelines of RSLDC. However, every training batch should be either completely residential or completely non-residential. Mixed batches shall not be allowed. PIA must arrange separate hostels for Boys and Girls in case of residential batches and PIA must ensure safe and comfortable stay & learning experience for each trainee.',
    '32. TP/PIAs agree to submit minimum of five success stories from each completed batch in each category while applying for the final claims.',
    '33. SDC credentials (longitude, latitude) must be shared with RSLDC while submitting the inspection request (SDC file).',
    '34. PIA will share clearly the details of boarding & lodging of candidates for residential batches at the time of OJT approval request and submit the OJT Request in the prescribed OJT Format.',
    '35. PIA will not remove any infra (chair, table computer etc.) from SDC and bedding from hostel before completion of training and assessment.',
    '36. PIA will not allow any candidate other than registered trainees in classroom, domain and IT lab.',
    '37. SDC Establishment – The Skill Development Centre (SDC) should be established only in the allotted district.',
    '38. PIA must follow the batch creation conditions as mentioned in the IPA. Once a batch is created by PIA and rejected at any stage, the PIA shall ensure reprocessing of the batch within 10 (ten) days from the date of rejection. Failing which, the concerned batch shall not be processed further, and the target for that batch shall be revoked. Subsequent penalties arising from such revocation shall be applicable in accordance with the Scheme Guidelines/MoU/SO/IPA conditions. No intimation or reminder in this regard shall be issued to the PIA by RSLDC.',
    '39. PIA shall ensure completion of at least 60% of the allotted target under a particular sanction. Failing which, the remaining target shall be revoked, and the Performance Security Deposit (PSD) of the concerned SDC shall be forfeited.',
    '40. Mandatory Use of Masked Aadhaar',
    "i. In compliance with the UIDAI's Aadhaar Authentication and Offline Verification Regulations, 2021 and as per order reference RSLDC/MIS/Aadhaar order/2025-26/5640 dated 02.07.2025, it is mandatory for all TPs and PIAs to use masked Aadhaar in all official documentation, records, and Management Information System (MIS) uploads.",
    'ii. The masked Aadhaar number must conceal the first eight digits, displaying only the last four digits.',
    'iii. This directive applies to all forms of Aadhaar usage, including physical documents, photocopies, and online uploads.'
  ];
}

/** Terms the draft carried before it followed the printed order. A saved draft that still has them is brought up to date. */
export function isLegacyDefaultTerms(terms: readonly string[]): boolean {
  return terms.length > 0 && terms[0] === legacyDefaultTerms()[0];
}

/** Clause line that is a sub-point of the one above it: "6.1.", "i." or a "Note:". */
export function isSubClause(clause: string): boolean {
  return /^(\d+\.\d+\.|[ivx]+\.\s|Note:)/.test(clause);
}

/** Terms before the printed wording was adopted (kept only so saved drafts can be recognised). */
function legacyDefaultTerms(): string[] {
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
