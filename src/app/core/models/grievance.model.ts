export type GrievanceStatus = 'Open' | 'In progress' | 'Resolved' | 'closed';
export type GrievanceIssueType = 'Enquire' | 'Technical' | 'accounts';

export interface GrievanceItem {
  sNo: number;
  submittedAt: string;
  title: string;
  description: string;
  issueType: GrievanceIssueType;
  attachment: string;
  status: GrievanceStatus;
  comments?: string;
}

export interface AdminGrievanceItem extends GrievanceItem {
  userName: string;
}
