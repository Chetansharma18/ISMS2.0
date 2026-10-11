import type { IpaCourseRow, TargetSummaryRow } from './ipa-editor.model';

/** Recomputes the derived cost figures of a course row (mutates the row in place). */
export function recalculateRowTotal(row: IpaCourseRow): void {
  row.totalCostPerTrainee = (row.costC || 0) + (row.costH || 0);
  row.costPerBatch = row.totalCostPerTrainee * row.approvedTrainees;
  row.totalBudget = row.costPerBatch * row.cycles;
}

/** Sum of a numeric course-row field across all rows. */
export function sumCourseRows(rows: IpaCourseRow[], field: 'approvedTrainees' | 'costPerBatch' | 'cycles' | 'totalBudget'): number {
  return rows.reduce((sum, r) => sum + r[field], 0);
}

/** Row added by the "+ Add Course Row" action. */
export function createNewCourseRow(id: string): IpaCourseRow {
  return {
    id,
    sector: 'Handicraft & Local Resource Based Skills',
    courseName: 'Phad Painting',
    courseCode: 'RSLDC/HRS-001',
    durationDays: 185,
    durationHours: 1110,
    mandatoryOjt: 'No',
    minEdu: 'Minimum 8th Pass',
    minAge: 'Minimum 15 Year',
    rnr: 'NR',
    rCat: 'NA',
    costC: 25530,
    costH: 0,
    costToolkit: 'NA',
    totalCostPerTrainee: 25530,
    approvedTrainees: 30,
    costPerBatch: 765900,
    cycles: 1,
    totalBudget: 765900,
    perDayHours: 6
  };
}

/** Default course approval table matching IPA.pdf (fresh objects on every call). */
export function createDefaultCourseRows(): IpaCourseRow[] {
  return [
    {
      id: '1',
      sector: 'Handicraft & Local Resource Based Skills',
      courseName: 'Phad Painting',
      courseCode: 'RSLDC/HRS-001',
      durationDays: 139,
      durationHours: 1110,
      mandatoryOjt: 'No',
      minEdu: 'Minimum 8th Pass',
      minAge: 'Minimum 15 Year',
      rnr: 'R',
      rCat: 'Z',
      costC: 25530,
      costH: 31600,
      costToolkit: 'NA',
      totalCostPerTrainee: 57130,
      approvedTrainees: 30,
      costPerBatch: 1713900,
      cycles: 1,
      totalBudget: 1713900,
      perDayHours: 8
    },
    createNewCourseRow('2'),
    createNewCourseRow('3')
  ];
}

/** Default target allocation summary matching IPA.pdf (fresh objects on every call). */
export function createDefaultTargetSummary(): TargetSummaryRow[] {
  return [
    { sNo: 1, particular: "Total Training Target/District/SDC's as per SO", value: '90/01/01' },
    { sNo: 2, particular: 'Target allocation in previous IPA', value: 'First IPA' },
    { sNo: 3, particular: 'Target Allocation in this First IPA', value: '90' },
    { sNo: 4, particular: 'Remaining Targets', value: '00' }
  ];
}

/** Default terms and conditions clauses (a to h) matching IPA.pdf. */
export function createDefaultTerms(): string[] {
  return [
    'TP shall ensure to initiation of batches within 15 days from the date issuance the IPA.',
    'TP shall ensure to work in accordance with the (MMKVY-Cat-II-SAKSHM) guideline issued on 1st April 2021 and further direction given by RSLDC.',
    'TP shall ensure to functional IP cameras at SDC before the commencement of batches.',
    'TP shall Submit Performance Security Deposit (PSD) to RSLDC A/C on or before batch Commencement (In case of new SDC).',
    'TP will have to maintain video footage of complete skill training in Lab/classroom from IP Camera for each batch until the payment for the batch.',
    'TP shall ensure installation of Aadhaar linked Biometric for daily attendance of trainees & trainers (In & Out) at the SDC & Hostel (if applicable), which must be compatible with ISMS system of RSLDC.',
    'PIA must ensure compliance of the condition mentioned in the MoU, Sanction Order, Scheme Guideline and other applicable directives.',
    'The IEC & branding should be available as per the scheme guidelines.'
  ];
}

/** Default "CC" distribution list. */
export function createDefaultCopyTo(): string[] {
  return [
    'CAO, RSLDC',
    'District Skill Coordinator (RSLDC) (By Mail)',
    'Office Copy'
  ];
}
