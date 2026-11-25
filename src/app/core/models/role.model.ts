export type UserRole = 'new_user' | 'existing_user' | 'dept_admin' | 'super_admin' | 'aspirant';

export interface RoleConfig {
  role: UserRole;
  label: string;
  badge: string;
  description: string;
}
