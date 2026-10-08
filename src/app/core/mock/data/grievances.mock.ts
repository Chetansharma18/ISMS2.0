import { resolveMock } from '../mock.config';

export interface GrievanceItem {
  sNo: number;
  submittedAt: string;
  title: string;
  description: string;
  issueType: 'Enquire' | 'Technical' | 'accounts';
  attachment: string;
  status: 'Open' | 'In progress' | 'Resolved' | 'closed';
  comments?: string;
}

export interface AdminGrievanceItem extends GrievanceItem {
  userName: string;
}

export const MOCK_GRIEVANCES: GrievanceItem[] = resolveMock([
  {
    sNo: 1,
    submittedAt: '2026-09-27T10:15:30Z',
    title: 'Login Issue',
    description: 'Unable to login to the portal using my credentials. It shows invalid password every time.',
    issueType: 'Technical',
    attachment: 'screenshot.png',
    status: 'Open'
  },
  {
    sNo: 2,
    submittedAt: '2026-09-26T14:45:00Z',
    title: 'Payment Failure',
    description: 'Amount deducted from my bank account but the receipt was not generated on the portal.',
    issueType: 'accounts',
    attachment: 'transaction.pdf',
    status: 'In progress',
    comments: 'We have escalated this to the payment gateway provider. Expecting a resolution in 24-48 hours.'
  },
  {
    sNo: 3,
    submittedAt: '2026-09-25T09:12:00Z',
    title: 'Document Upload Error',
    description: 'Getting a 500 internal server error while uploading the Aadhar card in the profile section.',
    issueType: 'Technical',
    attachment: 'error_log.txt',
    status: 'Resolved',
    comments: 'The issue was caused by a temporary outage in our storage service. It has been fixed now. Please try again.'
  },
  {
    sNo: 4,
    submittedAt: '2026-09-24T16:30:00Z',
    title: 'Process Inquiry',
    description: 'How long does the standard scheme approval process take after submission?',
    issueType: 'Enquire',
    attachment: 'query.pdf',
    status: 'closed',
    comments: 'Standard approval takes 3-5 business days. Your application is currently under review.'
  }
]);

export const MOCK_ADMIN_GRIEVANCES: AdminGrievanceItem[] = resolveMock([
  {
    sNo: 1,
    userName: 'Alice Smith',
    submittedAt: '2026-09-27T10:15:30Z',
    title: 'Login Issue',
    description: 'Unable to login to the portal using my credentials. It shows invalid password every time.',
    issueType: 'Technical',
    attachment: 'screenshot.png',
    status: 'Open'
  },
  {
    sNo: 2,
    userName: 'Bob Jones',
    submittedAt: '2026-09-26T14:45:00Z',
    title: 'Payment Failure',
    description: 'Amount deducted from my bank account but the receipt was not generated on the portal.',
    issueType: 'accounts',
    attachment: 'transaction.pdf',
    status: 'In progress',
    comments: 'We have escalated this to the payment gateway provider. Expecting a resolution in 24-48 hours.'
  },
  {
    sNo: 3,
    userName: 'Carol White',
    submittedAt: '2026-09-25T09:12:00Z',
    title: 'Document Upload Error',
    description: 'Getting a 500 internal server error while uploading the Aadhar card in the profile section.',
    issueType: 'Technical',
    attachment: 'error_log.txt',
    status: 'Resolved',
    comments: 'The issue was caused by a temporary outage in our storage service. It has been fixed now. Please try again.'
  },
  {
    sNo: 4,
    userName: 'David Brown',
    submittedAt: '2026-09-24T16:30:00Z',
    title: 'Process Inquiry',
    description: 'How long does the standard scheme approval process take after submission?',
    issueType: 'Enquire',
    attachment: 'query.pdf',
    status: 'closed',
    comments: 'Standard approval takes 3-5 business days. Your application is currently under review.'
  }
]);
