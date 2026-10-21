/** Dummy SSO directory: what the SSO returns for an SSO ID. Replace with the real SSO lookup later. */
export interface SsoProfile {
  ssoId: string;
  name: string;
  mobile: string;
  email: string;
  designation: string;
  department: string;
}

export const SSO_USERS: SsoProfile[] = [
  {
    ssoId: 'CENTERHEAD1',
    name: 'Center Head 1',
    mobile: '9876500001',
    email: 'center.head1@example.com',
    designation: 'Center Manager',
    department: 'Skill Development'
  },
  {
    ssoId: 'CENTERHEAD2',
    name: 'Center Head 2',
    mobile: '9876500002',
    email: 'center.head2@example.com',
    designation: 'Center Manager',
    department: 'Skill Development'
  },
  {
    ssoId: 'FACULTY1',
    name: 'Faculty 1',
    mobile: '9876500011',
    email: 'faculty1@example.com',
    designation: 'Trainer',
    department: 'Skill Development'
  },
  {
    ssoId: 'FACULTY2',
    name: 'Faculty 2',
    mobile: '9876500012',
    email: 'faculty2@example.com',
    designation: 'Trainer',
    department: 'Skill Development'
  },
  {
    ssoId: 'FACULTY3',
    name: 'Faculty 3',
    mobile: '9876500013',
    email: 'faculty3@example.com',
    designation: 'Trainer',
    department: 'Skill Development'
  },
  {
    ssoId: 'ATTENDER1',
    name: 'Attender 1',
    mobile: '9876500021',
    email: 'attender1@example.com',
    designation: 'Attendance Officer',
    department: 'Skill Development'
  },
  {
    ssoId: 'ATTENDER2',
    name: 'Attender 2',
    mobile: '9876500022',
    email: 'attender2@example.com',
    designation: 'Attendance Officer',
    department: 'Skill Development'
  },
  {
    ssoId: 'ATTENDER3',
    name: 'Attender 3',
    mobile: '9876500023',
    email: 'attender3@example.com',
    designation: 'Attendance Officer',
    department: 'Skill Development'
  },
  {
    ssoId: 'CENTERHEAD3',
    name: 'Center Head 3',
    mobile: '9876500003',
    email: 'center.head3@example.com',
    designation: 'Senior Trainer',
    department: 'Skill Development'
  }
];
