import { FormFieldConfig, FormOption } from '../../../shared/components/form-sdc';
import { SECTOR_COURSES_MAP } from './courses-catalog.data';

export const RAJASTHAN_DISTRICTS: string[] = [
  'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar',
  'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa',
  'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu', 'Dungarpur', 'Gangapur City',
  'Hanumangarh', 'Jaipur', 'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar',
  'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 'Karauli', 'Kekri', 'Khairthal-Tijara',
  'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi',
  'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura',
  'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'
];

export interface AspirantDocumentItem {
  id: string;
  itemNumber?: number;
  docType: string;
  docName: string;
  badgeLabel?: string;
  badgeType?: 'mandatory' | 'conditional' | 'optional';
  description?: string;
  conditionNote?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  uploadedAt?: string;
  status: 'PENDING' | 'UPLOADED';
}

/**
 * Default statutory & eligibility attachments configured for Aspirant Registration (Items 3 through 15)
 */
export function getDefaultAspirantDocuments(): AspirantDocumentItem[] {
  return [
    {
      id: 'doc-1',
      itemNumber: 1,
      docType: 'Educational Qualification Certificate',
      docName: 'Educational Qualification Certificate',
      badgeLabel: 'Mandatory',
      badgeType: 'mandatory',
      description: 'Highest educational qualification marksheet or passing certificate',
      conditionNote: 'Mandatory for all aspirants',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-2',
      itemNumber: 2,
      docType: 'Bank Passbook / Cancelled Cheque',
      docName: 'Bank Passbook / Cancelled Cheque',
      badgeLabel: 'Mandatory',
      badgeType: 'mandatory',
      description: 'Clear copy of bank passbook first page showing Account No. & IFSC or cancelled cheque',
      conditionNote: 'Mandatory for DBT stipend & attendance incentives',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-3',
      itemNumber: 3,
      docType: 'Caste Certificate',
      docName: 'Caste Certificate',
      badgeLabel: 'Only if applicable',
      badgeType: 'conditional',
      description: 'Competent authority issued SC / ST / OBC certificate for category verification',
      conditionNote: 'Only if applicable',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-4',
      itemNumber: 4,
      docType: 'EWS Certificate',
      docName: 'EWS Certificate',
      badgeLabel: 'Only if applicable',
      badgeType: 'conditional',
      description: 'Economically Weaker Section certificate issued by designated revenue officer',
      conditionNote: 'Only if applicable',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-5',
      itemNumber: 5,
      docType: 'Income Certificate',
      docName: 'Income Certificate',
      badgeLabel: 'If applicable',
      badgeType: 'conditional',
      description: 'Annual family income declaration or Tehsildar certified income certificate',
      conditionNote: 'If applicable',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-6',
      itemNumber: 6,
      docType: 'Disability Certificate / UDID',
      docName: 'Disability Certificate / UDID',
      badgeLabel: 'If Person with Special Ability = Yes',
      badgeType: 'conditional',
      description: 'Unique Disability ID (UDID) card or Medical Board disability certificate',
      conditionNote: 'If Person with Special Ability = Yes',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-7',
      itemNumber: 7,
      docType: 'Domicile / Residence Certificate',
      docName: 'Domicile / Residence Certificate',
      badgeLabel: 'If required by scheme',
      badgeType: 'conditional',
      description: 'Rajasthan Bonafide / Mool Niwas residential certificate',
      conditionNote: 'If required by scheme',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-8',
      itemNumber: 8,
      docType: 'Jan Aadhaar',
      docName: 'Jan Aadhaar',
      badgeLabel: 'If applicable',
      badgeType: 'conditional',
      description: 'Family Jan Aadhaar card copy or Jan Aadhaar enrollment slip',
      conditionNote: 'If applicable',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-9',
      itemNumber: 9,
      docType: 'BoCW / Labour Card',
      docName: 'BoCW / Labour Card',
      badgeLabel: 'If BoCW Worker = Yes',
      badgeType: 'conditional',
      description: 'Building and Other Construction Workers Welfare Board registration card',
      conditionNote: 'If BoCW Worker = Yes',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-10',
      itemNumber: 10,
      docType: 'MGNREGA Job Card',
      docName: 'MGNREGA Job Card',
      badgeLabel: 'If MGNREGA Worker = Yes',
      badgeType: 'conditional',
      description: 'Active 100-day MGNREGA employment job card issued by Gram Panchayat',
      conditionNote: 'If MGNREGA Worker = Yes',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-11',
      itemNumber: 11,
      docType: 'RSBY Card',
      docName: 'RSBY Card',
      badgeLabel: 'If RSBY = Yes',
      badgeType: 'conditional',
      description: 'Rashtriya Swasthya Bima Yojana smart card or health insurance scheme proof',
      conditionNote: 'If RSBY = Yes',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-12',
      itemNumber: 12,
      docType: 'NRLM / SHG Proof',
      docName: 'NRLM / SHG Proof',
      badgeLabel: 'If NRLM SHG Member = Yes',
      badgeType: 'conditional',
      description: 'National Rural Livelihoods Mission / Self Help Group membership passbook or certificate',
      conditionNote: 'If NRLM SHG Member = Yes',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    },
    {
      id: 'doc-13',
      itemNumber: 13,
      docType: 'Other Document',
      docName: 'Other Document',
      badgeLabel: 'Optional',
      badgeType: 'optional',
      description: 'Any additional statutory, vocational, or special eligibility proof document',
      conditionNote: 'Optional',
      fileName: '',
      fileSize: '',
      status: 'PENDING'
    }
  ];
}

export interface AspirantFormData {
  // Step 1: Main / Personal Details
  aadhaarNo: string;
  confirmAadhaarNo?: string;
  janaadhaarId: string;
  otherIdType: string;
  otherIdNo: string;
  aadhaarDocUrl?: string;
  aadhaarDocName?: string;
  aadhaarDocSize?: string;

  aspirantName: string;
  gender: string;
  relationType: string;
  relationName: string;
  motherName: string;
  dob: string;
  age: number | string;
  educationalQualification: string;
  religion: string;
  category: string;
  minority: string;
  specialAbility: string;
  disabilityType?: string;
  areaType: string;
  interestedOutOfRajasthan?: string;

  // Step 2: Address & Contact Details
  permHouseNo: string;
  permStreet: string;
  permWard: string;
  permCity: string;
  permDistrict: string;
  permBlock: string;
  permTehsil: string;
  permMunicipality: string;
  permPincode: string;
  permAssembly: string;
  permParliament: string;

  isAddressSame: boolean;

  commHouseNo: string;
  commStreet: string;
  commWard: string;
  commCity: string;
  commDistrict: string;
  commBlock: string;
  commTehsil: string;
  commMunicipality: string;
  commPincode: string;

  mobileNo: string;
  altMobileNo: string;
  landlineNo: string;
  email: string;

  // Step 3: Bank, Economic & Worker Details
  bankAccountNo: string;
  bankAccountName: string;
  bankAccountType: string;
  bankName: string;
  bankBranch: string;
  ifscCode: string;
  micrCode: string;

  annualFamilyIncome: number | string;
  incomeSlab: string;
  economicStatus: string;
  economicCardNo: string;

  bocwWorker: string;
  bocwNo: string;
  mgnregaWorker: string;
  mgnregaNo: string;
  isRsby: string;
  rsbyNo: string;
  gramsabhaPip: string;
  nrlmMember: string;
  nrlmNo: string;

  epicNo: string;

  // Step 4: Sector Preference, Photo & Documents
  preferredSectors: string[];
  candidatePhotoUrl?: string;
  candidatePhotoName?: string;
  documents: AspirantDocumentItem[];
}

export function calculateAgeFromDob(dobString: string): number {
  if (!dobString) return 0;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : 0;
}

/**
 * Step 1: Personal & Identity Details Form Fields
 */
export function getStep1PersonalFields(
  onDobChange?: (dob: string, model: any) => void,
  aadhaarTemplateRef?: any
): FormFieldConfig[] {
  return [
    // Identity Details Header
    {
      key: 'identityHeading',
      label: 'IDENTITY DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'aadhaarNo',
      label: 'Aadhaar No.',
      type: 'text',
      required: true,
      requiredMessage: 'Aadhaar number is mandatory',
      maxLength: 12,
      placeholder: '12 digit Aadhaar number',
      colSpan: 2
    },
    {
      key: 'aadhaarDocProof',
      label: 'Aadhaar Card Document Proof',
      type: 'custom',
      colSpan: 2,
      template: aadhaarTemplateRef
    },
    {
      key: 'janaadhaarId',
      label: 'Janaadhaar ID',
      type: 'text',
      maxLength: 10,
      placeholder: '10 digit Jan Aadhaar ID',
      colSpan: 1
    },
    {
      key: 'otherIdType',
      label: 'Other IDs',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'None', value: 'None' },
        { label: 'PAN Card', value: 'PAN Card' },
        { label: 'Voter ID (EPIC)', value: 'Voter ID' },
        { label: 'Driving License', value: 'Driving License' },
        { label: 'Passport', value: 'Passport' },
        { label: 'Ration Card', value: 'Ration Card' }
      ]
    },
    {
      key: 'otherIdNo',
      label: (m: any) => {
        const type = m?.otherIdType;
        if (!type || type === 'None') return 'Other ID Nos.';
        if (type === 'PAN Card' || type.toLowerCase().includes('pan')) return 'PAN';
        if (type.toLowerCase().includes('voter')) return 'Voter ID';
        if (type.toLowerCase().includes('driving')) return 'Driving License';
        if (type.toLowerCase().includes('passport')) return 'Passport';
        if (type.toLowerCase().includes('ration')) return 'Ration Card';
        return `${type}`;
      },
      placeholder: (m: any) => {
        const type = m?.otherIdType;
        if (type === 'PAN Card' || type?.toLowerCase().includes('pan')) return 'Enter 10-digit PAN (e.g. ABCDE1234F)';
        if (type === 'Voter ID') return 'Enter Voter ID number';
        if (type === 'Driving License') return 'Enter Driving License number';
        if (type === 'Passport') return 'Enter Passport number';
        if (type === 'Ration Card') return 'Enter Ration Card number';
        return 'Enter document number';
      },
      type: 'text',
      colSpan: 2,
      visible: (m) => m.otherIdType && m.otherIdType !== 'None'
    },

    // Aspirant Details Header
    {
      key: 'aspirantHeading',
      label: 'ASPIRANT DEMOGRAPHIC PARTICULARS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'aspirantName',
      label: 'Name of Aspirant',
      type: 'text',
      required: true,
      requiredMessage: 'Aspirant name is mandatory',
      placeholder: 'Candidate full name as per Aadhaar',
      colSpan: 2
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      requiredMessage: 'Gender is mandatory',
      colSpan: 1,
      options: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Transgender', value: 'Transgender' }
      ]
    },
    {
      key: 'relationType',
      label: 'Select Relation',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Father (S/o, D/o)', value: 'Father' },
        { label: 'Husband (W/o)', value: 'Husband' },
        { label: 'Mother', value: 'Mother' },
        { label: 'Guardian', value: 'Guardian' }
      ]
    },
    {
      key: 'relationName',
      label: "Father's / Husband's / Guardian Name",
      type: 'text',
      required: true,
      requiredMessage: 'Relative name is mandatory',
      placeholder: 'Relative full name',
      colSpan: 2
    },
    {
      key: 'motherName',
      label: "Mother's Name",
      type: 'text',
      placeholder: 'Mother full name',
      colSpan: 2
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      type: 'date',
      required: true,
      requiredMessage: 'Date of birth is mandatory',
      colSpan: 1,
      onChange: (val, field, model) => {
        model.age = calculateAgeFromDob(val);
        if (onDobChange) onDobChange(val, model);
      }
    },
    {
      key: 'age',
      label: 'Age',
      type: 'number',
      readonly: true,
      suffixText: 'Yrs',
      hint: 'Auto-calculated from DOB',
      colSpan: 1
    },
    {
      key: 'educationalQualification',
      label: 'Educational Qualification',
      type: 'select',
      required: true,
      requiredMessage: 'Educational qualification is mandatory',
      colSpan: 2,
      options: [
        { label: 'Below 8th Standard', value: 'Below 8th' },
        { label: '8th Standard Pass', value: '8th Pass' },
        { label: '10th Standard Pass (Matriculation)', value: '10th Pass' },
        { label: '12th Standard Pass (Senior Secondary)', value: '12th Pass' },
        { label: 'ITI Certificate Holder', value: 'ITI' },
        { label: 'Polytechnic Diploma', value: 'Diploma' },
        { label: 'Graduate (B.A / B.Sc / B.Com / B.Tech)', value: 'Graduate' },
        { label: 'Post Graduate (M.A / M.Sc / M.Tech)', value: 'Post Graduate' }
      ]
    },
    {
      key: 'religion',
      label: 'Religion',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Hindu', value: 'Hindu' },
        { label: 'Muslim', value: 'Muslim' },
        { label: 'Sikh', value: 'Sikh' },
        { label: 'Christian', value: 'Christian' },
        { label: 'Jain', value: 'Jain' },
        { label: 'Buddhist', value: 'Buddhist' },
        { label: 'Other', value: 'Other' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'General', value: 'General' },
        { label: 'OBC (Other Backward Class)', value: 'OBC' },
        { label: 'SC (Scheduled Caste)', value: 'SC' },
        { label: 'ST (Scheduled Tribe)', value: 'ST' },
        { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
        { label: 'MBC (Most Backward Class)', value: 'MBC' }
      ]
    },
    {
      key: 'minority',
      label: 'Minority',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'specialAbility',
      label: 'Person with Special Ability (PwD)',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'disabilityType',
      label: 'Disability Type',
      type: 'select',
      colSpan: 1,
      visible: (m) => m.specialAbility === 'Yes',
      options: [
        { label: 'Locomotor Disability', value: 'Locomotor' },
        { label: 'Visual Impairment', value: 'Visual' },
        { label: 'Hearing Impairment', value: 'Hearing' },
        { label: 'Intellectual Disability', value: 'Intellectual' },
        { label: 'Multiple Disabilities', value: 'Multiple' }
      ]
    },
    {
      key: 'areaType',
      label: 'Rural / Urban',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Rural', value: 'Rural' },
        { label: 'Urban', value: 'Urban' }
      ]
    }
  ];
}

/**
 * Step 2: Permanent Address Form Fields
 */
export function getStep2PermanentAddressFields(): FormFieldConfig[] {
  const districtOptions: FormOption[] = RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }));

  return [
    // Permanent Address Header
    {
      key: 'permHeading',
      label: 'PERMANENT ADDRESS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'permHouseNo',
      label: 'House No.',
      type: 'text',
      placeholder: 'e.g. 14-B',
      colSpan: 1
    },
    {
      key: 'permStreet',
      label: 'Street / Colony Name',
      type: 'text',
      placeholder: 'Street, Mohalla or Colony',
      colSpan: 2
    },
    {
      key: 'permWard',
      label: 'Ward No.',
      type: 'text',
      placeholder: 'Ward number',
      colSpan: 1
    },
    {
      key: 'permCity',
      label: 'Village / Town / City Name',
      type: 'text',
      required: true,
      requiredMessage: 'Village/Town/City is mandatory',
      placeholder: 'Village, Town or City',
      colSpan: 1
    },
    {
      key: 'permDistrict',
      label: 'District',
      type: 'select',
      required: true,
      colSpan: 1,
      options: districtOptions
    },
    {
      key: 'permBlock',
      label: 'Block Name',
      type: 'text',
      required: true,
      requiredMessage: 'Block name is mandatory',
      placeholder: 'Development Block',
      colSpan: 1
    },
    {
      key: 'permTehsil',
      label: 'Tehsil',
      type: 'text',
      required: true,
      requiredMessage: 'Tehsil is mandatory',
      placeholder: 'Revenue Tehsil',
      colSpan: 1
    },
    {
      key: 'permMunicipality',
      label: 'Municipality / Panchayat Samiti',
      type: 'text',
      required: true,
      placeholder: 'Panchayat Samiti / Municipality',
      colSpan: 1
    },
    {
      key: 'permPincode',
      label: 'Pincode',
      type: 'text',
      required: true,
      maxLength: 6,
      placeholder: '6 digit Pincode',
      colSpan: 1
    },
    {
      key: 'permAssembly',
      label: 'Assembly Constituency',
      type: 'text',
      required: true,
      placeholder: 'Vidhan Sabha area',
      colSpan: 1
    },
    {
      key: 'permParliament',
      label: 'Parliament Constituency',
      type: 'text',
      required: true,
      placeholder: 'Lok Sabha constituency',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Communication Address Form Fields (without header so header + checkbox can be rendered in template)
 */
export function getStep2CommAddressFields(): FormFieldConfig[] {
  const districtOptions: FormOption[] = RAJASTHAN_DISTRICTS.map(d => ({ label: d, value: d }));

  return [
    {
      key: 'commHouseNo',
      label: 'House No.',
      type: 'text',
      placeholder: 'e.g. 14-B',
      colSpan: 1
    },
    {
      key: 'commStreet',
      label: 'Street Name',
      type: 'text',
      placeholder: 'Street, Mohalla or Colony',
      colSpan: 2
    },
    {
      key: 'commWard',
      label: 'Ward No.',
      type: 'text',
      placeholder: 'Ward number',
      colSpan: 1
    },
    {
      key: 'commCity',
      label: 'Village / Town / City Name',
      type: 'text',
      required: true,
      placeholder: 'Village, Town or City',
      colSpan: 1
    },
    {
      key: 'commDistrict',
      label: 'District',
      type: 'select',
      required: true,
      colSpan: 1,
      options: districtOptions
    },
    {
      key: 'commBlock',
      label: 'Block Name',
      type: 'text',
      required: true,
      placeholder: 'Development Block',
      colSpan: 1
    },
    {
      key: 'commTehsil',
      label: 'Tehsil',
      type: 'text',
      required: true,
      placeholder: 'Revenue Tehsil',
      colSpan: 1
    },
    {
      key: 'commMunicipality',
      label: 'Municipality / Panchayat Samiti',
      type: 'text',
      required: true,
      placeholder: 'Panchayat Samiti / Municipality',
      colSpan: 1
    },
    {
      key: 'commPincode',
      label: 'Pincode',
      type: 'text',
      required: true,
      maxLength: 6,
      placeholder: '6 digit Pincode',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Contact Details Form Fields
 */
export function getStep2ContactFields(): FormFieldConfig[] {
  return [
    // Contact Details Header
    {
      key: 'contactHeading',
      label: 'CONTACT DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'mobileNo',
      label: 'Mobile Number',
      type: 'tel',
      required: true,
      requiredMessage: 'Mobile number is mandatory',
      prefixText: '+91',
      maxLength: 10,
      placeholder: '10 digit mobile number',
      colSpan: 1
    },
    {
      key: 'altMobileNo',
      label: 'Alternate Mobile Number',
      type: 'tel',
      prefixText: '+91',
      maxLength: 10,
      placeholder: 'Secondary contact number',
      colSpan: 1
    },
    {
      key: 'landlineNo',
      label: 'Landline Number',
      type: 'tel',
      placeholder: 'STD Code - Landline No.',
      colSpan: 1
    },
    {
      key: 'email',
      label: 'Email Id (if any)',
      type: 'email',
      placeholder: 'aspirant@email.com',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Address Details & Contact Form Fields (Full combined list)
 */
export function getStep2AddressFields(): FormFieldConfig[] {
  return [
    ...getStep2PermanentAddressFields(),
    {
      key: 'commHeading',
      label: 'COMMUNICATION / CORRESPONDENCE ADDRESS',
      type: 'heading',
      colSpan: 'full'
    },
    ...getStep2CommAddressFields(),
    ...getStep2ContactFields()
  ];
}

/**
 * Step 3: Bank, Family / Economic & Worker Details Form Fields
 */
export function getStep3EconomicWorkerFields(): FormFieldConfig[] {
  return [
    // Bank Details Header
    {
      key: 'bankHeading',
      label: 'BANK ACCOUNT DETAILS (FOR DBT & STIPEND)',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'bankAccountNo',
      label: 'Account No',
      type: 'text',
      placeholder: 'Bank savings account number',
      colSpan: 1
    },
    {
      key: 'bankAccountName',
      label: 'Account Name',
      type: 'text',
      placeholder: 'Full name as per passbook',
      colSpan: 1
    },
    {
      key: 'bankAccountType',
      label: 'Account Type',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'Savings Account', value: 'Savings' },
        { label: 'Current Account', value: 'Current' },
        { label: 'Jan Dhan Account (PMJDY)', value: 'Jan Dhan' }
      ]
    },
    {
      key: 'bankName',
      label: 'Bank Name',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'State Bank of India (SBI)', value: 'State Bank of India' },
        { label: 'Punjab National Bank (PNB)', value: 'Punjab National Bank' },
        { label: 'Bank of Baroda', value: 'Bank of Baroda' },
        { label: 'Canara Bank', value: 'Canara Bank' },
        { label: 'Union Bank of India', value: 'Union Bank of India' },
        { label: 'HDFC Bank', value: 'HDFC Bank' },
        { label: 'ICICI Bank', value: 'ICICI Bank' },
        { label: 'Rajasthan Marudhara Gramin Bank', value: 'Rajasthan Marudhara Gramin Bank' },
        { label: 'Baroda Rajasthan Kshetriya Gramin Bank', value: 'BRKGB' },
        { label: 'Other Scheduled Commercial Bank', value: 'Other' }
      ]
    },
    {
      key: 'bankBranch',
      label: 'Bank Branch',
      type: 'text',
      placeholder: 'Branch location',
      colSpan: 1
    },
    {
      key: 'ifscCode',
      label: 'IFSC Code',
      type: 'text',
      uppercase: true,
      maxLength: 11,
      placeholder: 'e.g. SBIN0001234',
      colSpan: 1
    },
    {
      key: 'micrCode',
      label: 'MICR Code',
      type: 'text',
      maxLength: 9,
      placeholder: '9 digit MICR',
      colSpan: 1
    },

    // Family / Economic Details Header
    {
      key: 'economicHeading',
      label: 'FAMILY / ECONOMIC PARTICULARS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'annualFamilyIncome',
      label: 'Annual Family Income',
      type: 'number',
      required: true,
      prefixText: '₹',
      placeholder: 'e.g. 120000',
      colSpan: 1
    },
    {
      key: 'incomeSlab',
      label: 'Income Slab (Annual Slab)',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'Below ₹50,000', value: 'Below 50K' },
        { label: '₹50,001 - ₹1,00,000', value: '50K-1L' },
        { label: '₹1,00,001 - ₹2,50,000', value: '1L-2.5L' },
        { label: '₹2,50,001 - ₹5,00,000', value: '2.5L-5L' },
        { label: 'Above ₹5,00,000', value: 'Above 5L' }
      ]
    },
    {
      key: 'economicStatus',
      label: 'Economic Status',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'APL (Above Poverty Line)', value: 'APL' },
        { label: 'BPL (Below Poverty Line)', value: 'BPL' },
        { label: 'State BPL', value: 'State BPL' },
        { label: 'Antyodaya Anna Yojana (AAY)', value: 'Antyodaya' },
        { label: 'General / Non-BPL', value: 'General' }
      ]
    },
    {
      key: 'economicCardNo',
      label: 'Economic Status Card No.',
      type: 'text',
      placeholder: 'Ration / BPL card number',
      colSpan: 1
    },

    // Government / Worker Details Header
    {
      key: 'workerHeading',
      label: 'GOVERNMENT / WORKER PARTICULARS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'bocwWorker',
      label: 'BoCW Worker',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'bocwNo',
      label: 'BoCW No.',
      type: 'text',
      placeholder: 'BoCW registration number',
      colSpan: 1,
      visible: (m) => m.bocwWorker === 'Yes'
    },
    {
      key: 'mgnregaWorker',
      label: 'MGNREGA Worker',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'mgnregaNo',
      label: 'MGNREGA No.',
      type: 'text',
      placeholder: 'Job card registration number',
      colSpan: 1,
      visible: (m) => m.mgnregaWorker === 'Yes'
    },
    {
      key: 'isRsby',
      label: 'Is RSBY?',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'rsbyNo',
      label: 'RSBY No.',
      type: 'text',
      placeholder: 'RSBY smart card number',
      colSpan: 1,
      visible: (m) => m.isRsby === 'Yes'
    },
    {
      key: 'gramsabhaPip',
      label: 'Gramsabha/PIP',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'nrlmMember',
      label: 'NRLM SHG Member',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'No', value: 'No' },
        { label: 'Yes', value: 'Yes' }
      ]
    },
    {
      key: 'nrlmNo',
      label: 'NRLM No. of SHG Member',
      type: 'text',
      placeholder: 'Self Help Group membership ID',
      colSpan: 1,
      visible: (m) => m.nrlmMember === 'Yes'
    },

    // Electoral Details Header
    {
      key: 'electoralHeading',
      label: 'ELECTORAL DETAILS',
      type: 'heading',
      colSpan: 'full'
    },
    {
      key: 'epicNo',
      label: 'EPIC No.',
      type: 'text',
      uppercase: true,
      placeholder: 'Voter ID card number (e.g. RJ/01/001/123456)',
      colSpan: 2
    }
  ];
}
