/** An applicant's EOI submission as stored by the EOI resource. */
export interface EoiSubmissionItem {
  id: string;
  anonymousLabel: string;
  actualLegalName: string;
  regNumber: string;
  schemeId: string;
  schemeName: string;
  eoiRefNo: string;
  submissionDate: string;
  status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED';
  statusDisplay: string;
  emdFee: number;
  emdStatus: 'PAID' | 'REFUNDED';
  processingFee: number;
  processingFeeStatus: 'PAID';
  score?: number;
  proposedCentresCount: number;
  proposedTargetCount: number;
}
