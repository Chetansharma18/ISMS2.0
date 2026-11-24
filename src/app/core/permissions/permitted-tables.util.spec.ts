import { describe, it, expect } from 'vitest';
import {
  UNGROUPED_LABEL,
  buildNavGroups,
  combinedLabel,
  tableNameFromModuleUrl,
  governingRoute,
  humanizeTableName,
  tableAllows,
  tablesByRoute,
  toPermittedTablesState
} from './permitted-tables.util';
import type { TableScreen } from './permitted-tables.model';

/** Shape of GET /api/auth/permissions. */
const RESPONSE = {
  success: true,
  userId: 1000,
  ssoid: 'RJ.ADMIN',
  roles: ['superAdmin'],
  categories: [
    { id: 2, category: 'User Management', tablesCount: 2 },
    { id: 3, category: 'Master Data', tablesCount: 3 },
    { id: 1, category: 'System', tablesCount: 1 }
  ],
  tables: [
    { tableName: 'Users', description: 'User accounts and profiles.', tableCategoryId: 2, allowedMethods: ['GET', 'PUT'], enableInMenu: true },
    { tableName: 'Roles', description: 'Security roles.', tableCategoryId: 2, allowedMethods: [], methodAllowGet: true, enableInMenu: true },
    { tableName: 'SectorMasters', description: 'Sector Master.', tableCategoryId: 3, allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'], enableInMenu: true },
    { tableName: 'DistrictMasters', description: 'District Master.', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true },
    { tableName: 'BlockMasters', description: 'Block Master.', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true },
    { tableName: 'AuditLogs', description: 'Audit logs.', tableCategoryId: 1, allowedMethods: ['GET'], enableInMenu: true },
    { tableName: 'EoiCategoryMasters', description: 'EOI Category Master.', tableCategoryId: 99, allowedMethods: ['GET'], enableInMenu: true },
    { tableName: 'GradingMasters', description: 'Grading Master.', tableCategoryId: 3, allowedMethods: ['POST'], enableInMenu: true },
    { tableName: '', allowedMethods: ['GET'] }
  ]
};

const SCREENS: Record<string, TableScreen> = {
  Users: { route: '/admin/user-management', icon: 'users' },
  Roles: { route: '/admin/master/user-role', icon: 'shield-check' },
  SectorMasters: { route: '/admin/master/sector' },
  DistrictMasters: { route: '/admin/master/district-block' },
  BlockMasters: { route: '/admin/master/district-block' },
  EoiCategoryMasters: { route: '/admin/master/eoi-category' },
  GradingMasters: { route: '/admin/master/grading' }
};

describe('permitted tables', () => {
  const state = toPermittedTablesState(RESPONSE, new Date('2026-11-21T00:00:00Z'));

  it('reads tables, methods (list or flags) and categories from the API response', () => {
    expect(state.tables.map(t => t.tableName)).toEqual([
      'Users', 'Roles', 'SectorMasters', 'DistrictMasters', 'BlockMasters', 'AuditLogs', 'EoiCategoryMasters', 'GradingMasters'
    ]);
    expect(state.tables[1].methods).toEqual(['GET']);
    expect(state.categories).toEqual([
      { id: 2, name: 'User Management' },
      { id: 3, name: 'Master Data' },
      { id: 1, name: 'System' }
    ]);
    expect(state.roles).toEqual(['superAdmin']);
    expect(toPermittedTablesState({ data: RESPONSE }).tables).toHaveLength(8);
  });

  it('checks a method on a table, ignoring case', () => {
    expect(tableAllows(state, 'users', 'PUT')).toBe(true);
    expect(tableAllows(state, 'Users', 'DELETE')).toBe(false);
    expect(tableAllows(null, 'Users', 'GET')).toBe(false);
  });

  it('lists every permitted table, grouped by category in API order', () => {
    const groups = buildNavGroups(state, SCREENS);
    expect(groups.map(g => g.label)).toEqual(['User Management', 'Master Data', 'System', UNGROUPED_LABEL]);

    expect(groups[0].items.map(i => i.label)).toEqual(['Users', 'Roles']);
    expect(groups[0].items[0]).toMatchObject({ route: '/admin/user-management', icon: 'users', title: 'User accounts and profiles.' });

    // District and Block share one screen -> one link named after both; GradingMasters has no GET -> no link.
    expect(groups[1].items.map(i => i.route)).toEqual(['/admin/master/sector', '/admin/master/district-block']);
    expect(groups[1].items[1]).toMatchObject({ label: 'District & Block Masters', tableNames: ['DistrictMasters', 'BlockMasters'] });

    // A table without a dedicated screen opens the generic module page.
    expect(groups[2].items).toEqual([expect.objectContaining({ label: 'Audit Logs', route: '/module/AuditLogs' })]);

    // Unknown category id -> "Other".
    expect(groups[3].items.map(i => i.label)).toEqual(['EOI Category Masters']);
  });

  it('shows only tables with enableInMenu, named by menuCallingName', () => {
    const menu = toPermittedTablesState({
      categories: [{ id: 2, category: 'User Management' }, { id: 3, category: 'Master Data' }],
      tables: [
        { tableName: 'Users', tableCategoryId: 2, allowedMethods: ['GET'], enableInMenu: true, menuCallingName: ' Portal Users ' },
        { tableName: 'Roles', tableCategoryId: 2, allowedMethods: ['GET'], enableInMenu: false, menuCallingName: 'Roles' },
        { tableName: 'AuditLogs', tableCategoryId: 2, allowedMethods: ['GET'] },
        { tableName: 'SectorMasters', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true, menuCallingName: null },
        { tableName: 'DistrictMasters', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true, menuCallingName: 'Districts' },
        { tableName: 'BlockMasters', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true, menuCallingName: 'Blocks' }
      ]
    });
    expect(menu.tables.find(t => t.tableName === 'Users')).toMatchObject({ inMenu: true, menuName: 'Portal Users' });
    expect(menu.tables.find(t => t.tableName === 'AuditLogs')).toMatchObject({ inMenu: false, menuName: null });

    const groups = buildNavGroups(menu, SCREENS);
    // Roles (enableInMenu false) and AuditLogs (no flag) get no link.
    expect(groups[0].items.map(i => i.label)).toEqual(['Portal Users']);
    // No menu name -> the table name made readable; a shared screen joins the menu names.
    expect(groups[1].items.map(i => i.label)).toEqual(['Sector Masters', 'Districts & Blocks']);
    // Hidden from the menu does not remove access.
    expect(tableAllows(menu, 'Roles', 'GET')).toBe(true);
  });

  it('drops a group whose tables are all hidden from the menu', () => {
    const hidden = toPermittedTablesState({
      categories: [{ id: 2, category: 'User Management' }],
      tables: [{ tableName: 'Users', tableCategoryId: 2, allowedMethods: ['GET'], enableInMenu: false }]
    });
    expect(buildNavGroups(hidden, SCREENS)).toEqual([]);
  });

  it('reads the table name from a generic module URL', () => {
    expect(tableNameFromModuleUrl('/module/AuditLogs?x=1')).toBe('AuditLogs');
    expect(tableNameFromModuleUrl('/admin/master/sector')).toBeNull();
    expect(combinedLabel(['News', 'AuditLogs'])).toBe('News & Audit Logs');
  });

  it('marks the "Own" category as top-level links with no parent group', () => {
    const own = toPermittedTablesState({
      categories: [{ id: 1, category: 'Own', tablesCount: 1 }, { id: 3, category: 'Master Data', tablesCount: 1 }],
      tables: [
        { tableName: 'Users', tableCategoryId: 1, allowedMethods: ['GET'], enableInMenu: true },
        { tableName: 'SectorMasters', tableCategoryId: 3, allowedMethods: ['GET'], enableInMenu: true }
      ]
    });
    const groups = buildNavGroups(own, SCREENS);
    expect(groups.map(g => [g.label, g.standalone])).toEqual([['Own', true], ['Master Data', false]]);
    expect(groups[0].items.map(i => i.route)).toEqual(['/admin/user-management']);
  });

  it('names tables readably', () => {
    expect(humanizeTableName('RolePermissions')).toBe('Role Permissions');
    expect(humanizeTableName('EoiCategoryMasters')).toBe('EOI Category Masters');
  });

  it('lets one permission open the extra pages its screen leads to', () => {
    const map = tablesByRoute({ EoiApplications: { route: '/tenders', alsoGoverns: ['/scheme-form'] } });
    expect(map.get('/tenders')).toEqual(['EoiApplications']);
    expect(map.get('/scheme-form')).toEqual(['EoiApplications']);
  });

  it('finds the screen route that governs a URL', () => {
    const routes = ['/admin/master/scheme', '/admin/master/scheme-category', '/payment-history'];
    expect(governingRoute('/admin/master/scheme-category?x=1', routes)).toBe('/admin/master/scheme-category');
    expect(governingRoute('/admin/master/scheme/12', routes)).toBe('/admin/master/scheme');
    expect(governingRoute('/tenders', routes)).toBeNull();
  });
});
