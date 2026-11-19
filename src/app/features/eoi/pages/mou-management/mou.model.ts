export interface MouDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  uploadedOn: string;
  uploadedBy: string;
}

export const INITIAL_MOU_DOCUMENTS: MouDocument[] = [
  {
    id: 'mou-doc-1',
    title: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY) - Executed MoU',
    fileName: 'Signed_MoU_MMKVY_2026.pdf',
    fileSize: '2.4 MB',
    uploadedOn: '14-Oct-2026 04:30 PM',
    uploadedBy: 'Department User'
  },
  {
    id: 'mou-doc-2',
    title: 'SAMARTH Skill Development Scheme - Signed Bipartite Agreement',
    fileName: 'Signed_MoU_SAMARTH_2026.pdf',
    fileSize: '1.9 MB',
    uploadedOn: '18-Oct-2026 11:15 AM',
    uploadedBy: 'Department User'
  },
  {
    id: 'mou-doc-3',
    title: 'Rajasthan Yuva Sambal Yojana (RYSY) - Verified Agreement',
    fileName: 'Signed_MoU_RYSY_2026.pdf',
    fileSize: '2.1 MB',
    uploadedOn: '25-Oct-2026 05:20 PM',
    uploadedBy: 'Department User'
  }
];
