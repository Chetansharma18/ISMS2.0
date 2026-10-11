import { AspirantDocumentItem } from './aspirant-form.types';

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
