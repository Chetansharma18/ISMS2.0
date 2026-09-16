import { 
  NATURE_OF_ENTITIES, 
  APPLICANT_CATEGORIES, 
  ACCOUNT_TYPES, 
  ID_PROOF_TYPES,
  TRANSFER_MODES
} from '../services/tp-pia-registration.service';

export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'email' 
  | 'tel'
  | 'textarea' 
  | 'select' 
  | 'searchable-select' 
  | 'radio';

export type InputRestriction = 
  | 'alphanumeric' 
  | 'alphanumeric-upper'
  | 'alphanumeric-symbols'
  | 'alpha-space' 
  | 'alpha-hyphen-slash' 
  | 'digits' 
  | 'decimal' 
  | 'pan' 
  | 'cin' 
  | 'gst' 
  | 'ifsc' 
  | 'none';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  maxlength?: number;
  minDate?: string;
  maxDateKey?: 'todayIso' | 'maxDobIso';
  restriction?: InputRestriction;
  uppercase?: boolean;
  readonly?: boolean;
  prefix?: string;
  colSpan?: string;
  options?: SelectOption[];
  radioOptions?: SelectOption[];
  searchableKey?: 'states' | 'rajasthanDistricts' | 'banks';
}

export interface FormSectionConfig {
  id: string;
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
}

export const STEP_1_SECTIONS: FormSectionConfig[] = [
  {
    id: 'org-profile',
    title: '1.1 Basic Organisation Profile',
    fields: [
      { key: 'basicInfo.schemeName', label: 'Scheme Name', type: 'text', required: true, maxlength: 100, restriction: 'alpha-hyphen-slash', placeholder: 'Enter scheme name' },
      { key: 'basicInfo.shortName', label: 'Short Name / Acronym', type: 'text', required: true, maxlength: 20, uppercase: true, restriction: 'alphanumeric', placeholder: 'e.g. ABC' },
      { key: 'basicInfo.fullName', label: 'Full Organisation Name', type: 'text', required: true, maxlength: 150, restriction: 'alpha-space', placeholder: 'Enter complete legal entity name', colSpan: 'col-span-1 md:col-span-2' },
      { key: 'basicInfo.registrationNumber', label: 'Registration / Incorporation No.', type: 'text', required: true, maxlength: 50, uppercase: true, restriction: 'alphanumeric', placeholder: 'e.g. U74999RJ2020PTC012345' },
      { key: 'basicInfo.prnSmartNo', label: 'PRN / SMART No.', type: 'text', required: false, maxlength: 30, uppercase: true, restriction: 'alphanumeric', placeholder: 'e.g. SMART-12345' },
      { key: 'basicInfo.contactNo', label: 'Official Mobile No.', type: 'tel', required: true, maxlength: 10, restriction: 'digits', placeholder: '10-digit mobile number' },
      { key: 'basicInfo.emailId', label: 'Official Email Address', type: 'email', required: true, maxlength: 80, placeholder: 'official@organisation.org' },
      { key: 'basicInfo.website', label: 'Official Website', type: 'text', required: false, maxlength: 100, placeholder: 'https://www.organisation.org' },
      { key: 'basicInfo.dateOfRegistration', label: 'Date of Registration', type: 'date', required: true, minDate: '1950-01-01', maxDateKey: 'todayIso' },
      { key: 'basicInfo.panNo', label: 'PAN No. of Organisation', type: 'text', required: true, maxlength: 10, uppercase: true, restriction: 'pan', placeholder: 'e.g. ABCDE1234F' },
      { key: 'basicInfo.cinNo', label: 'CIN No.', type: 'text', required: false, maxlength: 21, uppercase: true, restriction: 'cin', placeholder: '21-character CIN' },
      { key: 'basicInfo.gstNo', label: 'GSTIN', type: 'text', required: true, maxlength: 15, uppercase: true, restriction: 'gst', placeholder: '15-character GSTIN' },
      { key: 'basicInfo.applicationNo', label: 'Application Reference No.', type: 'text', required: false, readonly: true, placeholder: 'Auto-generated' }
    ]
  },
  {
    id: 'entity-classification',
    title: '1.2 Entity Classification & Business Details',
    fields: [
      { key: 'entityInfo.natureOfEntity', label: 'Nature of Entity', type: 'select', required: true, options: NATURE_OF_ENTITIES.map((v: string) => ({ label: v, value: v })) },
      { key: 'entityInfo.categoryOfApplicant', label: 'Category of Applicant', type: 'select', required: true, options: APPLICANT_CATEGORIES.map((v: string) => ({ label: v, value: v })) },
      { key: 'entityInfo.stateWhereRegistered', label: 'State Where Registered', type: 'searchable-select', required: true, searchableKey: 'states' },
      { key: 'entityInfo.turnOver', label: 'Turnover (in Lakhs)', type: 'number', required: false, maxlength: 10, restriction: 'decimal', placeholder: 'e.g. 150.00' },
      { key: 'entityInfo.businessActivity', label: 'Primary Business / Skill Activity', type: 'text', required: false, maxlength: 300, placeholder: 'Brief summary of skill development activities', colSpan: 'col-span-1 md:col-span-2' },
      { key: 'entityInfo.blackListed', label: 'Blacklisted by Any Govt / PSU?', type: 'radio', required: true, radioOptions: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }] },
      { key: 'entityInfo.nsdcPartner', label: 'Whether Funded by NSDC?', type: 'radio', required: true, radioOptions: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }] }
    ]
  },
  {
    id: 'reg-address',
    title: '1.3 Registered Office Address',
    fields: [
      { key: 'registeredAddress.address', label: 'Full Registered Address', type: 'textarea', required: true, maxlength: 200, placeholder: 'Building / Premise name, Street, Locality...', colSpan: 'col-span-1 md:col-span-3' },
      { key: 'registeredAddress.state', label: 'State', type: 'searchable-select', required: true, searchableKey: 'states' },
      { key: 'registeredAddress.district', label: 'District', type: 'text', required: true, maxlength: 50, restriction: 'alpha-space', placeholder: 'Enter district' },
      { key: 'registeredAddress.pincode', label: 'PIN Code', type: 'text', required: true, maxlength: 6, restriction: 'digits', placeholder: '6-digit PIN' }
    ]
  },
  {
    id: 'raj-address',
    title: '1.4 Rajasthan Office Address',
    fields: [
      { key: 'postalAddress.address', label: 'Office Address in Rajasthan', type: 'textarea', required: true, maxlength: 200, placeholder: 'Building / Street in Rajasthan...', colSpan: 'col-span-1 md:col-span-3' },
      { key: 'postalAddress.state', label: 'State', type: 'text', required: true, readonly: true },
      { key: 'postalAddress.district', label: 'District (Rajasthan)', type: 'searchable-select', required: true, searchableKey: 'rajasthanDistricts' },
      { key: 'postalAddress.pincode', label: 'PIN Code', type: 'text', required: true, maxlength: 6, restriction: 'digits', placeholder: '6-digit PIN' }
    ]
  }
];

export const STEP_2_SECTIONS: FormSectionConfig[] = [
  {
    id: 'auth-personal',
    title: '2.1 Personal & Statutory Signatory Details',
    fields: [
      { key: 'authorizedOrg.name', label: 'Full Name', type: 'text', required: true, maxlength: 100, restriction: 'alpha-space', placeholder: 'Enter full name as per ID' },
      { key: 'authorizedOrg.guardianName', label: 'Father / Husband Name', type: 'text', required: false, maxlength: 100, restriction: 'alpha-space', placeholder: 'Enter guardian name' },
      { key: 'authorizedOrg.dob', label: 'Date of Birth', type: 'date', required: true, minDate: '1920-01-01', maxDateKey: 'maxDobIso' },
      { key: 'authorizedOrg.age', label: 'Calculated Age', type: 'text', required: false, readonly: true, placeholder: 'Auto-calculated' },
      { key: 'authorizedOrg.designation', label: 'Designation in Entity', type: 'text', required: true, maxlength: 80, restriction: 'alphanumeric-symbols', placeholder: 'e.g. Director, Managing Partner, CEO' },
      { key: 'authorizedOrg.contactNo', label: 'Mobile Number', type: 'tel', required: true, maxlength: 10, restriction: 'digits', placeholder: '10-digit mobile number', prefix: '+91' },
      { key: 'authorizedOrg.emailId', label: 'Email Address', type: 'email', required: true, maxlength: 80, placeholder: 'signatory@organisation.org' },
      { key: 'authorizedOrg.pan', label: 'Personal PAN No.', type: 'text', required: true, maxlength: 10, uppercase: true, restriction: 'pan', placeholder: 'e.g. ABCDE1234F' },
      { key: 'authorizedOrg.aadhaarNo', label: 'Aadhaar Number', type: 'text', required: true, maxlength: 12, restriction: 'digits', placeholder: '12-digit Aadhaar number' },
      { key: 'authorizedOrg.state', label: 'State / UT', type: 'searchable-select', required: true, searchableKey: 'states' },
      { key: 'authorizedOrg.residenceAddress', label: 'Residence Address', type: 'textarea', required: false, maxlength: 250, placeholder: 'House / Flat No., Street, Area...', colSpan: 'col-span-1 md:col-span-2' }
    ]
  }
];

export const STEP_3_SECTIONS: FormSectionConfig[] = [
  {
    id: 'bank-account',
    title: '3.1 Bank Account & Verification Details',
    fields: [
      { key: 'bankDetails.bankName', label: 'Name of the Bank', type: 'searchable-select', required: true, searchableKey: 'banks' },
      { key: 'bankDetails.accountNo', label: 'Account No.', type: 'text', required: true, maxlength: 18, restriction: 'digits', placeholder: 'Enter Bank Account Number (9 to 18 digits)' },
      { key: 'bankDetails.ifscCode', label: 'IFSC Code', type: 'text', required: true, maxlength: 11, uppercase: true, restriction: 'ifsc', placeholder: 'e.g. SBIN0004129' },
      { key: 'bankDetails.accountType', label: 'Type of Account', type: 'select', required: false, options: ACCOUNT_TYPES.map((t: string) => ({ label: t, value: t })) },
      { key: 'bankDetails.electronicTransferMode', label: 'Mode of electronic transfer', type: 'select', required: false, options: TRANSFER_MODES.map((t: string) => ({ label: t, value: t })) },
      { key: 'bankDetails.branchName', label: 'Branch Name', type: 'text', required: true, maxlength: 80, restriction: 'alphanumeric-symbols', placeholder: 'e.g. Malviya Nagar Branch, Jaipur' },
      { key: 'bankDetails.micrCode', label: 'MICR Code', type: 'text', required: false, maxlength: 9, restriction: 'digits', placeholder: '9-digit MICR code (e.g. 302002018)' },
      { key: 'bankDetails.branchAddress', label: 'Branch Address', type: 'textarea', required: true, maxlength: 250, placeholder: 'Enter complete postal address of the bank branch', colSpan: 'col-span-1 md:col-span-2' }
    ]
  },
  {
    id: 'cheque-upload',
    title: '3.2 Upload Cancelled Cheque / Bank Passbook Copy',
    fields: []
  }
];
