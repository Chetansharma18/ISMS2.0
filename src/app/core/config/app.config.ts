export interface PortalConfig {
  appName: string;
  version: string;
  stateName: string;
  departmentName: string;
  supportEmail: string;
  helplineNumber: string;
  sessionTimeoutMinutes: number;
}

export const PORTAL_CONFIG: PortalConfig = {
  appName: 'Integrated Skill Management System (ISMS 2.0)',
  version: '2.0.0',
  stateName: 'Government of Rajasthan',
  departmentName: 'Skill, Employment & Entrepreneurship Department',
  supportEmail: 'support-isms@rajasthan.gov.in',
  helplineNumber: '0141-2792600',
  sessionTimeoutMinutes: 30
};
