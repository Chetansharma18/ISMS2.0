export interface FileDoc {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'empty' | 'uploading' | 'uploaded';
  fileUrl?: string;
}

export interface Step1OrgDetails {
  shortName: string;
  fullName: string;
  natureOfEntity: string;
  registrationNumber: string;
  dateOfRegistration: string;
  stateOfLegalReg: string;
  registrationCertDoc: FileDoc | null;

  companyPan: string;
  panCardDoc: FileDoc | null;
  gstRegistered: 'Yes' | 'No';
  gstin: string;
  gstCertDoc: FileDoc | null;
  msmeRegistered: 'Yes' | 'No';
  udyamNumber: string;
  msmeCertDoc: FileDoc | null;

  turnOver: string;
  blackListed: 'Yes' | 'No';
  nsdcPartner: string;
  contactNo: string;
  emailId: string;
  website: string;

  registeredAddress: string;
  registeredState: string;
  registeredDistrict: string;
  registeredPincode: string;
  sameAsRegistered: boolean;
  officeAddress: string;
  officeState: string;
  officeDistrict: string;
  officePincode: string;
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
  appointmentLetterDoc: FileDoc | null;
  idProofDoc: FileDoc | null;
  isExpanded?: boolean;
}

export interface Step3AuthorizedPerson {
  name: string;
  dob: string;
  age: string;
  designation: string;
  pan: string;
  emailId: string;
  mobileNo: string;
  aadhaarNo: string;
  bhamashahNo: string;
  voterIdNo: string;
  passportNo: string;
  state: string;
  residenceAddress: string;
  authorizationLetterDoc: FileDoc | null;
  idProofDoc: FileDoc | null;
}

export interface Step4BankDetails {
  bankName: string;
  branchName: string;
  transferMode: string;
  accountType: string;
  accountHolderName: string;
  accountNo: string;
  ifscCode: string;
  micrCode: string;
  branchAddress: string;
  cancelledChequeDoc: FileDoc | null;
}

export interface OtrFormData {
  step1: Step1OrgDetails;
  step2: OfficerInCharge[];
  step3: Step3AuthorizedPerson;
  step4: Step4BankDetails;
  step5DeclarationAgreed: boolean;
  status: 'Draft' | 'Submitted';
  registrationId?: string;
  submittedAt?: string;
}

export interface ToastInfo {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  stepNumber?: number;
}

/* ==========================================================================
   Master Constants & Dropdown Lookups
   ========================================================================== */

export const NATURE_OF_ENTITIES: string[] = [
  'SOCIETY',
  'PUBLIC LIMITED',
  'PRIVATE LIMITED',
  'GOVERNMENT ORGANIZATION',
  'TRUST',
  'NA'
];

export const DESIGNATIONS_MASTER: string[] = [
  'Managing Director (MD)',
  'Chief Executive Officer (CEO)',
  'Director / Partner',
  'President / Chairman',
  'Secretary / Trustee',
  'General Manager (GM)',
  'State Project Head',
  'Operations Head',
  'Authorized Representative',
  'Other'
];

export const STATES_MASTER: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const DISTRICTS_BY_STATE: Record<string, string[]> = {
  Rajasthan: [
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer', 'Beawar', 'Bharatpur', 
    'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh', 'Churu', 'Dausa', 'Deeg', 'Didwana-Kuchaman', 
    'Dholpur', 'Dungarpur', 'Ganganagar', 'Gangapurcity', 'Hanumangarh', 'Hindaun', 'Jaipur', 
    'Jaipur Rural', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural', 
    'Karauli', 'Kekri', 'Khairthal-Tijara', 'Kota', 'Kotputli-Behror', 'Nagaur', 'Neem Ka Thana', 
    'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand', 'Salumbar', 'Sanchore', 'Sawai Madhopur', 
    'Shahpura', 'Sikar', 'Sirohi', 'Tonk', 'Udaipur'
  ],
  Delhi: [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  Gujarat: [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad', 
    'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 
    'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 
    'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ],
  Haryana: [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram', 'Hisar', 'Jhajjar', 
    'Jind', 'Kaithal', 'Karnal', 'Kurukshetra', 'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 
    'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Gwalior', 'Indore', 'Jabalpur', 'Ujjain', 'Rewa', 'Sagar', 'Satna', 'Dewas', 'Ratlam'
  ],
  Maharashtra: [
    'Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur'
  ],
  Punjab: [
    'Amritsar', 'Bathinda', 'Faridkot', 'Jalandhar', 'Ludhiana', 'Mohali', 'Patiala', 'Hoshiarpur'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ayodhya', 'Bareilly', 'Ghaziabad', 'Gorakhpur', 'Kanpur', 'Lucknow', 'Meerut', 'Noida', 'Varanasi'
  ]
};

export const BANKS_MASTER: string[] = [
  'State Bank of India',
  'Punjab National Bank',
  'Bank of Baroda',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Canara Bank',
  'Union Bank of India',
  'Kotak Mahindra Bank',
  'IndusInd Bank',
  'Rajasthan Marudhara Gramin Bank',
  'Baroda Rajasthan Kshetriya Gramin Bank',
  'Other'
];

export const TRANSFER_MODES: string[] = ['NEFT', 'RTGS', 'IMPS'];

export const ACCOUNT_TYPES: string[] = ['Current', 'Savings', 'Other'];

export const NSDC_PARTNER_TYPES: string[] = [
  'Not Applicable',
  'Non-Funded Partner',
  'Loan Funded Partner',
  'Equity Share Partner'
];

/* ==========================================================================
   Statutory Validation Regular Expressions
   ========================================================================== */

export const REGEX = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  UDYAM: /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i,
  INDIAN_MOBILE: /^[6-9]\d{9}$/,
  INDIAN_PIN: /^[1-9]\d{5}$/,
  AADHAAR: /^\d{12}$/,
  VOTER_ID: /^[A-Z]{3}[0-9]{7}$/,
  PASSPORT: /^[A-Z]\d{7}$/i,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  MICR: /^\d{9}$/,
  BANK_ACCOUNT: /^\d{9,18}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  URL: /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i
};

export function createInitialOtrFormData(): OtrFormData {
  return {
    step1: {
      shortName: '',
      fullName: '',
      natureOfEntity: '',
      registrationNumber: '',
      dateOfRegistration: '',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: null,
      companyPan: '',
      panCardDoc: null,
      gstRegistered: 'No',
      gstin: '',
      gstCertDoc: null,
      msmeRegistered: 'No',
      udyamNumber: '',
      msmeCertDoc: null,
      turnOver: '',
      blackListed: 'No',
      nsdcPartner: 'Not Applicable',
      contactNo: '',
      emailId: '',
      website: '',
      registeredAddress: '',
      registeredState: 'Rajasthan',
      registeredDistrict: '',
      registeredPincode: '',
      sameAsRegistered: false,
      officeAddress: '',
      officeState: 'Rajasthan',
      officeDistrict: '',
      officePincode: ''
    },
    step2: [
      {
        id: 'oic-1',
        name: '',
        designation: '',
        mobileNo: '',
        emailId: '',
        pan: '',
        aadhaarNo: '',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: null,
        idProofDoc: null,
        isExpanded: true
      }
    ],
    step3: {
      name: '',
      dob: '',
      age: '',
      designation: '',
      pan: '',
      emailId: '',
      mobileNo: '',
      aadhaarNo: '',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: '',
      authorizationLetterDoc: null,
      idProofDoc: null
    },
    step4: {
      bankName: '',
      branchName: '',
      transferMode: 'NEFT',
      accountType: 'Current',
      accountHolderName: '',
      accountNo: '',
      ifscCode: '',
      micrCode: '',
      branchAddress: '',
      cancelledChequeDoc: null
    },
    step5DeclarationAgreed: false,
    status: 'Draft'
  };
}
