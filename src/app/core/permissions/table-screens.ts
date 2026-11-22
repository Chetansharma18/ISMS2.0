import type { TableScreen } from './permitted-tables.model';

/**
 * Backend table name (TableList.TableName) -> the frontend screen that shows it.
 *
 * Everything else about navigation is dynamic: whether a link is shown (the user has a permission on the table),
 * its label (the table name), its group and the group order (the table's category), and which buttons work
 * (the allowed methods). A permitted table that has no entry here has no screen yet, so it gets no link.
 * Add an entry when a screen for a new backend table is built.
 */
export const TABLE_SCREENS: Readonly<Record<string, TableScreen>> = {
  // Category: user and role administration
  Users: { route: '/admin/user-management', icon: 'users', dataKey: 'USERS' },
  Roles: { route: '/admin/master/user-role', icon: 'shield-check', dataKey: 'USER_ROLES' },
  RolePermissions: { route: '/admin/master/permission', icon: 'shield-check', dataKey: 'PERMISSIONS' },

  // Category: transactions
  PaymentTransactions: { route: '/payment-history', icon: 'clipboard', dataKey: 'PAYMENTS' },

  // Category: master data
  EoiCategoryMasters: { route: '/admin/master/eoi-category', icon: 'list', dataKey: 'EOI_CATEGORIES' },
  SchemeMasters: { route: '/admin/master/scheme', icon: 'list', dataKey: 'SCHEME_MASTERS' },
  SchemeCategoryMasters: { route: '/admin/master/scheme-category', icon: 'list', dataKey: 'SCHEME_CATEGORIES' },
  SectorMasters: { route: '/admin/master/sector', icon: 'list', dataKey: 'SECTORS' },
  CourseMasters: { route: '/admin/master/course', icon: 'list', dataKey: 'COURSES' },
  // Districts and blocks share one screen; either permission opens it.
  DistrictMasters: { route: '/admin/master/district-block', icon: 'list', dataKey: 'DISTRICTS' },
  BlockMasters: { route: '/admin/master/district-block', icon: 'list', dataKey: 'DISTRICTS' },
  DesignationMasters: { route: '/admin/master/designation', icon: 'list', dataKey: 'DESIGNATIONS' },
  DocMasters: { route: '/admin/master/doc', icon: 'list' },
  RemarkMasters: { route: '/admin/master/remark', icon: 'list', dataKey: 'REMARK_MASTERS' },
  GradingMasters: { route: '/admin/master/grading', icon: 'list', dataKey: 'GRADING_MASTERS' }
};
