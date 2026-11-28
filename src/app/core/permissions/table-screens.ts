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
  Users: { route: '/admin/users', icon: 'users', dataKey: 'USERS' },
  UserRoles: { route: '/admin/user-roles', icon: 'users-group' },
  departmentUserManagement: { route: '/admin/department-users', icon: 'users' },
  Roles: { route: '/admin/master/user-role', icon: 'shield-check', dataKey: 'USER_ROLES' },
  RolePermissions: { route: '/admin/master/permission', icon: 'shield-check', dataKey: 'PERMISSIONS' },

  // Category: own work (EOI and One Time Registration)
  /** EOI configuration: create and edit EOIs, attachments and committees. */
  EoiNotices: { route: '/admin/eoi-configuration', icon: 'clipboard' },
  /** Apply for EOI: the applicant's own EOI applications. */
  EoiApplications: {
    route: '/tenders',
    icon: 'clipboard',
    alsoGoverns: ['/scheme-form', '/tender-status'],
    /** The applicant follows each application (clarifications, result, result order, appeal) on EOI Status. */
    extraLinks: [{ key: 'eoi-status', label: 'EOI Status', route: '/tender-status', icon: 'clock' }]
  },
  /**
   * Committee review of submitted EOI applications: the EOI list first (EOI Responses), then each EOI's
   * Applicant Submissions and the Scrutiny Desk of one application.
   */
  EoiResponses: { route: '/admin/eoi-view', icon: 'clipboard', alsoGoverns: ['/admin/responses', '/admin/review', '/admin/result-orders'] },
  /** One Time Registration of the organisation. */
  OtrRegistrations: { route: '/registration', icon: 'clipboard' },
  /** OTR form builder: steps, sections and fields of the registration form. */
  OtrForm: { route: '/admin/dynamic-form-builder', icon: 'list' },
  /** Form Manager (/api/form-manager): dynamic forms and their versions, on the Dynamic Form Builder screen. */
  FormManager: { route: '/admin/dynamic-form-builder', icon: 'list' },

  // Category: transactions
  PaymentTransactions: { route: '/payment-history', icon: 'clipboard', dataKey: 'PAYMENTS' },

  // Category: master data
  EoiCategoryMasters: { route: '/admin/master/eoi-category', icon: 'list', dataKey: 'EOI_CATEGORIES' },
  SchemeMasters: { route: '/admin/master/scheme', icon: 'list', dataKey: 'SCHEME_MASTERS' },
  SchemeCategoryMasters: { route: '/admin/master/scheme-category', icon: 'list', dataKey: 'SCHEME_CATEGORIES' },
  SectorMasters: { route: '/admin/master/sector', icon: 'list', dataKey: 'SECTORS' },
  CourseMasters: { route: '/admin/master/course', icon: 'list', dataKey: 'COURSES' },
  // Districts and blocks share one screen (District / Block tabs); either permission opens it. DISTRICTS is the block list.
  DistrictMasters: { route: '/admin/master/district-block', icon: 'list', dataKey: 'DISTRICT_MASTERS' },
  BlockMasters: { route: '/admin/master/district-block', icon: 'list', dataKey: 'DISTRICTS' },
  DesignationMasters: { route: '/admin/master/designation', icon: 'list', dataKey: 'DESIGNATIONS' },
  DocMasters: { route: '/admin/master/doc', icon: 'list', dataKey: 'DOC_MASTERS' },
  AnnexureMasters: { route: '/admin/master/annexure', icon: 'list', dataKey: 'ANNEXURE_MASTERS' },
  RemarkMasters: { route: '/admin/master/remark', icon: 'list', dataKey: 'REMARK_MASTERS' },
  GradingMasters: { route: '/admin/master/grading', icon: 'list', dataKey: 'GRADING_MASTERS' }
};
