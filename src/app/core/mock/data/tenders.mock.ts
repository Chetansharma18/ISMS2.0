import { resolveMock } from '../mock.config';
import {
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails
} from '../../../features/registration/models/otr-form.model';

export interface SubmittedTenderDoc {
  id: number;
  name: string;
  category: 'mandatory' | 'annexure' | 'supporting';
  fileName: string;
  fileSize: string;
  status: 'uploaded' | 'pending';
}

export interface SubmittedTender {
  id: string;
  appRef: string;
  appliedDate: string;
  closingDate: string; // Last date of submission
  schemeTitle: string;
  schemeName: string;
  schemeCategory: string;
  department: string;
  emdAmount: string;
  processingFee: string;
  transactionRef: string;
  emdTransactionRef: string;
  submittedStatus: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected';
  eoiStatus: '-' | 'Under Review' | 'Reviewed' | string;
  rejectionReason?: string;
  editCount: number;
  maxEdits: number;

  orgDetails: Step1OrgDetails;
  signatoryDetails: Step3AuthorizedPerson;
  officers: OfficerInCharge[];
  bankDetails: Step4BankDetails;
  documents: SubmittedTenderDoc[];
}

export function createSampleDocs(): SubmittedTenderDoc[] {
  const docNames = [
    { id: 1, name: 'Covering Letter (Annexure 1)', category: 'mandatory' as const },
    { id: 2, name: 'Audited Financial Statements (Annexure 3)', category: 'mandatory' as const },
    { id: 3, name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)', category: 'mandatory' as const },
    { id: 4, name: 'Statutory Compliance Self-Declaration (Annexure 7)', category: 'mandatory' as const },
    { id: 5, name: 'Signed & Sealed EOI Document', category: 'mandatory' as const },
    { id: 6, name: 'Debarment Undertaking Document', category: 'mandatory' as const },
    { id: 7, name: 'Training & Placement Track Record (Annexure 5)', category: 'annexure' as const },
    { id: 8, name: 'Active Skill Development Centres (Annexure 4)', category: 'annexure' as const },
    { id: 9, name: 'Board of Directors Details (Annexure 8)', category: 'annexure' as const },
    { id: 10, name: 'Industry Placement Tie-ups & MOUs (Annexure 9)', category: 'annexure' as const },
    { id: 11, name: 'Relevant Sector Experience Proof (Annexure 10)', category: 'annexure' as const },
    { id: 12, name: 'District Cluster Mobilization Plan (Annexure 11)', category: 'annexure' as const },
    { id: 13, name: 'Technical Evaluation Matrix (Annexure 12)', category: 'annexure' as const },
    { id: 14, name: 'Supporting Credentials & Accreditations (Annexure 13)', category: 'annexure' as const },
    { id: 15, name: 'NSDC Stake Partner Certificate', category: 'supporting' as const },
    { id: 16, name: 'CA Turnover Certificate with UDIN (Annexure 14)', category: 'supporting' as const }
  ];

  return docNames.map(d => ({
    ...d,
    fileName: `Scan_Annexure_${d.id}_Signed.pdf`,
    fileSize: `${(1.1 + (d.id % 4) * 0.4).toFixed(1)} MB`,
    status: 'uploaded'
  }));
}

export const MOCK_SUBMITTED_TENDERS: SubmittedTender[] = resolveMock([
  {
    id: 't-1',
    appRef: 'APP-2024-001',
    appliedDate: '08-Sep-2026',
    closingDate: '30-Nov-2026',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    schemeName: 'MMKVY',
    schemeCategory: 'Rajvik',
    department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
    emdAmount: '₹ 50,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-RAJ-2026-981240',
    emdTransactionRef: 'GRN-RAJ-2026-981241',
    submittedStatus: 'Accepted',
    eoiStatus: 'Reviewed',
    editCount: 0,
    maxEdits: 3,
    orgDetails: {
      shortName: 'Company 1',
      fullName: 'Company 1',
      natureOfEntity: 'Private Limited Company',
      registrationNumber: 'U80302RJ2022NPL079811',
      dateOfRegistration: '14/06/2022',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: { fileName: 'Incorporation_Cert.pdf', fileSize: '1.4 MB', uploadDate: '08/09/2026', status: 'uploaded' },
      companyPan: 'AAACR1234F',
      panCardDoc: { fileName: 'Company_PAN.pdf', fileSize: '820 KB', uploadDate: '08/09/2026', status: 'uploaded' },
      gstRegistered: 'Yes',
      gstin: '08AAACR1234F1Z5',
      gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '910 KB', uploadDate: '08/09/2026', status: 'uploaded' },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0028192',
      msmeCertDoc: { fileName: 'Udyam_Cert.pdf', fileSize: '650 KB', uploadDate: '08/09/2026', status: 'uploaded' },
      turnOver: '450',
      financialYears: [
        { year: '2025-26', totalTurnover: '450', skillTurnover: '320' },
        { year: '2024-25', totalTurnover: '380', skillTurnover: '260' },
        { year: '2023-24', totalTurnover: '290', skillTurnover: '190' }
      ],
      turnoverCertDoc: { fileName: 'CA_Turnover_Certificate.pdf', fileSize: '1.1 MB', uploadDate: '08/09/2026', status: 'uploaded' },
      blackListed: 'No',
      nsdcPartner: 'Non-Funded Partner',
      contactNo: '9829154321',
      emailId: 'contact@company1.org',
      website: 'https://company1.org',
      registeredAddress: '402, Jaipur Tower, Tonk Road, Jaipur',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302015',
      sameAsRegistered: true,
      officeAddress: '402, Jaipur Tower, Tonk Road, Jaipur',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302015'
    },
    signatoryDetails: {
      name: 'Vikram Singh Mehta',
      dob: '12/08/1984',
      age: '42',
      designation: 'Managing Director / Authorized Representative',
      pan: 'AAAPM5512B',
      emailId: 'vikram.mehta@company1.org',
      mobileNo: '9829154321',
      aadhaarNo: '7845 1209 3341',
      bhamashahNo: '',
      voterIdNo: 'RJ/14/082/194821',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'B-14, Vaishali Nagar, Jaipur, Rajasthan - 302021',
      authorizationLetterDoc: { fileName: 'Board_Resolution.pdf', fileSize: '1.2 MB', uploadDate: '08/09/2026', status: 'uploaded' },
      idProofDoc: { fileName: 'Signatory_Aadhaar.pdf', fileSize: '750 KB', uploadDate: '08/09/2026', status: 'uploaded' }
    },
    officers: [
      {
        id: 'OIC-1',
        name: 'Rajesh Sharma',
        designation: 'Project Director',
        mobileNo: '9829011223',
        emailId: 'rajesh.sharma@company1.org',
        pan: 'AAAPR1122C',
        aadhaarNo: '9845 2211 4455',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: { fileName: 'Appointment_Rajesh.pdf', fileSize: '950 KB', uploadDate: '08/09/2026', status: 'uploaded' },
        idProofDoc: null
      }
    ],
    bankDetails: {
      bankName: 'State Bank of India',
      branchName: 'Tonk Road Branch, Jaipur',
      transferMode: 'NEFT / RTGS',
      accountType: 'Current Account',
      accountHolderName: 'Company 1',
      accountNo: '389102948192',
      ifscCode: 'SBIN0004120',
      micrCode: '302002018',
      branchAddress: 'Tonk Road, Jaipur - 302015',
      cancelledChequeDoc: { fileName: 'Cancelled_Cheque.pdf', fileSize: '890 KB', uploadDate: '08/09/2026', status: 'uploaded' }
    },
    documents: createSampleDocs()
  },
  {
    id: 't-2',
    appRef: 'APP-2024-002',
    appliedDate: '24-Aug-2026',
    closingDate: '15-Nov-2026',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MNSKSY)',
    schemeName: 'MNSKSY',
    schemeCategory: 'Samarth',
    department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
    emdAmount: '₹ 50,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-RAJ-2026-771829',
    emdTransactionRef: 'GRN-RAJ-2026-771830',
    submittedStatus: 'Accepted',
    eoiStatus: 'Reviewed',
    editCount: 1,
    maxEdits: 3,
    orgDetails: {
      shortName: 'Company 2',
      fullName: 'Company 2',
      natureOfEntity: 'Society / Trust',
      registrationNumber: 'REG/RAJ/2019/88129',
      dateOfRegistration: '10/02/2019',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: { fileName: 'Trust_Reg_Cert.pdf', fileSize: '1.2 MB', uploadDate: '24/08/2026', status: 'uploaded' },
      companyPan: 'AAATA4419E',
      panCardDoc: { fileName: 'Trust_PAN.pdf', fileSize: '780 KB', uploadDate: '24/08/2026', status: 'uploaded' },
      gstRegistered: 'Yes',
      gstin: '08AAATA4419E1Z8',
      gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '890 KB', uploadDate: '24/08/2026', status: 'uploaded' },
      msmeRegistered: 'No',
      udyamNumber: '',
      msmeCertDoc: null,
      turnOver: '520',
      financialYears: [
        { year: '2025-26', totalTurnover: '520', skillTurnover: '410' },
        { year: '2024-25', totalTurnover: '440', skillTurnover: '330' },
        { year: '2023-24', totalTurnover: '350', skillTurnover: '240' }
      ],
      turnoverCertDoc: { fileName: 'CA_Turnover.pdf', fileSize: '1.0 MB', uploadDate: '24/08/2026', status: 'uploaded' },
      blackListed: 'No',
      nsdcPartner: 'Funded Partner',
      contactNo: '9414019283',
      emailId: 'info@company2.org',
      website: 'https://company2.org',
      registeredAddress: 'Plot 12, Malviya Industrial Area, Jaipur',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302017',
      sameAsRegistered: true,
      officeAddress: 'Plot 12, Malviya Industrial Area, Jaipur',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302017'
    },
    signatoryDetails: {
      name: 'Dr. Rajeshwar Sharma',
      dob: '05/11/1976',
      age: '50',
      designation: 'Director / Trustee',
      pan: 'AAAPR9914L',
      emailId: 'director@company2.org',
      mobileNo: '9414019283',
      aadhaarNo: '4412 8891 0021',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'A-22, C-Scheme, Jaipur - 302001',
      authorizationLetterDoc: { fileName: 'Trust_Resolution.pdf', fileSize: '1.1 MB', uploadDate: '24/08/2026', status: 'uploaded' },
      idProofDoc: { fileName: 'Signatory_PAN.pdf', fileSize: '650 KB', uploadDate: '24/08/2026', status: 'uploaded' }
    },
    officers: [
      {
        id: 'OIC-1',
        name: 'Sunil Verma',
        designation: 'Training Head',
        mobileNo: '9414128910',
        emailId: 'sunil.verma@company2.org',
        pan: 'AAAPV8812K',
        aadhaarNo: '5521 9912 3341',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: { fileName: 'Appointment_Sunil.pdf', fileSize: '850 KB', uploadDate: '24/08/2026', status: 'uploaded' },
        idProofDoc: null
      }
    ],
    bankDetails: {
      bankName: 'HDFC Bank',
      branchName: 'C-Scheme Branch, Jaipur',
      transferMode: 'NEFT / RTGS',
      accountType: 'Current Account',
      accountHolderName: 'Company 2',
      accountNo: '50200088192014',
      ifscCode: 'HDFC0000054',
      micrCode: '302240002',
      branchAddress: 'C-Scheme, Jaipur - 302001',
      cancelledChequeDoc: { fileName: 'Cheque_HDFC.pdf', fileSize: '810 KB', uploadDate: '24/08/2026', status: 'uploaded' }
    },
    documents: createSampleDocs()
  },
  {
    id: 't-3',
    appRef: 'APP-2024-003',
    appliedDate: '14-Jul-2026',
    closingDate: '25-Oct-2026',
    schemeTitle: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    schemeName: 'MMKVY',
    schemeCategory: 'Samarth',
    department: 'Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
    emdAmount: '₹ 35,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-RAJ-2026-551920',
    emdTransactionRef: 'GRN-RAJ-2026-551921',
    submittedStatus: 'Under Review',
    eoiStatus: 'Under Review',
    editCount: 2,
    maxEdits: 3,
    orgDetails: {
      shortName: 'Company 3',
      fullName: 'Company 3',
      natureOfEntity: 'Section 8 Company',
      registrationNumber: 'U85300RJ2020NPL068192',
      dateOfRegistration: '19/08/2020',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: { fileName: 'Sec8_License.pdf', fileSize: '1.5 MB', uploadDate: '14/07/2026', status: 'uploaded' },
      companyPan: 'AAACR7718M',
      panCardDoc: { fileName: 'Company_PAN.pdf', fileSize: '820 KB', uploadDate: '14/07/2026', status: 'uploaded' },
      gstRegistered: 'Yes',
      gstin: '08AAACR7718M1Z2',
      gstCertDoc: { fileName: 'GST_Cert.pdf', fileSize: '920 KB', uploadDate: '14/07/2026', status: 'uploaded' },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0091823',
      msmeCertDoc: { fileName: 'Udyam.pdf', fileSize: '700 KB', uploadDate: '14/07/2026', status: 'uploaded' },
      turnOver: '380',
      financialYears: [
        { year: '2025-26', totalTurnover: '380', skillTurnover: '290' },
        { year: '2024-25', totalTurnover: '310', skillTurnover: '210' },
        { year: '2023-24', totalTurnover: '220', skillTurnover: '150' }
      ],
      turnoverCertDoc: { fileName: 'Turnover.pdf', fileSize: '1.2 MB', uploadDate: '14/07/2026', status: 'uploaded' },
      blackListed: 'No',
      nsdcPartner: 'Non-Funded Partner',
      contactNo: '9829001928',
      emailId: 'contact@company3.org',
      website: 'https://company3.org',
      registeredAddress: '102, RIICO Complex, Sitapura, Jaipur',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Udaipur',
      registeredPincode: '302022',
      sameAsRegistered: true,
      officeAddress: '102, RIICO Complex, Sitapura, Jaipur',
      officeState: 'Rajasthan',
      officeDistrict: 'Udaipur',
      officePincode: '302022'
    },
    signatoryDetails: {
      name: 'Manoj Kumar Mathur',
      dob: '22/04/1980',
      age: '46',
      designation: 'Chief Executive Officer',
      pan: 'AAAPM1129P',
      emailId: 'ceo@company3.org',
      mobileNo: '9829001928',
      aadhaarNo: '6612 0019 4481',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'D-88, Mansarovar, Jaipur - 302020',
      authorizationLetterDoc: { fileName: 'Board_Auth.pdf', fileSize: '1.3 MB', uploadDate: '14/07/2026', status: 'uploaded' },
      idProofDoc: { fileName: 'CEO_ID.pdf', fileSize: '800 KB', uploadDate: '14/07/2026', status: 'uploaded' }
    },
    officers: [
      {
        id: 'OIC-1',
        name: 'Pooja Agarwal',
        designation: 'Operations Lead',
        mobileNo: '9829110022',
        emailId: 'pooja.a@company3.org',
        pan: 'AAAPA9911D',
        aadhaarNo: '7781 2291 0014',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: { fileName: 'Appointment_Pooja.pdf', fileSize: '900 KB', uploadDate: '14/07/2026', status: 'uploaded' },
        idProofDoc: null
      }
    ],
    bankDetails: {
      bankName: 'ICICI Bank',
      branchName: 'Sitapura Industrial Area, Jaipur',
      transferMode: 'NEFT / RTGS',
      accountType: 'Current Account',
      accountHolderName: 'Company 3',
      accountNo: '001205018921',
      ifscCode: 'ICIC0000012',
      micrCode: '302229005',
      branchAddress: 'Sitapura, Jaipur - 302022',
      cancelledChequeDoc: { fileName: 'Cheque_ICICI.pdf', fileSize: '850 KB', uploadDate: '14/07/2026', status: 'uploaded' }
    },
    documents: createSampleDocs()
  },
  {
    id: 't-4',
    appRef: 'APP-2024-004',
    appliedDate: '20-Nov-2025',
    closingDate: '20-Nov-2025',
    schemeTitle: 'Indira Mahila Shakti Kaushal Samarthya Yojana (IM-Shakti)',
    schemeName: 'IM_Shakti',
    schemeCategory: 'Samarth',
    department: 'Ministry of Rural Development / RSLDC',
    emdAmount: '₹ 25,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-RAJ-2025-330102',
    emdTransactionRef: 'GRN-RAJ-2025-330103',
    submittedStatus: 'Rejected',
    eoiStatus: 'Reviewed',
    rejectionReason: 'Annual turnover criteria not met for last 3 financial years (CA certificate missing valid UDIN).',
    editCount: 1,
    maxEdits: 3,
    orgDetails: {
      shortName: 'Company 4',
      fullName: 'Company 4',
      natureOfEntity: 'Registered Society',
      registrationNumber: 'SOC/RAJ/2017/9912',
      dateOfRegistration: '12/03/2017',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: { fileName: 'Soc_Cert.pdf', fileSize: '1.1 MB', uploadDate: '20/11/2025', status: 'uploaded' },
      companyPan: 'AAASG8812K',
      panCardDoc: { fileName: 'PAN.pdf', fileSize: '700 KB', uploadDate: '20/11/2025', status: 'uploaded' },
      gstRegistered: 'Yes',
      gstin: '08AAASG8812K1Z4',
      gstCertDoc: { fileName: 'GST.pdf', fileSize: '800 KB', uploadDate: '20/11/2025', status: 'uploaded' },
      msmeRegistered: 'No',
      udyamNumber: '',
      msmeCertDoc: null,
      turnOver: '180',
      financialYears: [
        { year: '2024-25', totalTurnover: '180', skillTurnover: '120' },
        { year: '2023-24', totalTurnover: '150', skillTurnover: '100' },
        { year: '2022-23', totalTurnover: '110', skillTurnover: '80' }
      ],
      turnoverCertDoc: { fileName: 'Turnover_Old.pdf', fileSize: '950 KB', uploadDate: '20/11/2025', status: 'uploaded' },
      blackListed: 'No',
      nsdcPartner: 'Non-Partner',
      contactNo: '9828019283',
      emailId: 'contact@company4.org',
      website: 'https://company4.org',
      registeredAddress: 'Village Post Sanganer, Jaipur',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302029',
      sameAsRegistered: true,
      officeAddress: 'Village Post Sanganer, Jaipur',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302029'
    },
    signatoryDetails: {
      name: 'Rameshwar Lal Gurjar',
      dob: '10/01/1975',
      age: '51',
      designation: 'President',
      pan: 'AAAPG4412F',
      emailId: 'president@company4.org',
      mobileNo: '9828019283',
      aadhaarNo: '3312 9901 8841',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'Sanganer, Jaipur - 302029',
      authorizationLetterDoc: { fileName: 'Resolution.pdf', fileSize: '1.0 MB', uploadDate: '20/11/2025', status: 'uploaded' },
      idProofDoc: { fileName: 'Aadhaar.pdf', fileSize: '600 KB', uploadDate: '20/11/2025', status: 'uploaded' }
    },
    officers: [
      {
        id: 'OIC-1',
        name: 'Mukesh Sharma',
        designation: 'Center Manager',
        mobileNo: '9828112233',
        emailId: 'mukesh@company4.org',
        pan: 'AAAPM8811K',
        aadhaarNo: '8812 3341 9901',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: { fileName: 'Mukesh_Appt.pdf', fileSize: '750 KB', uploadDate: '20/11/2025', status: 'uploaded' },
        idProofDoc: null
      }
    ],
    bankDetails: {
      bankName: 'Punjab National Bank',
      branchName: 'Sanganer Branch, Jaipur',
      transferMode: 'NEFT / RTGS',
      accountType: 'Current Account',
      accountHolderName: 'Company 4',
      accountNo: '18920021008419',
      ifscCode: 'PUNB0189200',
      micrCode: '302024018',
      branchAddress: 'Sanganer, Jaipur - 302029',
      cancelledChequeDoc: { fileName: 'PNB_Cheque.pdf', fileSize: '790 KB', uploadDate: '20/11/2025', status: 'uploaded' }
    },
    documents: createSampleDocs()
  },
  {
    id: 't-5',
    appRef: 'ISMS-EOI-2026-5520',
    appliedDate: '12-Sep-2026',
    closingDate: '10-Dec-2026',
    schemeTitle: 'Rajasthan Yuva Sambal Yojana (RYSY) - Self-Employment Skilling',
    schemeName: 'RYSY',
    schemeCategory: 'Self-Employment',
    department: 'Directorate of Skill Development',
    emdAmount: '₹ 40,000',
    processingFee: '₹ 2,000',
    transactionRef: 'GRN-RAJ-2026-661520',
    emdTransactionRef: 'GRN-RAJ-2026-661521',
    submittedStatus: 'Submitted',
    eoiStatus: '-',
    editCount: 3,
    maxEdits: 3,
    orgDetails: {
      shortName: 'YuvaSkill',
      fullName: 'Yuva Skill Foundation Pvt Ltd',
      natureOfEntity: 'Private Limited Company',
      registrationNumber: 'U80903RJ2021PTC074192',
      dateOfRegistration: '05/05/2021',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: { fileName: 'COI.pdf', fileSize: '1.3 MB', uploadDate: '12/09/2026', status: 'uploaded' },
      companyPan: 'AAACY9914P',
      panCardDoc: { fileName: 'PAN.pdf', fileSize: '750 KB', uploadDate: '12/09/2026', status: 'uploaded' },
      gstRegistered: 'Yes',
      gstin: '08AAACY9914P1Z3',
      gstCertDoc: { fileName: 'GST.pdf', fileSize: '850 KB', uploadDate: '12/09/2026', status: 'uploaded' },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0033190',
      msmeCertDoc: { fileName: 'Udyam.pdf', fileSize: '620 KB', uploadDate: '12/09/2026', status: 'uploaded' },
      turnOver: '390',
      financialYears: [
        { year: '2025-26', totalTurnover: '390', skillTurnover: '300' },
        { year: '2024-25', totalTurnover: '320', skillTurnover: '240' },
        { year: '2023-24', totalTurnover: '250', skillTurnover: '180' }
      ],
      turnoverCertDoc: { fileName: 'Turnover.pdf', fileSize: '1.1 MB', uploadDate: '12/09/2026', status: 'uploaded' },
      blackListed: 'No',
      nsdcPartner: 'Non-Funded Partner',
      contactNo: '9829554433',
      emailId: 'info@yuvaskill.org',
      website: 'https://yuvaskill.org',
      registeredAddress: 'G-14, Subhash Nagar, Jaipur',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302016',
      sameAsRegistered: true,
      officeAddress: 'G-14, Subhash Nagar, Jaipur',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302016'
    },
    signatoryDetails: {
      name: 'Deepak Choudhary',
      dob: '18/07/1982',
      age: '44',
      designation: 'Managing Director',
      pan: 'AAAPC8812N',
      emailId: 'deepak@yuvaskill.org',
      mobileNo: '9829554433',
      aadhaarNo: '9901 2284 5512',
      bhamashahNo: '',
      voterIdNo: '',
      passportNo: '',
      state: 'Rajasthan',
      residenceAddress: 'Subhash Nagar, Jaipur - 302016',
      authorizationLetterDoc: { fileName: 'Auth.pdf', fileSize: '1.1 MB', uploadDate: '12/09/2026', status: 'uploaded' },
      idProofDoc: { fileName: 'ID.pdf', fileSize: '700 KB', uploadDate: '12/09/2026', status: 'uploaded' }
    },
    officers: [
      {
        id: 'OIC-1',
        name: 'Nitin Soni',
        designation: 'Coordinator',
        mobileNo: '9829887766',
        emailId: 'nitin@yuvaskill.org',
        pan: 'AAAPS4412L',
        aadhaarNo: '4419 8812 0033',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        appointmentLetterDoc: { fileName: 'Nitin_Appt.pdf', fileSize: '800 KB', uploadDate: '12/09/2026', status: 'uploaded' },
        idProofDoc: null
      }
    ],
    bankDetails: {
      bankName: 'Bank of Baroda',
      branchName: 'Subhash Nagar, Jaipur',
      transferMode: 'NEFT / RTGS',
      accountType: 'Current Account',
      accountHolderName: 'Yuva Skill Foundation Pvt Ltd',
      accountNo: '04820200001928',
      ifscCode: 'BARB0SUBHAI',
      micrCode: '302012014',
      branchAddress: 'Subhash Nagar, Jaipur - 302016',
      cancelledChequeDoc: { fileName: 'Cheque_BOB.pdf', fileSize: '820 KB', uploadDate: '12/09/2026', status: 'uploaded' }
    },
    documents: createSampleDocs()
  }
]);
