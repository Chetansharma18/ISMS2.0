export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  department?: string;
  tpCode?: string;
  permissions?: string[];
  sdcId?: string | null;
}

export const MOCK_USERS: User[] = [
  { id: '1', username: 'superadmin', name: 'Super Admin', role: 'SUPER_ADMIN' },
  { id: '2', username: 'deptadmin', name: 'Department Admin', role: 'DEPARTMENT_ADMIN', department: 'RSLDC' },
  { id: '3', username: 'deptuser', name: 'Department User', role: 'DEPARTMENT_USER', department: 'RSLDC' },
  { id: '4', username: 'inspector', name: 'Inspector', role: 'INSPECTOR', department: 'RSLDC' },
  { id: '5', username: 'auditor', name: 'Auditor', role: 'AUDITOR' },
  { id: '6', username: 'dm', name: 'District Manager', role: 'DM' },
  { id: '7', username: 'approver', name: 'Approval Authority', role: 'APPROVAL_AUTHORITY' },
  { id: '8', username: 'tppia', name: 'TP/PIA Admin', role: 'TP_PIA', tpCode: 'TP001' },
  {
    id: '10',
    username: 'applicant_rj',
    name: 'Approved Citizen (TP)',
    role: 'TP_PIA',
    permissions: ['create_sdc', 'create_batch', 'view_sdc', 'view_batch'],
    sdcId: null
  }
];
