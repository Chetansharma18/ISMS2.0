import { describe, it, expect } from 'vitest';
import {
  activeDistrictNames,
  blockConfig,
  blockPayload,
  districtConfig,
  tabFromQuery,
  toDistrictItem,
  toDistrictRequest,
  withBlockCounts
} from './district-block-master.util';
import type { DistrictMasterItem } from '../../core/models/admin-masters.model';

const district = (id: string, name: string, code: string, status: 'Active' | 'Inactive' = 'Active'): DistrictMasterItem => ({
  sNo: 1,
  id,
  districtName: name,
  districtCode: code,
  state: 'Rajasthan',
  blockCount: null,
  status
});

describe('district-block-master.util', () => {
  it('opens the tab named in ?tab=, falling back to one the user may read', () => {
    expect(tabFromQuery(null, ['district', 'block'])).toBe('district');
    expect(tabFromQuery('block', ['district', 'block'])).toBe('block');
    expect(tabFromQuery('anything', ['district', 'block'])).toBe('district');
    expect(tabFromQuery('district', ['block'])).toBe('block');
    expect(tabFromQuery('block', ['district'])).toBe('district');
  });

  it('reads a backend district and builds its request body', () => {
    expect(toDistrictItem({ id: 4, name: 'Jaipur', code: 'JPR', state: 'Rajasthan', isActive: false }, 0)).toEqual({
      sNo: 1,
      id: '4',
      districtName: 'Jaipur',
      districtCode: 'JPR',
      state: 'Rajasthan',
      blockCount: null,
      status: 'Inactive'
    });
    expect(toDistrictItem({ id: 5, name: 'Kota' }, 1)).toMatchObject({ sNo: 2, state: 'Rajasthan', status: 'Active' });

    expect(toDistrictRequest({ districtName: ' Jaipur ', districtCode: 'jpr', state: '' })).toEqual({
      name: 'Jaipur',
      code: 'JPR',
      state: 'Rajasthan'
    });
    expect(toDistrictRequest({ status: 'Inactive' })).toEqual({ isActive: false });
  });

  it('counts the blocks of each district by districtId, or by name for rows without one', () => {
    const rows = withBlockCounts(
      [district('1', 'Jaipur', 'JPR'), district('2', 'Kota', 'KTA')],
      [
        { sNo: 1, id: 'b1', districtId: 1, districtName: '', districtCode: '', blockName: 'Amber', blockCode: 'A', status: 'Active' },
        { sNo: 2, id: 'b2', districtId: 1, districtName: '', districtCode: '', blockName: 'Sanganer', blockCode: 'S', status: 'Active' },
        { sNo: 3, id: 'b3', districtName: 'kota', districtCode: 'KTA', blockName: 'Ladpura', blockCode: 'L', status: 'Active' }
      ]
    );
    expect(rows.map(r => r.blockCount)).toEqual([2, 1]);
  });

  it('offers only active districts in the block form and sends the district code with the block', () => {
    const districts = [district('1', 'Kota', 'KTA'), district('2', 'Ajmer', 'AJM'), district('3', 'Alwar', 'ALW', 'Inactive')];
    expect(activeDistrictNames(districts)).toEqual(['Ajmer', 'Kota']);

    expect(blockPayload({ blockName: 'Ladpura', blockCode: '', districtName: 'Kota' }, districts)).toEqual({
      blockName: 'Ladpura',
      blockCode: 'KTA-LAD',
      districtName: 'Kota',
      districtCode: 'KTA'
    });
    expect(blockPayload({ blockName: 'Kishangarh', blockCode: 'ajm-ksg', districtName: 'Ajmer' }, districts).blockCode).toBe('AJM-KSG');
  });

  it('configures the District tab on /master/districts with its own permission table', () => {
    const config = districtConfig();
    expect(config.dataKey).toBe('DISTRICT_MASTERS');
    expect(config.permissionTable).toBe('DistrictMasters');
    expect(config.entityLabel).toBe('District');
    expect(config.columns.map(c => c.key)).toEqual(['sNo', 'districtName', 'districtCode', 'state', 'blockCount', 'status']);
    expect(config.fields.map(f => f.key)).toEqual(['districtName', 'districtCode', 'state']);
    expect(config.createDefaults()).toEqual({ districtName: '', districtCode: '', state: 'Rajasthan' });
    expect(config.buildPayload({ districtName: 'Bundi', districtCode: 'bnd', state: 'Rajasthan' })).toEqual({
      districtName: 'Bundi',
      districtCode: 'BND',
      state: 'Rajasthan'
    });
    expect(config.toApiPayload?.({ districtName: 'Bundi', districtCode: 'BND', state: 'Rajasthan' }, null)).toEqual({
      name: 'Bundi',
      code: 'BND',
      state: 'Rajasthan'
    });
    expect(config.columns.find(c => c.key === 'blockCount')?.format?.(null, {} as DistrictMasterItem, 0)).toBe('-');
  });

  it('configures the Block tab with a district dropdown and filter from the loaded districts', () => {
    const districts = [district('1', 'Jaipur', 'JPR'), district('2', 'Udaipur', 'UDP')];
    const config = blockConfig(() => districts);
    expect(config.dataKey).toBe('DISTRICTS');
    expect(config.permissionTable).toBe('BlockMasters');
    expect(config.entityLabel).toBe('Block');
    expect(config.columns.map(c => c.key)).toEqual(['sNo', 'blockName', 'blockCode', 'districtName', 'status']);

    const districtField = config.fields.find(f => f.key === 'districtName');
    expect(districtField?.type).toBe('select');
    expect(districtField?.required).toBe(true);
    expect(typeof districtField?.options === 'function' ? districtField.options() : []).toEqual(['Jaipur', 'Udaipur']);

    const filter = config.filters?.[0];
    expect(filter?.key).toBe('districtName');
    expect(typeof filter?.options === 'function' ? filter.options() : []).toEqual(['Jaipur', 'Udaipur']);

    expect(config.buildPayload({ blockName: 'Girwa', blockCode: '', districtName: 'Udaipur' })).toMatchObject({
      districtCode: 'UDP',
      blockCode: 'UDP-GIR'
    });
  });
});
