import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { of, throwError } from 'rxjs';
import { PermissionMasterComponent } from './permission-master.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { HttpService } from '../../core/http/http.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { NotificationService } from '../../core/services/notification.service';
import { toUserRoleItem } from '../../core/models/role.normalizer';
import type { EndpointDef } from '../../core/config/api.config';

const perm = (id: number, roleId: number, tableName: string, extra: Record<string, unknown> = {}) => ({
  id,
  roleId,
  tableName,
  status: true,
  methodAllowGet: true,
  methodAllowPost: false,
  methodAllowPut: false,
  methodAllowDelete: false,
  enableInMenu: false,
  menuCallingName: null,
  ...extra
});

interface Call {
  url: string;
  method: string;
  id?: string | number;
  body?: any;
}

describe('PermissionMasterComponent (backend roles API)', () => {
  let backendRoles: any[];
  let calls: Call[];
  let refreshes = 0;

  beforeEach(() => {
    calls = [];
    backendRoles = [
      { id: 1, name: 'superAdmin', isActive: true, permissions: [perm(10, 1, 'Users', { methodAllowPut: true })] },
      { id: 2, name: 'admin', isActive: true, permissions: [perm(20, 2, 'SectorMasters', { enableInMenu: true, menuCallingName: 'Sectors' })] }
    ];
  });

  function create(): PermissionMasterComponent {
    const http = {
      call: (endpoint: EndpointDef, opts: { id?: string | number; body?: any } = {}) => {
        const url = typeof endpoint.url === 'function' ? endpoint.url(opts.id ?? '') : endpoint.url;
        calls.push({ url, method: endpoint.method, id: opts.id, body: opts.body });
        if (url === '/tablelist') return of([{ tableName: 'Users' }, { tableName: 'News' }, { tableName: 'SectorMasters' }]);
        if (endpoint.method === 'POST') {
          const roleId = Number(opts.id);
          const role = backendRoles.find(r => r.id === roleId);
          for (const p of opts.body.permissions) {
            const existing = role.permissions.find((x: any) => x.tableName === p.tableName);
            if (existing) Object.assign(existing, p);
            else role.permissions.push({ id: 100 + role.permissions.length, roleId, ...p });
          }
          return of(role);
        }
        if (endpoint.method === 'DELETE') {
          const [roleId, permId] = String(opts.id).split('/').map(Number);
          const role = backendRoles.find(r => r.id === roleId);
          role.permissions = role.permissions.filter((x: any) => x.id !== permId);
          return of(role);
        }
        return throwError(() => new Error('unexpected call ' + url));
      }
    };
    const dataEngine = {
      for: () => ({ getAll: () => of(backendRoles.map((r, i) => toUserRoleItem(r, i))) })
    };
    refreshes = 0;
    const access = { can: () => true, tables: () => [], refresh: () => refreshes++ };
    const injector = createEnvironmentInjector(
      [
        { provide: HttpService, useValue: http },
        { provide: DataEngineService, useValue: dataEngine },
        { provide: TableAccessService, useValue: access },
        NotificationService
      ],
      null as any
    );
    return runInInjectionContext(injector, () => new PermissionMasterComponent());
  }

  it('shows one row per role and table, and offers the backend table list', () => {
    const comp = create();
    expect(comp.rows().map(r => [r.roleName, r.tableName])).toEqual([
      ['superAdmin', 'Users'],
      ['admin', 'SectorMasters']
    ]);
    expect(comp.tableOptions().map(o => o.value)).toEqual(['News', 'SectorMasters', 'Users']);
    comp.filterValues.set({ role: 'admin' });
    expect(comp.roleFilter()).toBe('2');
    expect(comp.visibleRows().map(r => r.tableName)).toEqual(['SectorMasters']);
  });

  it('grants several tables to a role in one call', () => {
    const comp = create();
    comp.openAdd();
    comp.form.roleId = '2';
    comp.form.tables = ['News', 'Users'];
    comp.form.post = true;
    comp.form.enableInMenu = true;
    comp.form.menuCallingName = 'ignored for several tables';
    comp.submit();

    const post = calls.find(c => c.method === 'POST');
    expect(post?.url).toBe('/roles/2/permissions');
    expect(post?.body.permissions).toEqual([
      expect.objectContaining({ tableName: 'News', methodAllowGet: true, methodAllowPost: true, enableInMenu: true, menuCallingName: null, status: true }),
      expect.objectContaining({ tableName: 'Users', methodAllowGet: true, methodAllowPost: true })
    ]);
    expect(comp.modalOpen()).toBe(false);
    expect(comp.rows().filter(r => r.roleId === 2).map(r => r.tableName)).toEqual(['News', 'SectorMasters', 'Users']);
  });

  it('edits the menu name of one grant', () => {
    const comp = create();
    const row = comp.rows().find(r => r.tableName === 'SectorMasters')!;
    comp.openEdit(row);
    comp.form.menuCallingName = 'Sector List';
    comp.submit();
    expect(calls.find(c => c.method === 'POST')?.body.permissions).toEqual([
      expect.objectContaining({ tableName: 'SectorMasters', enableInMenu: true, menuCallingName: 'Sector List' })
    ]);
    expect(comp.rows().find(r => r.tableName === 'SectorMasters')?.menuCallingName).toBe('Sector List');
    // The signed-in user's own permissions (sidebar) reload after the change.
    expect(refreshes).toBe(1);
  });

  it('saves an access tick and the Active switch at once', () => {
    const comp = create();
    const row = comp.rows()[0];
    comp.toggleAccess(row, 'delete', { target: { checked: true } } as any);
    expect(comp.rows()[0].delete).toBe(true);

    comp.toggleStatus(comp.rows()[0]);
    expect(comp.rows()[0].status).toBe(false);
    expect(calls.filter(c => c.method === 'POST')).toHaveLength(2);
  });

  it('refuses to leave a grant without any access right', () => {
    const comp = create();
    const row = comp.rows().find(r => r.tableName === 'SectorMasters')!; // only View
    const target = { checked: false };
    comp.toggleAccess(row, 'get', { target } as any);
    expect(calls.some(c => c.method === 'POST')).toBe(false);
    expect(target.checked).toBe(true);
  });

  it('removes a grant by its id', () => {
    const comp = create();
    const original = window.confirm;
    window.confirm = () => true;
    comp.remove(comp.rows()[0]);
    window.confirm = original;
    expect(calls.find(c => c.method === 'DELETE')?.url).toBe('/roles/1/permissions/10');
    expect(comp.rows().map(r => r.tableName)).toEqual(['SectorMasters']);
  });

  it('validates the add dialog', () => {
    const comp = create();
    comp.openAdd();
    comp.submit();
    expect(comp.submitted()).toBe(true);
    expect(calls.some(c => c.method === 'POST')).toBe(false);
  });
});
