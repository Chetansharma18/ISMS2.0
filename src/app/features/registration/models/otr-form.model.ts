export interface FileDoc {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'empty' | 'uploading' | 'uploaded';
  fileUrl?: string;
}

export interface FinancialYearEntry {
  year: string;         // e.g. '2025-26'
  totalTurnover: string; // in Lacs
  skillTurnover: string; // in Lacs
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

  turnOver: string;                  // legacy single-field, kept for compatibility
  financialYears: FinancialYearEntry[]; // NEW: dynamic financial year rows
  turnoverCertDoc: FileDoc | null;      // NEW: CA-certified turnover certificate
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
      financialYears: [
        { year: '2025-26', totalTurnover: '', skillTurnover: '' },
        { year: '2024-25', totalTurnover: '', skillTurnover: '' },
        { year: '2023-24', totalTurnover: '', skillTurnover: '' }
      ],
      turnoverCertDoc: null,
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

export function createExistingUserOtrData(): OtrFormData {
  return {
    step1: {
      shortName: 'RSLDC-PARTNER',
      fullName: 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.',
      natureOfEntity: 'PUBLIC LIMITED',
      registrationNumber: 'U80302RJ2022NPL079811',
      dateOfRegistration: '2022-04-15',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: {
        fileName: 'CIN_Incorporation_Cert_2022.pdf',
        fileSize: '1.8 MB',
        uploadDate: '15-Apr-2022',
        status: 'uploaded'
      },
      companyPan: 'AAACR1234F',
      panCardDoc: {
        fileName: 'Company_PAN_Verified.pdf',
        fileSize: '850 KB',
        uploadDate: '15-Apr-2022',
        status: 'uploaded'
      },
      gstRegistered: 'Yes',
      gstin: '08AAACR1234F1Z5',
      gstCertDoc: {
        fileName: 'GST_Registration_Certificate.pdf',
        fileSize: '1.2 MB',
        uploadDate: '20-Apr-2022',
        status: 'uploaded'
      },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0019284',
      msmeCertDoc: {
        fileName: 'Udyam_Certificate.pdf',
        fileSize: '950 KB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      turnOver: '450.00',
      financialYears: [
        { year: '2025-26', totalTurnover: '180.00', skillTurnover: '72.00' },
        { year: '2024-25', totalTurnover: '150.00', skillTurnover: '60.00' },
        { year: '2023-24', totalTurnover: '120.00', skillTurnover: '48.00' }
      ],
      turnoverCertDoc: {
        fileName: 'CA_Certified_Turnover_Certificate.pdf',
        fileSize: '1.3 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      blackListed: 'No',
      nsdcPartner: 'Funded Partner',
      contactNo: '0141-2700891',
      emailId: 'partner@rsldc-skill.org',
      website: 'https://rsldc-skill.org',
      registeredAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302004',
      sameAsRegistered: true,
      officeAddress: 'Plot No. 42, Institutional Area, Jhalana Doongri',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302004'
    },
    step2: [
      {
        id: 'oic-1',
        name: 'Dr. Rajesh Sharma',
        designation: 'Managing Director (MD)',
        mobileNo: '9829012345',
        emailId: 'rajesh.sharma@rsldc-skill.org',
        pan: 'ABCPS1234K',
        aadhaarNo: '987654321098',
        bhamashahNo: 'BHM889210',
        voterIdNo: 'RJ/14/098/123456',
        passportNo: 'Z9876543',
        appointmentLetterDoc: {
          fileName: 'MD_Appointment_Letter.pdf',
          fileSize: '1.1 MB',
          uploadDate: '15-Apr-2022',
          status: 'uploaded'
        },
        idProofDoc: {
          fileName: 'MD_Aadhaar_PAN.pdf',
          fileSize: '1.4 MB',
          uploadDate: '15-Apr-2022',
          status: 'uploaded'
        },
        isExpanded: true
      },
      {
        id: 'oic-2',
        name: 'Sunita Verma',
        designation: 'Operations Head',
        mobileNo: '9414098765',
        emailId: 'sunita.verma@rsldc-skill.org',
        pan: 'ABQPV5678L',
        aadhaarNo: '876543210987',
        bhamashahNo: 'BHM441092',
        voterIdNo: 'RJ/14/098/654321',
        passportNo: '',
        appointmentLetterDoc: {
          fileName: 'Operations_Head_Order.pdf',
          fileSize: '980 KB',
          uploadDate: '10-May-2022',
          status: 'uploaded'
        },
        idProofDoc: null,
        isExpanded: false
      }
    ],
    step3: {
      name: 'Vikram Singh Mehta',
      dob: '1982-08-14',
      age: '44',
      designation: 'Authorized Representative',
      pan: 'BNYPM9876Q',
      emailId: 'vikram.mehta@rsldc-skill.org',
      mobileNo: '9829154321',
      aadhaarNo: '765432109876',
      bhamashahNo: 'BHM771209',
      voterIdNo: 'RJ/14/098/987123',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'B-14, Malviya Nagar, Jaipur, Rajasthan - 302017',
      authorizationLetterDoc: {
        fileName: 'Board_Resolution_Authorization.pdf',
        fileSize: '2.1 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      },
      idProofDoc: {
        fileName: 'Auth_Signatory_ID_Proof.pdf',
        fileSize: '1.2 MB',
        uploadDate: '01-May-2022',
        status: 'uploaded'
      }
    },
    step4: {
      bankName: 'State Bank of India',
      branchName: 'Secretariat Branch, Jaipur',
      transferMode: 'RTGS / NEFT',
      accountType: 'Current',
      accountHolderName: 'Rajasthan Skill & Livelihoods Development Council Partner Ltd.',
      accountNo: '3948201948201',
      ifscCode: 'SBIN0001234',
      micrCode: '302002011',
      branchAddress: 'Government Secretariat Campus, Bhagwan Das Road, Jaipur',
      cancelledChequeDoc: {
        fileName: 'Cancelled_Cheque_Verified.pdf',
        fileSize: '850 KB',
        uploadDate: '25-Apr-2022',
        status: 'uploaded'
      }
    },
    step5DeclarationAgreed: true,
    status: 'Submitted',
    registrationId: 'RJ-OTR-2026-004819',
    submittedAt: '15-May-2022 11:30 AM'
  };
}

