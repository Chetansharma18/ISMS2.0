import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeDetectorRef, createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { MasterCrudPageComponent } from './master-crud-page.component';
import { MasterCrudConfig } from './master-crud.types';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import { TableAccessService } from '../../../core/permissions/table-access.service';

interface Row {
  id: string;
  name: string;
  status?: string;
}

interface Call {
  kind: 'update' | 'setStatus';
  id: string | number;
  arg: unknown;
}

describe('MasterCrudPageComponent: Active / Inactive switch', () => {
  let calls: Call[];
  let reply: () => Observable<Row>;
  let statusEndpoint: boolean;

  const rows = (): Row[] => [
    { id: '1', name: 'Row 1', status: 'Active' },
    { id: '2', name: 'Row 2', status: 'Inactive' }
  ];

  const repo: ResourceRepository<Row> = {
    list: () => of({ items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 }),
    getAll: () => of(rows()),
    getById: () => of(rows()[0]),
    create: () => of(rows()[0]),
    update: (id, patch) => {
      calls.push({ kind: 'update', id, arg: patch });
      return reply();
    },
    delete: () => of(true),
    setStatus: (id, active) => {
      calls.push({ kind: 'setStatus', id, arg: active });
      return reply();
    }
  };

  beforeEach(() => {
    calls = [];
    statusEndpoint = true;
    reply = () => of({ id: '1', name: 'Row 1' });
  });

  function create(config: Partial<MasterCrudConfig<Row>> = {}): MasterCrudPageComponent<Row> {
    const dataEngine = {
      for: () => repo,
      isMock: () => false,
      hasStatusEndpoint: () => statusEndpoint
    };
    const injector = createEnvironmentInjector(
      [
        { provide: DataEngineService, useValue: dataEngine },
        { provide: TableAccessService, useValue: { can: () => true, canDataKey: () => true } },
        { provide: ChangeDetectorRef, useValue: { markForCheck: () => {} } }
      ],
      null as any
    );
    const comp = runInInjectionContext(injector, () => new MasterCrudPageComponent<Row>());
    comp.config = {
      dataKey: 'SECTORS',
      entityLabel: 'Row',
      title: 'Rows',
      searchPlaceholder: '',
      searchFields: ['name'],
      itemUnit: 'rows',
      columns: [{ key: 'name', label: 'Name' }],
      hasStatus: true,
      fields: [],
      createDefaults: () => ({}),
      buildPayload: () => ({}),
      ...config
    };
    comp.ngOnInit();
    return comp;
  }

  it('calls the status endpoint and changes the row once it is saved', () => {
    const comp = create();
    comp.toggleStatus(comp.items()[0]);

    expect(calls).toEqual([{ kind: 'setStatus', id: '1', arg: false }]);
    expect(comp.items()[0].status).toBe('Inactive');
    expect(comp.isStatusSaving(comp.items()[0])).toBe(false);

    comp.toggleStatus(comp.items()[1]);
    expect(calls[1]).toEqual({ kind: 'setStatus', id: '2', arg: true });
    expect(comp.items()[1].status).toBe('Active');
  });

  it('keeps the row as it was when the call fails', () => {
    reply = () => throwError(() => new Error('District is inactive'));
    const comp = create();
    comp.toggleStatus(comp.items()[0]);

    expect(comp.items()[0].status).toBe('Active');
    expect(comp.isStatusSaving(comp.items()[0])).toBe(false);
  });

  it('ignores clicks while the switch is being saved', () => {
    const pending = new Subject<Row>();
    reply = () => pending;
    const comp = create();
    comp.toggleStatus(comp.items()[0]);
    expect(comp.isStatusSaving(comp.items()[0])).toBe(true);
    comp.toggleStatus(comp.items()[0]);
    expect(calls).toHaveLength(1);
    expect(comp.items()[0].status).toBe('Active');

    pending.next({ id: '1', name: 'Row 1' });
    pending.complete();
    expect(comp.items()[0].status).toBe('Inactive');
    expect(comp.isStatusSaving(comp.items()[0])).toBe(false);
  });

  it('saves { status } with the normal update when the resource has no status endpoint', () => {
    statusEndpoint = false;
    const comp = create({ toApiPayload: (payload, current) => ({ name: current?.name, isActive: payload.status !== 'Inactive' }) });
    comp.toggleStatus(comp.items()[0]);

    expect(calls).toEqual([{ kind: 'update', id: '1', arg: { name: 'Row 1', isActive: false } }]);
    expect(comp.items()[0].status).toBe('Inactive');
  });

  it('uses the update of a screen-supplied repository (generic module page)', () => {
    const comp = create({ repository: repo });
    comp.toggleStatus(comp.items()[1]);

    expect(calls).toEqual([{ kind: 'update', id: '2', arg: { status: 'Active' } }]);
    expect(comp.items()[1].status).toBe('Active');
  });
});
