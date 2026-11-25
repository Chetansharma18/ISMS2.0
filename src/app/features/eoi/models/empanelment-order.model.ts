export interface CommitteeSignatory {
  id: string;
  name: string;
  designation: string;
  role: string;
  mobile: string;
  email: string;
  otpSent: boolean;
  otpCode?: string;
  otpVerified: boolean;
  signedAt?: string;
  rajKajRefNo?: string;
}

export interface EmpanelledAgencyItem {
  sNo: number;
  applicationId: string;
  agencyName: string;
  category: string;
  fileStatus: 'Eligible' | 'Approved';
  marksGrade: string; // e.g., 'A', 'B', 'C', 'D'
  score?: number;
}

export interface RejectedAgencyItem {
  sNo: number;
  applicationId: string;
  agencyName: string;
  fileStatus: 'Not Eligible' | 'Rejected';
  reason: string;
}

export interface EmpanelmentOrder {
  id: string;
  schemeId: string;
  schemeName: string;
  eoiRefNo: string;
  fileNo: string;
  orderDate: string;
  status: 'DRAFT' | 'E_SIGNED';
  empanelledAgencies: EmpanelledAgencyItem[];
  rejectedAgencies: RejectedAgencyItem[];
  committeeMembers: CommitteeSignatory[];
  createdAt: string;
  signedAt?: string;
  rajKajRefNo?: string;
  issuingAuthority: {
    name: string;
    designation: string;
    department: string;
  };
  copyToList: string[];
  // Customizable government order template fields
  subject?: string;
  rejectionSubject?: string;
  preamble1?: string;
  preamble2?: string;
  rejectionPreamble1?: string;
  rejectionPreamble2?: string;
  approvalClause?: string;
  signatoryName?: string;
  signatoryDesignation?: string;
  rejectionSignatoryName?: string;
  rejectionSignatoryDesignation?: string;
}
