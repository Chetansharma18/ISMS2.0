import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { DistrictBlockMasterComponent } from './district-block-master.component';
import { DataEngineService } from '../../core/services/data-engine.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import type { DistrictBlockMasterItem } from '../../core/models/admin-masters.model';

const DISTRICTS = [
  { id: 1, name: 'Jaipur', code: 'JPR', state: 'Rajasthan', isActive: true },
  { id: 2, name: 'Kota', code: 'KTA', state: 'Rajasthan', isActive: false }
];

const block = (id: string, districtId: number, name: string): DistrictBlockMasterItem & { districtId: number } => ({
  sNo: 1,
  id,
  districtId,
  districtName: '',
  districtCode: '',
  blockName: name,
  blockCode: name.toUpperCase(),
  status: 'Active'
});

function create(options: { tab?: string; readable?: string[] } = {}) {
  const navigations: unknown[] = [];
  const readable = options.readable ?? ['DistrictMasters', 'BlockMasters'];
  const dataEngine = {
    for: (key: string) => ({
      getAll: () => of(key === 'DISTRICT_MASTERS' ? DISTRICTS : [block('b1', 1, 'Amber'), block('b2', 1, 'Sanganer')])
    })
  };
  const injector = createEnvironmentInjector(
    [
      { provide: DataEngineService, useValue: dataEngine },
      { provide: TableAccessService, useValue: { can: (table: string) => readable.includes(table) } },
      { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap(options.tab ? { tab: options.tab } : {})) } },
      { provide: Router, useValue: { navigate: (...args: unknown[]) => (navigations.push(args), Promise.resolve(true)) } }
    ],
    null as any
  );
  const comp = runInInjectionContext(injector, () => new DistrictBlockMasterComponent());
  return { comp, navigations };
}

describe('DistrictBlockMasterComponent', () => {
  it('opens the District tab by default and the Block tab with ?tab=block', () => {
    expect(create().comp.tab()).toBe('district');
    expect(create({ tab: 'block' }).comp.tab()).toBe('block');
    expect(create().comp.tabs().map(t => t.id)).toEqual(['district', 'block']);
  });

  it('shows only the tabs whose table the user may read', () => {
    const { comp } = create({ tab: 'district', readable: ['BlockMasters'] });
    expect(comp.tabs().map(t => t.id)).toEqual(['block']);
    expect(comp.tab()).toBe('block');
  });

  it('switches tabs through the ?tab= query param', () => {
    const { comp, navigations } = create();
    comp.selectTab('block');
    expect(navigations).toHaveLength(1);
    expect((navigations[0] as [unknown[], { queryParams: unknown }])[1].queryParams).toEqual({ tab: 'block' });
    comp.selectTab('district');
    expect(navigations).toHaveLength(1);
  });

  it('adds the block counts to the districts and keeps them for the Block tab', async () => {
    const { comp } = create();
    const rows = await firstValueFrom(
      comp.districtConfig.afterLoad!(DISTRICTS.map((d, i) => comp.districtConfig.normalizer!(d, i)))
    );
    expect(rows.map(r => [r.districtName, r.blockCount, r.status])).toEqual([
      ['Jaipur', 2, 'Active'],
      ['Kota', 0, 'Inactive']
    ]);
    expect(comp.districts().map(d => d.districtName)).toEqual(['Jaipur', 'Kota']);
  });

  it('fills the district names of the blocks and offers the active districts', async () => {
    const { comp } = create({ tab: 'block' });
    const rows = await firstValueFrom(comp.blockConfig.afterLoad!([block('b1', 1, 'Amber')]));
    expect(rows[0]).toMatchObject({ blockName: 'Amber', districtName: 'Jaipur', districtCode: 'JPR' });

    const field = comp.blockConfig.fields.find(f => f.key === 'districtName');
    expect(typeof field?.options === 'function' ? field.options() : []).toEqual(['Jaipur']);
  });
});
