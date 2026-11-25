import { resolveMock } from '../mock.config';

import { GrievanceItem, AdminGrievanceItem } from '../../models/grievance.model';

// Types live in core/models; re-exported so existing imports keep working.
export type { GrievanceItem, AdminGrievanceItem };

export const MOCK_GRIEVANCES: GrievanceItem[] = resolveMock([
  {
    sNo: 1,
    schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    submittedAt: '2026-09-27T10:15:30Z',
    title: 'Biometric Attendance Sync Delay',
    description: 'AEBAS biometric attendance punches are not reflecting in the daily attendance punch log for Batch B-26-0001.',
    issueType: 'Technical',
    attachment: 'device_sync_log.pdf',
    status: 'Open'
  },
  {
    sNo: 2,
    schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
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
    schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
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
    schemeName: 'Mukhyamantri Yuva Sambal Yojana',
    submittedAt: '2026-09-24T16:30:00Z',
    title: 'Process Inquiry',
    description: 'How long does the standard scheme approval process take after submission?',
    issueType: 'Enquire',
    attachment: 'query.pdf',
    status: 'closed',
    comments: 'Standard approval takes 3-5 business days. Your application is currently under review.'
  },
  {
    sNo: 5,
    schemeName: 'Mukhya Mantri Yuva Kaushal Yojana',
    submittedAt: '2026-09-23T11:20:00Z',
    title: 'Trainer Onboarding Verification',
    description: 'Verification of certified ToT trainer credentials is pending for Handicraft & Local Resource Based Skills sector.',
    issueType: 'Technical',
    attachment: 'trainer_cert.pdf',
    status: 'Open'
  }
]);

export const MOCK_ADMIN_GRIEVANCES: AdminGrievanceItem[] = resolveMock([
  {
    sNo: 1,
    userName: 'Alice Smith',
    schemeName: 'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
    submittedAt: '2026-09-27T10:15:30Z',
    title: 'Biometric Attendance Sync Delay',
    description: 'AEBAS biometric attendance punches are not reflecting in the daily attendance punch log for Batch B-26-0001.',
    issueType: 'Technical',
    attachment: 'device_sync_log.pdf',
    status: 'Open'
  },
  {
    sNo: 2,
    userName: 'Bob Jones',
    schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
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
    schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
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
    schemeName: 'Mukhyamantri Yuva Sambal Yojana',
    submittedAt: '2026-09-24T16:30:00Z',
    title: 'Process Inquiry',
    description: 'How long does the standard scheme approval process take after submission?',
    issueType: 'Enquire',
    attachment: 'query.pdf',
    status: 'closed',
    comments: 'Standard approval takes 3-5 business days. Your application is currently under review.'
  },
  {
    sNo: 5,
    userName: 'Vikram Singh',
    schemeName: 'Mukhya Mantri Yuva Kaushal Yojana',
    submittedAt: '2026-09-23T11:20:00Z',
    title: 'Trainer Onboarding Verification',
    description: 'Verification of certified ToT trainer credentials is pending for Handicraft & Local Resource Based Skills sector.',
    issueType: 'Technical',
    attachment: 'trainer_cert.pdf',
    status: 'Open'
  }
]);
