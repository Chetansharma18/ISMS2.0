import { RoleConfig, UserRole } from '../models/role.model';

export const USER_ROLES_CONFIG: RoleConfig[] = [
  {
    role: 'new_user',
    label: 'New Applicant',
    badge: 'First Time User',
    description: 'First time applicant with incomplete OTR profile'
  },
  {
    role: 'existing_user',
    label: 'Existing Partner',
    badge: 'Registered TP/PIA',
    description: 'Registered agency with verified entity profile'
  },
  {
    role: 'dept_admin',
    label: 'Department Admin',
    badge: 'Officer Portal',
    description: 'Departmental scheme officer and scrutiny incharge'
  },
  {
    role: 'super_admin',
    label: 'Super Admin',
    badge: 'System Admin',
    description: 'State system master manager and portal controller'
  }
];

export function getRoleConfig(role: UserRole): RoleConfig | undefined {
  return USER_ROLES_CONFIG.find(r => r.role === role);
}
