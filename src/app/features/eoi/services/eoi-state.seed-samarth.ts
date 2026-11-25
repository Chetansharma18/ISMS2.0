/**
 * Mock applicant responses for the SAMARTH Skill Development Scheme (SAMARTH-02),
 * so its "View" screen on the EOI Responses page is populated.
 */
import type { ApplicantResponse, DossierDocument } from './eoi-state.models';

const SCHEME_ID = 'SAMARTH-02';
const SCHEME_NAME = 'SAMARTH Skill Development Scheme';
const EOI_REF = 'RSLDC/EOI/2026/SAMARTH-02';

interface SamarthApplicantSeed {
  number: number;
  regNumber: string;
  entityType: string;
  registrationNumber: string;
  dateOfRegistration: string;
  stateOfRegistration: string;
  pan: string;
  gstin: string;
  turnover: string;
  city: string;
  address: string;
  telephone: string;
  signatory: { name: string; designation: string; pan: string; mobile: string; voterId: string };
  bank: { name: string; branch: string; accountNumber: string; ifsc: string };
  sector: string;
  courses: string;
  submissionDate: string;
  status: ApplicantResponse['status'];
  statusDisplay: string;
  scrutiny?: ApplicantResponse['scrutinyDetails'];
}

function documentsFor(number: number): DossierDocument[] {
  const base = number * 100;
  return [
    { id: `doc-${base + 1}`, title: 'Organisation Registration Certificate', fileSize: '1.2 MB PDF', category: 'Statutory', verified: true },
    { id: `doc-${base + 2}`, title: 'Organisation PAN Card', fileSize: '640 KB PDF', category: 'Taxation', verified: true },
    { id: `doc-${base + 3}`, title: 'GST Registration Certificate', fileSize: '910 KB PDF', category: 'Taxation', verified: true },
    { id: `doc-${base + 4}`, title: 'Audited Balance Sheet / Turnover Certificate', fileSize: '2.9 MB PDF · CA Certified', category: 'Financial', verified: true },
    { id: `doc-${base + 5}`, title: 'Board Resolution / Power of Attorney', fileSize: '1.4 MB PDF', category: 'Legal', verified: true },
    { id: `doc-${base + 6}`, title: 'NSDC Partner Certificate', fileSize: '1.3 MB PDF', category: 'Affiliation', verified: true },
    { id: `doc-${base + 7}`, title: 'Additional Supporting Document', fileSize: '2.4 MB PDF', category: 'Annexures', verified: true }
  ];
}

function buildSamarthResponse(seed: SamarthApplicantSeed): ApplicantResponse {
  const label = `Company ${seed.number}`;
  const domain = `company${seed.number}.org`;

  return {
    id: `APP-2024-00${seed.number}`,
    anonymousLabel: label,
    actualLegalName: label,
    regNumber: seed.regNumber,
    schemeId: SCHEME_ID,
    schemeName: SCHEME_NAME,
    eoiRefNo: EOI_REF,
    submissionDate: seed.submissionDate,
    status: seed.status,
    statusDisplay: seed.statusDisplay,
    emdFee: 75000,
    emdStatus: seed.status === 'REJECTED' ? 'REFUNDED' : 'PAID',
    processingFee: 2500,
    processingFeeStatus: 'PAID',

    organisation: {
      legalName: label,
      tradeName: label,
      entityType: seed.entityType,
      registrationNumber: seed.registrationNumber,
      dateOfRegistration: seed.dateOfRegistration,
      stateOfRegistration: seed.stateOfRegistration,
      panNumber: seed.pan,
      gstin: seed.gstin,
      turnover: seed.turnover,
      registeredAddress: seed.address,
      operationalAddress: seed.address,
      website: `www.${domain}`,
      email: `info@${domain}`,
      contactNumber: seed.telephone
    },

    authorizedSignatory: {
      name: seed.signatory.name,
      designation: seed.signatory.designation,
      email: `compliance@${domain}`,
      contactNumber: seed.signatory.mobile,
      residenceAddress: `${seed.city}, Rajasthan`,
      state: 'Rajasthan',
      pan: seed.signatory.pan,
      aadhaarNo: 'XXXX-XXXX-3307',
      typeIdProof: 'Aadhaar Card',
      idNo: 'XXXX-XXXX-3307',
      bhamashahNo: 'Not Provided',
      voterIdNo: seed.signatory.voterId,
      passportNo: 'Not Provided',
      serviceTaxNo: 'Not Provided'
    },

    bankDetails: {
      bankName: seed.bank.name,
      branchName: seed.bank.branch,
      accountHolderName: label,
      accountNumber: seed.bank.accountNumber,
      ifscCode: seed.bank.ifsc,
      accountType: 'Current Account'
    },

    trainingCentres: [
      {
        district: seed.city,
        centreName: `${label} Skill Centre ${seed.city}`,
        classrooms: 3,
        practicalRooms: 2,
        separateWashrooms: true,
        labInfrastructure: true,
        telephone: seed.telephone,
        fullAddress: seed.address
      },
      {
        district: seed.city,
        centreName: `${label} Technical Training Institute`,
        classrooms: 4,
        practicalRooms: 3,
        separateWashrooms: true,
        labInfrastructure: true,
        telephone: seed.telephone,
        fullAddress: `Industrial Area, ${seed.city}, Rajasthan`
      }
    ],

    financialYears: [
      { year: '2021 - 2022', totalTurnover: '3,10,00,000', skillTurnover: '2,80,00,000' },
      { year: '2022 - 2023', totalTurnover: '4,05,00,000', skillTurnover: '3,70,00,000' },
      { year: '2023 - 2024', totalTurnover: seed.turnover.replace('₹', ''), skillTurnover: '4,20,00,000' }
    ],

    placementTrackRecord: [
      { sector: seed.sector, year: '2022 - 2023', trained: 420, placed: 336, proofDetails: '336 verified employment letters' },
      { sector: seed.sector, year: '2023 - 2024', trained: 510, placed: 398, proofDetails: '398 verified EPF/ESI records' }
    ],

    annualActionPlan: [
      {
        district: seed.city,
        proposedSDCs: 2,
        location: seed.city.toUpperCase(),
        sectors: seed.sector,
        courses: seed.courses,
        residential: 'Both',
        batches: 8
      }
    ],

    uploadedDocuments: documentsFor(seed.number),

    scrutinyDetails: seed.scrutiny
  };
}

/** Four applicants for SAMARTH-02: two under review, one approved, one reverted with a shortfall. */
export function buildSamarthResponses(): ApplicantResponse[] {
  return [
    buildSamarthResponse({
      number: 5,
      regNumber: 'ISMS-REG-2026-5521',
      entityType: 'Company registered under Companies Act, 2013',
      registrationNumber: 'U80902RJ2017PTC056120',
      dateOfRegistration: '09/06/2017',
      stateOfRegistration: 'RAJASTHAN',
      pan: 'AAFCS5521K',
      gstin: '08AAFCS5521K1Z4',
      turnover: '₹5,35,00,000',
      city: 'Jaipur',
      address: 'B-12, Malviya Industrial Area, Jaipur, Rajasthan 302017',
      telephone: '0141-2751200',
      signatory: { name: 'RAJESH MEENA', designation: 'Managing Director', pan: 'BKRPM5521L', mobile: '9414012345', voterId: 'RJP5521077' },
      bank: { name: 'State Bank of India', branch: 'Malviya Nagar Branch, Jaipur', accountNumber: '40125587701', ifsc: 'SBIN0001451' },
      sector: 'Electronics & Hardware',
      courses: 'Field Technician Computing, Solar PV Installer',
      submissionDate: '05/09/2026 11:10 AM',
      status: 'UNDER_SCRUTINY',
      statusDisplay: 'Under Review'
    }),
    buildSamarthResponse({
      number: 6,
      regNumber: 'ISMS-REG-2026-6612',
      entityType: 'Society registered under Rajasthan Societies Registration Act',
      registrationNumber: 'SOC-JDH-2015-2210',
      dateOfRegistration: '18/02/2015',
      stateOfRegistration: 'RAJASTHAN',
      pan: 'AABAS6612M',
      gstin: '08AABAS6612M1Z8',
      turnover: '₹4,10,00,000',
      city: 'Jodhpur',
      address: 'Plot 21, Basni Industrial Area, Jodhpur, Rajasthan 342005',
      telephone: '0291-2740455',
      signatory: { name: 'KAILASH PURI', designation: 'Secretary', pan: 'CPRPK6612J', mobile: '9829023456', voterId: 'JDH6612045' },
      bank: { name: 'Punjab National Bank', branch: 'Ratanada Branch, Jodhpur', accountNumber: '3219002100045', ifsc: 'PUNB0321900' },
      sector: 'Handicraft & Artisan Skills',
      courses: 'Block Printing Artisan, Leather Craft Operator',
      submissionDate: '06/09/2026 03:40 PM',
      status: 'UNDER_SCRUTINY',
      statusDisplay: 'Under Review'
    }),
    buildSamarthResponse({
      number: 7,
      regNumber: 'ISMS-REG-2026-7740',
      entityType: 'Trust registered under Indian Trusts Act',
      registrationNumber: 'TR-KTA-2016-1187',
      dateOfRegistration: '30/11/2016',
      stateOfRegistration: 'RAJASTHAN',
      pan: 'AAATK7740P',
      gstin: '08AAATK7740P1ZB',
      turnover: '₹6,15,00,000',
      city: 'Kota',
      address: '9, Industrial Estate, Kota, Rajasthan 324005',
      telephone: '0744-2390876',
      signatory: { name: 'SUNITA VYAS', designation: 'Chief Trustee', pan: 'DPRPV7740Q', mobile: '9414098765', voterId: 'KTA7740112' },
      bank: { name: 'HDFC Bank', branch: 'Industrial Estate Branch, Kota', accountNumber: '50200041892377', ifsc: 'HDFC0000744' },
      sector: 'Fabrication & Industrial Trades',
      courses: 'Welder (Gas & Arc), Fitter Fabrication',
      submissionDate: '03/09/2026 10:25 AM',
      status: 'APPROVED',
      statusDisplay: 'Approved',
      scrutiny: {
        technicalScore: 79,
        grade: 'Grade B',
        remarks: 'Documents verified. Training infrastructure and placement record meet the scheme requirements.',
        scrutinyOfficer: 'Committee Member 2',
        decisionTimestamp: '09/09/2026 12:05 PM'
      }
    }),
    buildSamarthResponse({
      number: 8,
      regNumber: 'ISMS-REG-2026-8803',
      entityType: 'Company registered under Companies Act, 2013',
      registrationNumber: 'U74900RJ2019PTC067788',
      dateOfRegistration: '12/08/2019',
      stateOfRegistration: 'RAJASTHAN',
      pan: 'AAGCB8803R',
      gstin: '08AAGCB8803R1ZD',
      turnover: '₹3,45,00,000',
      city: 'Bikaner',
      address: '14, Karni Industrial Area, Bikaner, Rajasthan 334004',
      telephone: '0151-2250910',
      signatory: { name: 'DEEPAK SWAMI', designation: 'Director', pan: 'EQRPS8803T', mobile: '9928034567', voterId: 'BKN8803290' },
      bank: { name: 'Bank of Baroda', branch: 'Karni Industrial Area Branch, Bikaner', accountNumber: '29370200001188', ifsc: 'BARB0KARNIB' },
      sector: 'Apparel & Textile',
      courses: 'Sewing Machine Operator, Quality Checker Garments',
      submissionDate: '07/09/2026 01:55 PM',
      status: 'REVERTED',
      statusDisplay: 'Reverted',
      scrutiny: {
        technicalScore: 0,
        grade: 'Grade E',
        remarks: 'CA turnover certificate must be for FY 2023-24 with UDIN and the CA membership seal.',
        scrutinyOfficer: 'Committee Member 2',
        decisionTimestamp: '10/09/2026 11:40 AM',
        shortfall: {
          documents: ['Audited Balance Sheet / Turnover Certificate'],
          deadlineDays: 7,
          revertedAt: '10/09/2026'
        }
      }
    })
  ];
}
