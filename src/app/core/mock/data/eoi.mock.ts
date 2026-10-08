import { resolveMock } from '../mock.config';

export interface MockEoiApplicantItem {
  id: string;
  anonymousLabel: string;
  actualLegalName: string;
  regNumber: string;
  schemeId: string;
  schemeName: string;
  eoiRefNo: string;
  submissionDate: string;
  status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED';
  statusDisplay: string;
  emdFee: number;
  emdStatus: 'PAID' | 'REFUNDED';
  processingFee: number;
  processingFeeStatus: 'PAID';
  score?: number;
  proposedCentresCount: number;
  proposedTargetCount: number;
}

export const MOCK_EOI_APPLICANTS: MockEoiApplicantItem[] = resolveMock([
  {
    id: 'app-1',
    anonymousLabel: 'Company 1',
    actualLegalName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    regNumber: 'ISMS-REG-2026-8819',
    schemeId: 'scheme-1',
    schemeName: 'MMKVY',
    eoiRefNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
    submissionDate: '2026-10-01',
    status: 'UNDER_SCRUTINY',
    statusDisplay: 'Pending Review',
    emdFee: 50000,
    emdStatus: 'PAID',
    processingFee: 2000,
    processingFeeStatus: 'PAID',
    score: 82,
    proposedCentresCount: 4,
    proposedTargetCount: 360
  },
  {
    id: 'app-2',
    anonymousLabel: 'Company 2',
    actualLegalName: 'Mewar Skill Horizons Foundation',
    regNumber: 'ISMS-REG-2026-9042',
    schemeId: 'scheme-1',
    schemeName: 'MMKVY',
    eoiRefNo: 'RSLDC/EOI/MMKVY Cat I II III/2026-27/01',
    submissionDate: '2026-10-03',
    status: 'APPROVED',
    statusDisplay: 'Empanelled',
    emdFee: 50000,
    emdStatus: 'PAID',
    processingFee: 2000,
    processingFeeStatus: 'PAID',
    score: 91,
    proposedCentresCount: 5,
    proposedTargetCount: 500
  },
  {
    id: 'app-3',
    anonymousLabel: 'Company 3',
    actualLegalName: 'Global Edutech Livelihoods Society',
    regNumber: 'ISMS-REG-2026-9118',
    schemeId: 'scheme-4',
    schemeName: 'RAJKVIKRTD',
    eoiRefNo: 'RSLDC/EOI/2026-27/Cat-III/RAJKVIK RTD',
    submissionDate: '2026-09-28',
    status: 'UNDER_SCRUTINY',
    statusDisplay: 'Pending Review',
    emdFee: 40000,
    emdStatus: 'PAID',
    processingFee: 1500,
    processingFeeStatus: 'PAID',
    score: 75,
    proposedCentresCount: 2,
    proposedTargetCount: 200
  }
]);
