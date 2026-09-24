import { UserRole } from '../models/role.model';

export interface MenuItem {
  label: string;
  route: string;
  icon?: string;
  roles?: UserRole[];
  badge?: string;
  children?: MenuItem[];
}

export const MAIN_NAV_ITEMS: MenuItem[] = [
  {
    label: 'Home',
    route: '/',
    icon: 'home'
  },
  {
    label: 'Registration (OTR)',
    route: '/registration',
    icon: 'assignment',
    roles: ['new_user', 'existing_user', 'super_admin']
  },
  {
    label: 'Active EOI',
    route: '/tenders',
    icon: 'gavel'
  },
  {
    label: 'Tender Status',
    route: '/tender-status',
    icon: 'fact_check',
    roles: ['existing_user', 'super_admin']
  },
  {
    label: 'Department EOI View',
    route: '/admin/eoi-view',
    icon: 'admin_panel_settings',
    roles: ['dept_admin', 'super_admin']
  },
  {
    label: 'Applicant Submissions',
    route: '/admin/responses',
    icon: 'inventory_2',
    roles: ['dept_admin', 'super_admin']
  },
  {
    label: 'My Profile',
    route: '/profile',
    icon: 'person'
  }
];
