export interface BasicOrgInfo {
  applicationNo: string;
  schemeName: string;
  shortName: string;
  fullName: string;
  registrationNumber: string;
  prnSmartNo: string;
  contactNo: string;
  emailId: string;
  website: string;
  dateOfRegistration: string;
  panNo: string;
  cinNo: string;
  gstNo: string;
}

export interface EntityInfo {
  turnOver: string;
  blackListed: 'Yes' | 'No' | '';
  nsdcPartner: 'Yes' | 'No' | '';
  natureOfEntity: string;
  categoryOfApplicant: string;
  stateWhereRegistered: string;
  businessActivity?: string;
  eoiReferenceNo: string;
  dateOfEoiPublished: string;
}

export interface AddressInfo {
  address: string;
  state: string;
  district: string;
  pincode: string;
}

export interface WorkflowInfo {
  action: string;
  markTo: string;
  markToOfficer: string;
  remarks: string;
}

export interface OfficerInCharge {
  id: string;
  name: string;
  designation: string;
  mobileNo: string;
  emailId: string;
  pan: string;
  aadhaarNo: string;
  bhamashahNo: string;
  voterIdNo: string;
  passportNo: string;
}

export interface AuthorizedPersonOrg {
  name: string;
  guardianName?: string;
  dob?: string;
  age?: string | number;
  designation: string;
  contactNo: string;
  emailId: string;
  pan?: string;
  aadhaarNo?: string;
  typeIdProof: string;
  idNo: string;
  bhamashahNo?: string;
  voterIdNo?: string;
  passportNo?: string;
  serviceTaxNo?: string;
  residenceAddress: string;
  state?: string;
}

export interface AuthorizedPersonProject {
  name: string;
  emailId: string;
  designation: string;
  typeIdProof: string;
  contactNo: string;
  idNo: string;
  address: string;
}

export interface BankDetails {
  bankName: string;
  accountNo: string;
  confirmAccountNo: string;
  branchName: string;
  micrCode: string;
  accountType: string;
  ifscCode: string;
  branchAddress: string;
  electronicTransferMode?: string;
  cancelledChequeFileName?: string;
  cancelledChequeFileSize?: string;
}

export interface AwardItem {
  id: string;
  awardName: string;
  awardingAgency: string;
  year: string;
  level: 'State' | 'National' | 'International' | '';
  description: string;
  documentName?: string;
}

export interface UploadedDocument {
  id: string;
  docType: string;
  label: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  status: 'pending' | 'uploaded' | 'verified';
}

export interface TpPiaRegistrationData {
  // Tab 1
  basicInfo: BasicOrgInfo;
  entityInfo: EntityInfo;
  registeredAddress: AddressInfo;
  postalAddress: AddressInfo;
  sameAsRegistered: boolean;
  workflowInfo: WorkflowInfo;

  // Tab 2
  officers: OfficerInCharge[];

  // Tab 3
  authorizedOrg: AuthorizedPersonOrg;

  // Tab 4
  authorizedProject: AuthorizedPersonProject;

  // Tab 5
  bankDetails: BankDetails;

  // Tab 6
  awards: AwardItem[];

  // Tab 7
  documents: UploadedDocument[];
  
  // Metadata
  lastSaved?: string;
  status: 'Draft' | 'Submitted';
}
