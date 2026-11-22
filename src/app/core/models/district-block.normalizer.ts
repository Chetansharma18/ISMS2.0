import type { DistrictBlockMasterItem } from './admin-masters.model';

type Raw = Record<string, unknown>;

const text = (value: unknown): string => (typeof value === 'string' ? value : value == null ? '' : String(value));

/**
 * One district/block row, whatever shape it arrives in:
 * - mock store: `{ districtName, districtCode, blockName, blockCode, status }`
 * - backend `/api/master/district-blocks`: `{ id, name, code, isActive, districtId, district: { name, code } }`
 * Missing fields become '' so screens can call string methods on them safely.
 */
export function toDistrictBlockItem(item: unknown, index = 0): DistrictBlockMasterItem {
  const raw = (item ?? {}) as Raw;
  const district = (raw['district'] ?? {}) as Raw;
  const isActive = raw['isActive'];
  const status = raw['status'] === 'Inactive' || isActive === false ? 'Inactive' : 'Active';

  return {
    sNo: typeof raw['sNo'] === 'number' ? (raw['sNo'] as number) : index + 1,
    id: text(raw['id']),
    districtName: text(raw['districtName'] ?? district['name']),
    districtCode: text(raw['districtCode'] ?? district['code']),
    blockName: text(raw['blockName'] ?? raw['name']),
    blockCode: text(raw['blockCode'] ?? raw['code']),
    status
  };
}
