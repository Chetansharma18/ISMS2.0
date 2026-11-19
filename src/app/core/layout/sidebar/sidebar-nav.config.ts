import type { IconName } from '../../../shared/components/icon/icons';

/** One link of the sidebar. `key` is what `SidebarComponent.activeKey()` returns when the link is active. */
export interface NavItem {
  key: string;
  label: string;
  link: string;
  /** Icon from the shared set (shared/components/icon/icons.ts). */
  icon: IconName;
  /** Stroke width of the icon (1.75 unless stated). */
  stroke?: number;
  /** Label in medium weight. */
  bold?: boolean;
}

/** A link inside a collapsible section. */
export interface NavSubItem {
  label: string;
  link: string;
  /** Query parameters that decide which link is active (the Users / Blacklisted users pair). */
  query?: Record<string, string>;
}

const PROFILE: NavItem = { key: 'profile', label: 'Profile', link: '/profile', icon: 'user' };
const ACTIVE_SCHEMES: NavItem = { key: 'active-schemes', label: 'Active Schemes', link: '/tenders', icon: 'briefcase' };

export const ASPIRANT_NAV: NavItem[] = [
  { key: 'training-calendar', label: 'Training Calendar', link: '/training-calendar', icon: 'calendar' },
  { key: 'expressed-interest', label: 'Expressed Interest', link: '/expressed-interest', icon: 'check-circle' },
  PROFILE
];

export const DEPT_ADMIN_NAV: NavItem[] = [
  { key: 'dept-eoi-view', label: 'EOI Responses', link: '/admin/eoi-view', icon: 'document', bold: true },
  { key: 'dept-sanction-orders', label: 'Sanction Order', link: '/admin/sanction-orders', icon: 'document', bold: true },
  { key: 'dept-ipa', label: 'In-Principal Approval (IPA)', link: '/admin/ipa', icon: 'shield-check', bold: true },
  { key: 'dept-mou', label: 'MoU Management', link: '/admin/mou', icon: 'document', bold: true },
  { key: 'dept-sdc', label: 'SDC Approvals', link: '/sdc', icon: 'building' },
  { key: 'dept-batch-approvals', label: 'Batch Approvals', link: '/admin/batch-approvals', icon: 'clipboard-check', stroke: 2, bold: true },
  { key: 'dept-grievance', label: 'Grievance Management', link: '/admin/grievance', icon: 'users-group', stroke: 2 },
  { key: 'dept-camera-monitoring', label: 'Camera Monitoring', link: '/admin/camera-monitoring', icon: 'video', stroke: 2 }
];

/** Training partner who already has an approved registration. */
export const EXISTING_USER_NAV: NavItem[] = [
  ACTIVE_SCHEMES,
  { key: 'tender-status', label: 'EOI Status', link: '/tender-status', icon: 'clock' },
  { key: 'sanction-order', label: 'Sanction Order', link: '/tp/sanction-orders', icon: 'inbox' },
  { key: 'ipa', label: 'In-Principal Approval (IPA)', link: '/ipa', icon: 'document' },
  { key: 'sdc-management', label: 'SDC Management', link: '/sdcs', icon: 'building' },
  { key: 'batch-management', label: 'Batch Management', link: '/batches', icon: 'users' },
  { key: 'aspirants-management', label: 'Aspirants Management', link: '/aspirants', icon: 'identification' },
  { key: 'attendance', label: 'Attendance', link: '/attendance', icon: 'clipboard-check' },
  { key: 'tp-users', label: 'User Management', link: '/tp/users', icon: 'users-group' },
  { key: 'grievance', label: 'Grievance', link: '/grievance', icon: 'alert-triangle' },
  { key: 'payment-history', label: 'History', link: '/payment-history', icon: 'clipboard' },
  PROFILE
];

/** New user who has not finished registration yet. */
export const NEW_USER_NAV: NavItem[] = [
  ACTIVE_SCHEMES,
  { key: 'payment-history', label: 'Payment History', link: '/payment-history', icon: 'clipboard' },
  PROFILE
];

/** Super admin: EOI configuration, highlighted through `activeKey`. */
export const EOI_CONFIGURATION_NAV: NavItem = {
  key: 'admin-eoi-configuration',
  label: 'EOI Configuration',
  link: '/admin/eoi-configuration',
  icon: 'settings'
};

/** Super admin links that are highlighted by the router itself (`routerLinkActive`). */
export const ADMIN_TOOL_NAV: NavItem[] = [
  { key: 'two-step', label: 'Two step verification', link: '/admin/two-step-verification', icon: 'shield-check' },
  { key: 'form-builder', label: 'Dynamic Form Builder', link: '/admin/dynamic-form-builder', icon: 'clipboard' }
];

export const MASTER_NAV: NavSubItem[] = [
  { label: 'EOI Category Master', link: '/admin/master/eoi-category' },
  { label: 'Scheme Master', link: '/admin/master/scheme' },
  { label: 'Scheme Category Master', link: '/admin/master/scheme-category' },
  { label: 'Sector Master', link: '/admin/master/sector' },
  { label: 'Course Master', link: '/admin/master/course' },
  { label: 'District & Block Master', link: '/admin/master/district-block' },
  { label: 'Designation', link: '/admin/master/designation' },
  { label: 'Doc Master', link: '/admin/master/doc' },
  { label: 'Remark Master', link: '/admin/master/remark' },
  { label: 'Grading Master', link: '/admin/master/grading' }
];

export const USER_MANAGEMENT_NAV: NavSubItem[] = [
  { label: 'Users', link: '/admin/user-management', query: { filter: 'all' } },
  { label: 'Blacklisted users', link: '/admin/user-management', query: { filter: 'blacklisted' } },
  { label: 'Role Management', link: '/admin/master/user-role' },
  { label: 'Permission Management', link: '/admin/master/permission' }
];

/** Icons of the two collapsible sections. */
export const MASTER_ICON: IconName = 'list';
export const USER_MANAGEMENT_ICON: IconName = 'users';

/** A link that is active only when its query parameters also match. */
export const EXACT_MATCH = { exact: true, queryParams: 'exact', matrixParams: 'ignored', paths: 'exact', fragment: 'ignored' } as const;
export const DEFAULT_MATCH = { exact: false } as const;
