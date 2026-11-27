import type { FilterTab, MasterCrudConfig, TableColumn } from '../../shared';
import type { DistrictBlockMasterItem, DistrictMasterItem } from '../../core/models/admin-masters.model';

/**
 * District & Block Master: two masters on one screen, each its own table (app-master-crud-page) under a
 * District / Block tab.
 *
 * - District tab: `/api/master/districts` (`{ id, name, code, state, isActive }`), table DistrictMasters.
 * - Block tab: `/api/master/district-blocks` (`{ id, districtId, name, code, isActive }`, DataEngine key DISTRICTS),
 *   table BlockMasters. A block names its district by name and code; the backend links it by them.
 */

export type DistrictBlockTab = 'district' | 'block';

/** Backend tables whose permissions drive each tab's buttons (GET /auth/permissions). */
export const DISTRICT_TABLE = 'DistrictMasters';
export const BLOCK_TABLE = 'BlockMasters';

export const DISTRICT_BLOCK_TABS: readonly FilterTab<DistrictBlockTab>[] = [
  { id: 'district', label: 'District' },
  { id: 'block', label: 'Block' }
];

const DEFAULT_STATE = 'Rajasthan';

type Raw = Record<string, unknown>;
const asRaw = (value: unknown): Raw => (value && typeof value === 'object' ? (value as Raw) : {});
const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value));
const firstText = (raw: Raw, ...keys: string[]): string => {
  for (const key of keys) {
    const v = text(raw[key]);
    if (v) return v;
  }
  return '';
};

/** The tab a `?tab=` value opens: `block` opens Block, anything else District; a tab the user may not read is skipped. */
export function tabFromQuery(value: string | null | undefined, allowed: readonly DistrictBlockTab[]): DistrictBlockTab {
  const wanted: DistrictBlockTab = value === 'block' ? 'block' : 'district';
  if (allowed.includes(wanted) || allowed.length === 0) return wanted;
  return allowed[0];
}

/** One district row, from the backend (`name` / `code` / `isActive`) or the mock store after an edit (`districtName` ...). */
export function toDistrictItem(item: unknown, index = 0): DistrictMasterItem {
  const raw = asRaw(item);
  const count = raw['blockCount'];
  return {
    sNo: typeof raw['sNo'] === 'number' ? (raw['sNo'] as number) : index + 1,
    id: text(raw['id']),
    districtName: firstText(raw, 'districtName', 'name'),
    districtCode: firstText(raw, 'districtCode', 'code'),
    state: firstText(raw, 'state') || DEFAULT_STATE,
    blockCount: typeof count === 'number' ? count : null,
    status: raw['status'] === 'Inactive' || raw['isActive'] === false ? 'Inactive' : 'Active'
  };
}

/** Body of POST / PUT `/api/master/districts` (the update is partial: the status stays with the Active switch). */
export function toDistrictRequest(payload: Partial<DistrictMasterItem>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.districtName !== undefined) body['name'] = text(payload.districtName);
  if (payload.districtCode !== undefined) body['code'] = text(payload.districtCode).toUpperCase();
  if (payload.state !== undefined) body['state'] = text(payload.state) || DEFAULT_STATE;
  if (payload.status !== undefined) body['isActive'] = payload.status !== 'Inactive';
  return body;
}

/** The district rows with the number of blocks of each (blocks matched by districtId, else by district name). */
export function withBlockCounts(
  districts: DistrictMasterItem[],
  blocks: readonly (DistrictBlockMasterItem & { districtId?: number })[]
): DistrictMasterItem[] {
  const byId = new Map<string, number>();
  const byName = new Map<string, number>();
  for (const block of blocks) {
    if (block.districtId !== undefined) byId.set(String(block.districtId), (byId.get(String(block.districtId)) ?? 0) + 1);
    else if (block.districtName) {
      const name = block.districtName.toLowerCase();
      byName.set(name, (byName.get(name) ?? 0) + 1);
    }
  }
  return districts.map(d => ({
    ...d,
    blockCount: (byId.get(d.id) ?? 0) + (byName.get(d.districtName.toLowerCase()) ?? 0)
  }));
}

/** Names of the active districts, sorted: the Block form's District dropdown and the Block tab's filter. */
export function activeDistrictNames(districts: readonly DistrictMasterItem[]): string[] {
  return [...new Set(districts.filter(d => d.status !== 'Inactive').map(d => d.districtName).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

/** The block form's district (by name) with its code, so the backend can link the block to it. */
export function blockPayload(formData: Raw, districts: readonly DistrictMasterItem[]): Partial<DistrictBlockMasterItem> {
  const districtName = text(formData['districtName']);
  const district = districts.find(d => d.districtName.toLowerCase() === districtName.toLowerCase());
  const districtCode = district?.districtCode || text(formData['districtCode']);
  const blockName = text(formData['blockName']);
  const blockCode =
    text(formData['blockCode']).toUpperCase() || `${districtCode ? `${districtCode}-` : ''}${blockName.slice(0, 3).toUpperCase()}`;
  return { districtName, districtCode, blockName, blockCode };
}

const STATUS_COLUMN = { key: 'status', label: 'Status', type: 'custom' as const, align: 'center' as const, width: 'w-28' };

const DISTRICT_COLUMNS: TableColumn<DistrictMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'districtName', label: 'District Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'districtCode', label: 'District Code', cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-700' },
  { key: 'state', label: 'State', cellClass: 'whitespace-nowrap text-slate-700' },
  {
    key: 'blockCount',
    label: 'Blocks',
    align: 'center',
    cellClass: 'tabular-nums text-slate-700',
    format: (value: unknown) => (typeof value === 'number' ? String(value) : '-')
  },
  STATUS_COLUMN
];

const BLOCK_COLUMNS: TableColumn<DistrictBlockMasterItem>[] = [
  { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
  { key: 'blockName', label: 'Block Name', cellClass: 'whitespace-nowrap font-semibold text-slate-800' },
  { key: 'blockCode', label: 'Block Code', cellClass: 'whitespace-nowrap tabular-nums text-xs text-slate-700' },
  { key: 'districtName', label: 'District', cellClass: 'whitespace-nowrap text-slate-700' },
  STATUS_COLUMN
];

const TITLE = 'District & Block Master';
const BREADCRUMBS = [{ label: 'Home', url: '/' }, { label: TITLE }];

/** District tab. `afterLoad` adds the block counts. */
export function districtConfig(
  afterLoad?: MasterCrudConfig<DistrictMasterItem>['afterLoad']
): MasterCrudConfig<DistrictMasterItem> {
  return {
    dataKey: 'DISTRICT_MASTERS',
    permissionTable: DISTRICT_TABLE,
    entityLabel: 'District',
    title: TITLE,
    breadcrumbs: BREADCRUMBS,
    searchPlaceholder: 'Search by district name or code...',
    searchFields: ['districtName', 'districtCode', 'state'],
    itemUnit: 'districts',
    columns: DISTRICT_COLUMNS,
    viewColumns: DISTRICT_COLUMNS.filter(c => c.key !== 'sNo' && c.key !== 'status'),
    hasStatus: true,
    modalWidthClass: 'max-w-[540px]',
    fields: [
      { key: 'districtName', label: 'District Name', type: 'text', required: true, maxLength: 80, placeholder: 'Enter district name', colSpan: 2 },
      { key: 'districtCode', label: 'District Code', type: 'text', required: true, maxLength: 20, placeholder: 'e.g. JPR', uppercase: true, colSpan: 1 },
      { key: 'state', label: 'State', type: 'text', required: true, maxLength: 80, placeholder: 'Enter state', colSpan: 3 }
    ],
    createDefaults: () => ({ districtName: '', districtCode: '', state: DEFAULT_STATE }),
    buildPayload: formData => ({
      districtName: text(formData.districtName),
      districtCode: text(formData.districtCode).toUpperCase(),
      state: text(formData.state) || DEFAULT_STATE
    }),
    normalizer: (raw, index) => toDistrictItem(raw, index),
    toApiPayload: payload => toDistrictRequest(payload),
    // The saved district comes back without its block count, so the list is read again.
    reloadAfterSave: true,
    afterLoad,
    deleteConfirmText: item => `Are you sure you want to delete district "${item.districtName}"?`
  };
}

/** Block tab. `districts` gives the District dropdown / filter; `afterLoad` fills in the district names. */
export function blockConfig(
  districts: () => readonly DistrictMasterItem[],
  afterLoad?: MasterCrudConfig<DistrictBlockMasterItem>['afterLoad']
): MasterCrudConfig<DistrictBlockMasterItem> {
  return {
    dataKey: 'DISTRICTS',
    permissionTable: BLOCK_TABLE,
    entityLabel: 'Block',
    title: TITLE,
    breadcrumbs: BREADCRUMBS,
    searchPlaceholder: 'Search by block name, code or district...',
    searchFields: ['blockName', 'blockCode', 'districtName'],
    itemUnit: 'blocks',
    columns: BLOCK_COLUMNS,
    viewColumns: BLOCK_COLUMNS.filter(c => c.key !== 'sNo' && c.key !== 'status'),
    hasStatus: true,
    modalWidthClass: 'max-w-[540px]',
    filters: [{ key: 'districtName', label: 'District', placeholder: 'All Districts', options: () => activeDistrictNames(districts()) }],
    fields: [
      { key: 'blockName', label: 'Block Name', type: 'text', required: true, maxLength: 80, placeholder: 'Enter block name', colSpan: 2 },
      { key: 'blockCode', label: 'Block Code', type: 'text', maxLength: 30, placeholder: 'e.g. JPR-AMB', uppercase: true, colSpan: 1 },
      {
        key: 'districtName',
        label: 'District',
        type: 'select',
        required: true,
        placeholder: 'Select district',
        options: () => activeDistrictNames(districts()),
        colSpan: 3
      }
    ],
    createDefaults: () => ({ blockName: '', blockCode: '', districtName: '' }),
    buildPayload: formData => blockPayload(formData, districts()),
    // The saved block comes back without its district name, so the list is read again.
    reloadAfterSave: true,
    afterLoad,
    deleteConfirmText: item => `Are you sure you want to delete block "${item.blockName}" of "${item.districtName}"?`
  };
}
