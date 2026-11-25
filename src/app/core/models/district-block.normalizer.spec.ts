import { describe, it, expect } from 'vitest';
import { toDistrictBlockItem } from './district-block.normalizer';

describe('toDistrictBlockItem', () => {
  it('maps the backend block shape', () => {
    expect(
      toDistrictBlockItem({ id: 4, name: 'Amber', code: 'JPR-AMB', isActive: true, districtId: 1, district: { name: 'Jaipur', code: 'JPR' } }, 0)
    ).toEqual({ sNo: 1, id: '4', districtName: 'Jaipur', districtCode: 'JPR', blockName: 'Amber', blockCode: 'JPR-AMB', status: 'Active' });
  });

  it('keeps the mock shape and fills missing fields with empty text', () => {
    const mock = { sNo: 2, id: 'db-1', districtName: 'Kota', districtCode: 'KTA', blockName: 'Ladpura', blockCode: 'KTA-LDP', status: 'Inactive' };
    expect(toDistrictBlockItem(mock)).toEqual(mock);
    expect(toDistrictBlockItem({ id: 9, isActive: false })).toMatchObject({ districtName: '', blockName: '', status: 'Inactive' });
  });
});
