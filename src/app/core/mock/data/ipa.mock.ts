import { resolveMock } from '../mock.config';

export interface MockIpaItem {
  id: string;
  ipaNumber: string;
  scheme: string;
  tpName: string;
  batchCode: string;
  targetCount: number;
  completedCount: number;
  tranche: 'Tranche 1 (30%)' | 'Tranche 2 (30%)' | 'Tranche 3 (20%)' | 'Tranche 4 (20%)';
  claimAmount: string;
  submissionDate: string;
  status: 'Pending Verification' | 'Scrutiny Approved' | 'Disbursed' | 'Clarification Raised';
  remarks?: string;
}

export const MOCK_IPA_LIST: MockIpaItem[] = resolveMock([
  {
    id: 'ipa-1',
    ipaNumber: 'IPA-2026-MMKVY-0012',
    scheme: 'MMKVY',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    batchCode: 'BAT-2026-001',
    targetCount: 30,
    completedCount: 30,
    tranche: 'Tranche 1 (30%)',
    claimAmount: '₹1,35,000',
    submissionDate: '2026-09-20',
    status: 'Scrutiny Approved',
    remarks: 'Biometric threshold verified (92%). Passed physical inspection.'
  },
  {
    id: 'ipa-2',
    ipaNumber: 'IPA-2026-MMKVY-0015',
    scheme: 'MMKVY',
    tpName: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    batchCode: 'BAT-2026-004',
    targetCount: 25,
    completedCount: 25,
    tranche: 'Tranche 3 (20%)',
    claimAmount: '₹95,000',
    submissionDate: '2026-10-02',
    status: 'Pending Verification',
    remarks: 'Assessment agency results validated. Placement proofs undergoing scrutiny.'
  }
]);
