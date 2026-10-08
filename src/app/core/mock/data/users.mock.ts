import { resolveMock } from '../mock.config';

export interface UserManagementItem {
  sNo: number;
  id: string;
  userId: string;
  username: string;
  ssoId: string;
  userType: 'Admin' | 'Super Admin' | 'TP';
  roleType: string;
  designation?: string;
  schemeDepartment?: string;
  districtName: string;
  blockName?: string;
  email?: string;
  mobileNo?: string;
  schemeStatus: 'Active' | 'Inactive';
}

export interface MockUserItem {
  id: string;
  name: string;
  ssoId: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export const MOCK_MANAGEMENT_USERS: UserManagementItem[] = resolveMock([
  {
    sNo: 1,
    id: 'usr-1',
    userId: 'USR-1001',
    username: 'super admin 1',
    ssoId: 'SSO_SUPER_01',
    userType: 'Super Admin',
    roleType: 'super admin',
    designation: 'Managing Director',
    schemeDepartment: 'RSLDC',
    districtName: 'All Districts',
    blockName: 'All Blocks',
    email: 'superadmin1@isms.gov.in',
    mobileNo: '9829012345',
    schemeStatus: 'Active'
  },
  {
    sNo: 2,
    id: 'usr-2',
    userId: 'USR-1002',
    username: 'super admin 2',
    ssoId: 'SSO_SUPER_02',
    userType: 'Super Admin',
    roleType: 'super admin',
    designation: 'Managing Director',
    schemeDepartment: 'RSLDC',
    districtName: 'All Districts',
    blockName: 'All Blocks',
    email: 'superadmin2@isms.gov.in',
    mobileNo: '9829012346',
    schemeStatus: 'Active'
  },
  {
    sNo: 3,
    id: 'usr-3',
    userId: 'USR-1003',
    username: 'admin 1',
    ssoId: 'SSO_ADM_01',
    userType: 'Admin',
    roleType: 'scheme oc',
    designation: 'Joint Director',
    schemeDepartment: 'RSLDC',
    districtName: 'Jaipur',
    blockName: 'Amber',
    email: 'admin1@isms.gov.in',
    mobileNo: '9414098765',
    schemeStatus: 'Active'
  },
  {
    sNo: 4,
    id: 'usr-4',
    userId: 'USR-1004',
    username: 'admin 2',
    ssoId: 'SSO_ADM_02',
    userType: 'Admin',
    roleType: 'mis manager',
    designation: 'MIS Manager',
    schemeDepartment: 'Skill & Entrepreneurship',
    districtName: 'Jodhpur',
    blockName: 'Mandore',
    email: 'admin2@isms.gov.in',
    mobileNo: '9783011223',
    schemeStatus: 'Active'
  },
  {
    sNo: 5,
    id: 'usr-5',
    userId: 'USR-1005',
    username: 'admin 3',
    ssoId: 'SSO_ADM_03',
    userType: 'Admin',
    roleType: 'programmer',
    designation: 'Programmer',
    schemeDepartment: 'RSLDC',
    districtName: 'Udaipur',
    blockName: 'Girwa',
    email: 'admin3@isms.gov.in',
    mobileNo: '9828055443',
    schemeStatus: 'Active'
  },
  {
    sNo: 6,
    id: 'usr-6',
    userId: 'USR-1006',
    username: 'admin 4',
    ssoId: 'SSO_ADM_04',
    userType: 'Admin',
    roleType: 'gm',
    designation: 'General Manager',
    schemeDepartment: 'RSLDC',
    districtName: 'Ajmer',
    blockName: 'Kishangarh',
    email: 'admin4@isms.gov.in',
    mobileNo: '9828011224',
    schemeStatus: 'Active'
  },
  {
    sNo: 7,
    id: 'usr-7',
    userId: 'USR-1007',
    username: 'admin 5',
    ssoId: 'SSO_ADM_05',
    userType: 'Admin',
    roleType: 'zc',
    designation: 'Zone Coordinator',
    schemeDepartment: 'Planning Department',
    districtName: 'Kota',
    blockName: 'Ladpura',
    email: 'admin5@isms.gov.in',
    mobileNo: '9828011225',
    schemeStatus: 'Active'
  },
  {
    sNo: 8,
    id: 'usr-8',
    userId: 'USR-1008',
    username: 'tp 1',
    ssoId: 'SSO_TP_01',
    userType: 'TP',
    roleType: 'tp',
    designation: 'Training Partner / PIA',
    schemeDepartment: 'RSLDC',
    districtName: 'Jaipur',
    blockName: 'Amber',
    email: 'tp1@isms.gov.in',
    mobileNo: '9828099881',
    schemeStatus: 'Active'
  },
  {
    sNo: 9,
    id: 'usr-9',
    userId: 'USR-1009',
    username: 'tp 2',
    ssoId: 'SSO_TP_02',
    userType: 'TP',
    roleType: 'tp',
    designation: 'Training Partner / PIA',
    schemeDepartment: 'RSLDC',
    districtName: 'Jodhpur',
    blockName: 'Mandore',
    email: 'tp2@isms.gov.in',
    mobileNo: '9828099882',
    schemeStatus: 'Active'
  },
  {
    sNo: 10,
    id: 'usr-10',
    userId: 'USR-1010',
    username: 'tp 3',
    ssoId: 'SSO_TP_03',
    userType: 'TP',
    roleType: 'tp',
    designation: 'Training Partner / PIA',
    schemeDepartment: 'RSLDC',
    districtName: 'Udaipur',
    blockName: 'Girwa',
    email: 'tp3@isms.gov.in',
    mobileNo: '9828099883',
    schemeStatus: 'Active'
  }
]);

export const MOCK_USERS: MockUserItem[] = resolveMock([
  {
    id: 'user-1',
    name: 'Super Admin 1',
    ssoId: 'SSO_SUPER_01',
    email: 'admin.super1@rajasthan.gov.in',
    phone: '9829011111',
    role: 'super_admin',
    designation: 'System Administrator',
    department: 'RSLDC HQ',
    status: 'Active',
    createdAt: '2026-01-10'
  },
  {
    id: 'user-2',
    name: 'Super Admin 2',
    ssoId: 'SSO_SUPER_02',
    email: 'admin.super2@rajasthan.gov.in',
    phone: '9829022222',
    role: 'super_admin',
    designation: 'Joint Director (IT)',
    department: 'RSLDC HQ',
    status: 'Active',
    createdAt: '2026-01-15'
  },
  {
    id: 'user-3',
    name: 'Department Officer 1',
    ssoId: 'SSO_ADM_01',
    email: 'officer.mmkvy@rajasthan.gov.in',
    phone: '9829033333',
    role: 'dept_admin',
    designation: 'Scheme Officer (MMKVY)',
    department: 'Skill Schemes',
    status: 'Active',
    createdAt: '2026-02-01'
  },
  {
    id: 'user-4',
    name: 'Department Officer 2',
    ssoId: 'SSO_ADM_02',
    email: 'mis.manager@rajasthan.gov.in',
    phone: '9829044444',
    role: 'dept_admin',
    designation: 'MIS Manager',
    department: 'Monitoring & MIS',
    status: 'Active',
    createdAt: '2026-02-05'
  },
  {
    id: 'user-5',
    name: 'Apex Technical Solutions',
    ssoId: 'SSO_TP_APEX',
    email: 'contact@apexskills.com',
    phone: '9829055555',
    role: 'existing_user',
    designation: 'Authorized Representative',
    department: 'Training Partner',
    status: 'Active',
    createdAt: '2026-03-01'
  },
  {
    id: 'user-6',
    name: 'New Applicant Agency',
    ssoId: 'SSO_NEW_USER',
    email: 'applicant@newagency.org',
    phone: '9829066666',
    role: 'new_user',
    designation: 'Managing Director',
    department: 'Applicant TP',
    status: 'Active',
    createdAt: '2026-04-10'
  }
]);
