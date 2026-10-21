import type { IpaCourseRow } from '../../../features/eoi/services/eoi-state.models';

/**
 * Dummy In-Principal Approvals shown to the training partner, as the partner sees them. Not linked to the real
 * sanction orders or applications yet.
 *
 * - IPA 1: one district and one sector, so the new SDC form has both already selected and locked.
 * - IPA 2: two districts and two sectors, so the partner picks from those only.
 */
export interface TpIpa {
  ipaId: string;
  ipaNumber: string;
  schemeId: string;
  schemeTitle: string;
  refNo: string;
  /** Category as shown in tables ("Rajvik"). */
  category: string;
  /** Scheme and category codes handed to the SDC form. */
  scheme: string;
  schemeCategory: string;
  tpName: string;
  courses: IpaCourseRow[];
}

/** One course row of an IPA; the totals are worked out from the cost and trainees. */
function course(
  id: string,
  district: string,
  sector: string,
  courseName: string,
  courseCode: string,
  durationDays: number,
  durationHours: number,
  costC: number,
  costH: number,
  trainees: number,
  cycles: number
): IpaCourseRow {
  const perTrainee = costC + costH;
  const perBatch = perTrainee * trainees;
  return {
    id,
    district,
    sector,
    courseName,
    courseCode,
    durationDays,
    durationHours,
    mandatoryOjt: 'No',
    minEdu: 'Minimum 8th Pass',
    minAge: 'Minimum 15 Year',
    rnr: costH > 0 ? 'R' : 'NR',
    rCat: costH > 0 ? 'Z' : 'NA',
    costC,
    costH,
    costToolkit: 'NA',
    totalCostPerTrainee: perTrainee,
    approvedTrainees: trainees,
    costPerBatch: perBatch,
    cycles,
    totalBudget: perBatch * cycles,
    perDayHours: 8
  };
}

const HANDICRAFT = 'Handicraft & Local Resource Based Skills';
const FOOD = 'Food Processing';
const IT = 'IT-ITeS';

export const TP_IPAS: TpIpa[] = [
  {
    ipaId: 'DUMMY-IPA-1',
    ipaNumber: 'RSLDC/IPA/2026-27/0312',
    schemeId: 'MMKVY-01',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    refNo: 'RSLDC/EOI/2026/MMKVY-01',
    category: 'Rajvik',
    scheme: 'MMKVY',
    schemeCategory: 'RAJKVIK',
    tpName: 'Company 1',
    courses: [
      course('1', 'Alwar', HANDICRAFT, 'Phad Painting', 'RSLDC/HRS-001', 139, 1110, 25530, 31600, 30, 1),
      course('2', 'Alwar', HANDICRAFT, 'Block Printing Artisan', 'RSLDC/HRS-002', 157, 940, 25530, 0, 30, 1),
      course('3', 'Alwar', HANDICRAFT, 'Blue Pottery Artisan', 'RSLDC/HRS-003', 157, 940, 25530, 0, 30, 1)
    ]
  },
  {
    ipaId: 'DUMMY-IPA-2',
    ipaNumber: 'RSLDC/IPA/2026-27/0455',
    schemeId: 'MMKVY-02',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    refNo: 'RSLDC/EOI/2026/MMKVY-02',
    category: 'Samarth',
    scheme: 'MMKVY',
    schemeCategory: 'SAMARTH',
    tpName: 'Company 1',
    courses: [
      course('1', 'Jaipur', FOOD, 'Multi Skill Technician', 'FIC/Q9007', 157, 940, 39856, 0, 30, 2),
      course('2', 'Jaipur', IT, 'Domestic Data Entry Operator', 'SSC/Q2212', 75, 300, 14500, 0, 30, 1),
      course('3', 'Kota', FOOD, 'Multi Skill Technician', 'FIC/Q9007', 157, 940, 39856, 0, 30, 1),
      course('4', 'Kota', IT, 'Domestic Data Entry Operator', 'SSC/Q2212', 75, 300, 14500, 0, 30, 1)
    ]
  }
];
