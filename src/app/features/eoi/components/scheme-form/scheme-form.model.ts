export interface EoiDocumentItem {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  isMandatory: boolean;
  status: 'uploaded' | 'pending';
  category: 'mandatory' | 'annexure' | 'remaining';
}

/** The 16 proposal documents the applicant has to upload (Step 3). */
export function createInitialEoiDocuments(): EoiDocumentItem[] {
  return [
    // 1. Mandatory Statutory Documents (6)
    {
      id: 1,
      name: 'Covering Letter (Annexure 1)',
      description: 'Official proposal submission covering letter on organization letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 2,
      name: 'Audited Financial Statements (Annexure 3)',
      description: 'CA certified balance sheet and P&L accounts for last 3 consecutive financial years',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 3,
      name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)',
      description: 'Non-judicial notary stamped anti-blacklisting undertaking',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 4,
      name: 'Statutory Compliance Self-Declaration (Annexure 7)',
      description: 'Statutory compliance self-declaration on corporate letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 5,
      name: 'Signed & Sealed EOI Document',
      description: 'Complete downloaded RFP document signed and sealed on all pages',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 6,
      name: 'Debarment Undertaking Document',
      description: 'Affidavit affirming entity is not debarred by any Central or State Govt agency',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },

    // 2. Scheme Annexures (8)
    {
      id: 7,
      name: 'Training & Placement Track Record (Annexure 5)',
      description: 'Candidate-level wage placement track record and audit certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 8,
      name: 'Active Skill Development Centres (Annexure 4)',
      description: 'Geotagged infrastructure layout and classroom verification proofs',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 9,
      name: 'Board of Directors Details (Annexure 8)',
      description: 'Board member listing, DIN, and KYC registration profiles',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 10,
      name: 'Industry Placement Tie-ups & MOUs (Annexure 9)',
      description: 'Active corporate MOUs and employer placement commitments',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 11,
      name: 'Relevant Sector Experience Proof (Annexure 10)',
      description: 'Sector specific past training delivery completion certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 12,
      name: 'District Cluster Mobilization Plan (Annexure 11)',
      description: 'District cluster prioritization and candidate outreach methodology',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 13,
      name: 'Technical Evaluation Matrix (Annexure 12)',
      description: 'Technical scoring self-assessment and qualification criteria response',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 14,
      name: 'Supporting Credentials & Accreditations (Annexure 13)',
      description: 'Additional credentials, excellence awards, and ISO accreditations',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },

    // 3. Remaining Documents (2)
    {
      id: 15,
      name: 'NSDC Stake Partner Certificate',
      description: 'NSDC equity or funded partner participation certificate',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'remaining'
    },
    {
      id: 16,
      name: 'CA Turnover Certificate with UDIN (Annexure 14)',
      description: 'Chartered Accountant certified turnover certificate with valid UDIN',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'remaining'
    }
  ];
}
