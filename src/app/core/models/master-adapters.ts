import type {
  CourseMasterItem,
  DesignationMasterItem,
  DistrictBlockMasterItem,
  DocMasterItem,
  EoiCategoryItem,
  GradingMasterItem,
  RemarkMasterItem,
  SchemeCategoryMasterItem,
  SchemeMasterItem,
  SectorMasterItem
} from './admin-masters.model';

/**
 * Converters between the backend master APIs (`/api/master/...`) and the rows the screens use.
 *
 * - `fromApi` reads a backend record (and still accepts the screen shape of the mock store);
 * - `toApi` turns a screen payload (or a partial patch such as `{ status }` or `{ budget }`) into the request body.
 *   Backend updates are partial (fields left out are kept), so a patch needs no current record.
 *
 * DataEngineService applies these to every call of the resource in API mode, so screens, dropdowns and other
 * features all see the same shape.
 */
export interface ResourceAdapter<T = any> {
  fromApi(raw: unknown, index: number): T;
  toApi(patch: Partial<T>): Record<string, unknown>;
}

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
const num = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'number' ? value : value === '' || value == null ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const numOrNull = (value: unknown): number | null => {
  const n = num(value, NaN);
  return Number.isFinite(n) ? n : null;
};
const statusOf = (raw: Raw): 'Active' | 'Inactive' => (raw['status'] === 'Inactive' || raw['isActive'] === false ? 'Inactive' : 'Active');
const sNoOf = (raw: Raw, index: number): number => (typeof raw['sNo'] === 'number' ? (raw['sNo'] as number) : index + 1);

/**
 * Builds a request body from the keys present in the patch: renames screen keys to request keys, turns `status`
 * into `isActive`, and drops screen-only keys (`id`, `sNo`, ...). A value mapper may return undefined to leave the key out.
 */
function buildRequest(
  patch: Raw,
  rename: Record<string, string | ((value: unknown) => [string, unknown] | undefined)>,
  drop: readonly string[] = []
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || key === 'id' || key === 'sNo' || drop.includes(key)) continue;
    if (key === 'status') {
      body['isActive'] = value !== 'Inactive';
      continue;
    }
    const target = rename[key];
    if (typeof target === 'function') {
      const mapped = target(value);
      if (mapped) body[mapped[0]] = mapped[1];
    } else {
      body[target ?? key] = typeof value === 'string' ? value.trim() : value;
    }
  }
  return body;
}

/** Label the screens use for a record that applies to every scheme (no scheme on the backend). */
export const ALL_SCHEMES = 'ALL Schemes';

/** A scheme name for the backend: '' (no scheme, applies to all) for the "ALL Schemes" choice. */
function schemeOrAll(value: unknown): string {
  const name = text(value);
  return name.toLowerCase() === ALL_SCHEMES.toLowerCase() ? '' : name;
}

/** "2025-04-28T00:00:00" -> "28-Apr-25" (how the course list shows validity); other text is kept. */
export function formatShortDate(value: unknown): string {
  const s = text(value);
  if (!s) return '-';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!match) return s;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[Number(match[2]) - 1];
  return month ? `${match[3]}-${month}-${match[1].slice(2)}` : s;
}

// ---- Sector Master: { id, sectorName, sectorCode, description, isActive } ----
export const SECTOR_ADAPTER: ResourceAdapter<SectorMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      sectorName: firstText(raw, 'sectorName', 'name'),
      sectorCode: firstText(raw, 'sectorCode', 'code'),
      status: statusOf(raw)
    };
  },
  toApi: patch => buildRequest(patch as Raw, {})
};

// ---- Designation Master: { id, name, code, department, description, isActive } ----
export const DESIGNATION_ADAPTER: ResourceAdapter<DesignationMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      designationName: firstText(raw, 'designationName', 'name'),
      designationCode: firstText(raw, 'designationCode', 'code'),
      departmentWing: firstText(raw, 'departmentWing', 'department'),
      status: statusOf(raw)
    };
  },
  toApi: patch => buildRequest(patch as Raw, { departmentWing: 'department' })
};

// ---- EOI Category Master: { id, code, title, description, isActive } ----
export const EOI_CATEGORY_ADAPTER: ResourceAdapter<EoiCategoryItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      categoryTitle: firstText(raw, 'categoryTitle', 'title', 'name'),
      description: firstText(raw, 'description'),
      status: statusOf(raw)
    };
  },
  toApi: patch => buildRequest(patch as Raw, { categoryTitle: 'title' })
};

// ---- Scheme Category Master: { id, categoryName, code, description, isActive } ----
export const SCHEME_CATEGORY_ADAPTER: ResourceAdapter<SchemeCategoryMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      categoryName: firstText(raw, 'categoryName', 'name'),
      status: statusOf(raw)
    };
  },
  // The screen also sends schemeName (= the category name); the backend has no such field.
  toApi: patch => buildRequest(patch as Raw, {}, ['schemeName'])
};

// ---- Scheme Master: { id, schemeName, schemeCategory, categoryName, eoiCategoryId, emdAmount, processFees, budget, isActive } ----
export const SCHEME_ADAPTER: ResourceAdapter<SchemeMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      schemeName: firstText(raw, 'schemeName', 'name'),
      schemeCategory: firstText(raw, 'schemeCategory'),
      categoryName: firstText(raw, 'categoryName'),
      budget: num(raw['budget']),
      amount: num(raw['amount'] ?? raw['emdAmount']),
      processFees: num(raw['processFees']),
      status: statusOf(raw)
    };
  },
  toApi: patch =>
    buildRequest(patch as Raw, {
      amount: v => ['emdAmount', num(v)],
      budget: v => ['budget', num(v)],
      processFees: v => ['processFees', num(v)]
    })
};

// ---- Course Master: { id, sectorId, sectorName, qpJobRoleName, qpJobRoleCode, version, nsqfLevel, ... } ----
export const COURSE_ADAPTER: ResourceAdapter<CourseMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    const sector = asRaw(raw['sector']);
    const theory = raw['theoryDurationHours'];
    const nsqf = raw['nsqfLevel'];
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      sector: typeof raw['sector'] === 'string' ? text(raw['sector']) : firstText(raw, 'sectorName') || firstText(sector, 'sectorName', 'name'),
      jobRoleName: firstText(raw, 'jobRoleName', 'qpJobRoleName', 'name'),
      jobRoleCode: firstText(raw, 'jobRoleCode', 'qpJobRoleCode', 'code'),
      version: firstText(raw, 'version') || '1.0',
      nsqfLevel: nsqf == null ? '' : text(nsqf),
      commonNormsCategory: firstText(raw, 'commonNormsCategory'),
      theoryDurationHours: theory === 'NA' ? 'NA' : num(theory),
      practicalOjtDurationHours: firstText(raw, 'practicalOjtDurationHours', 'practicalOjtDuration'),
      itSoftSkillTrainingHours: num(raw['itSoftSkillTrainingHours'] ?? raw['itSoftSkillDurationHours']),
      totalQpHours: num(raw['totalQpHours'] ?? raw['durationHours']),
      courseValidUpToDate:
        raw['courseValidUpToDate'] !== undefined ? text(raw['courseValidUpToDate']) || '-' : formatShortDate(raw['validUpToDate']),
      remark: firstText(raw, 'remark'),
      status: statusOf(raw)
    };
  },
  toApi: patch =>
    buildRequest(patch as Raw, {
      sector: v => ['sectorName', text(v)],
      jobRoleName: 'qpJobRoleName',
      jobRoleCode: 'qpJobRoleCode',
      nsqfLevel: v => ['nsqfLevel', numOrNull(v)],
      theoryDurationHours: v => ['theoryDurationHours', v === 'NA' ? null : numOrNull(v)],
      practicalOjtDurationHours: 'practicalOjtDuration',
      itSoftSkillTrainingHours: v => ['itSoftSkillDurationHours', numOrNull(v)],
      totalQpHours: v => ['totalQpHours', numOrNull(v)],
      // "-" / empty mean no date: leave the stored value alone.
      courseValidUpToDate: v => (text(v) && text(v) !== '-' ? ['validUpToDateStr', text(v)] : undefined)
    })
};

// ---- District & Block Master (blocks, /master/district-blocks): { id, districtId, name, code, isActive } ----
export const DISTRICT_BLOCK_ADAPTER: ResourceAdapter<DistrictBlockMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    const district = asRaw(raw['district']);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      districtName: firstText(raw, 'districtName') || firstText(district, 'name'),
      districtCode: firstText(raw, 'districtCode') || firstText(district, 'code'),
      blockName: firstText(raw, 'blockName', 'name'),
      blockCode: firstText(raw, 'blockCode', 'code'),
      status: statusOf(raw),
      // Kept so the district name can be filled in from the District list (the block JSON leaves it out).
      ...(raw['districtId'] !== undefined ? { districtId: num(raw['districtId']) } : {})
    } as DistrictBlockMasterItem;
  },
  toApi: patch => buildRequest(patch as Raw, {}, ['districtId'])
};

/** Fills district name and code of block rows from the District list (`{ id, name, code }`). */
export function withDistrictNames(rows: DistrictBlockMasterItem[], districts: unknown[]): DistrictBlockMasterItem[] {
  const byId = new Map(districts.map(d => asRaw(d)).map(d => [num(d['id'], -1), d]));
  return rows.map(row => {
    const id = (row as DistrictBlockMasterItem & { districtId?: number }).districtId;
    const district = id !== undefined ? byId.get(id) : undefined;
    if (!district) return row;
    return {
      ...row,
      districtName: row.districtName || firstText(district, 'name', 'districtName'),
      districtCode: row.districtCode || firstText(district, 'code', 'districtCode')
    };
  });
}

// ---- Remark Master: { id, code, title, category, remarkType, description, isActive } ----
export const REMARK_ADAPTER: ResourceAdapter<RemarkMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      remarkType: firstText(raw, 'remarkType', 'category', 'title'),
      description: firstText(raw, 'description'),
      status: statusOf(raw)
    };
  },
  toApi: patch => buildRequest(patch as Raw, {})
};

// ---- Grading Master: { id, grade, schemeId, schemeName, minScore, maxScore, range, isActive } ----
export const GRADING_ADAPTER: ResourceAdapter<GradingMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    const min = num(raw['minimum'] ?? raw['minScore']);
    const max = num(raw['maximum'] ?? raw['maxScore'], 100);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      schemeName: firstText(raw, 'schemeName') || ALL_SCHEMES,
      grade: firstText(raw, 'grade'),
      minimum: min,
      maximum: max,
      range: firstText(raw, 'range') || `${min} - ${max}`,
      status: statusOf(raw)
    };
  },
  toApi: patch =>
    buildRequest(
      patch as Raw,
      { minimum: v => ['minimum', num(v)], maximum: v => ['maximum', num(v)], schemeName: v => ['schemeName', schemeOrAll(v)] },
      ['range']
    )
};

// ---- Doc Master: { id, code, schemeName, schemeId, documentName, allowedExtensions, maxFileSizeMb, isMandatory, isActive } ----
export const DOC_ADAPTER: ResourceAdapter<DocMasterItem> = {
  fromApi: (item, index) => {
    const raw = asRaw(item);
    return {
      sNo: sNoOf(raw, index),
      id: text(raw['id']),
      schemeName: firstText(raw, 'schemeName', 'category') || ALL_SCHEMES,
      documents: firstText(raw, 'documents', 'documentName', 'docName'),
      allowedExtensions: firstText(raw, 'allowedExtensions'),
      maxFileSizeMb: numOrNull(raw['maxFileSizeMb']),
      isMandatory: raw['isMandatory'] === true || raw['isMandatory'] === 'Yes',
      mandatory: raw['isMandatory'] === true || raw['isMandatory'] === 'Yes' ? 'Yes' : 'No',
      status: statusOf(raw)
    };
  },
  toApi: patch =>
    buildRequest(
      patch as Raw,
      {
        schemeName: v => ['schemeName', schemeOrAll(v)],
        documents: 'documentName',
        maxFileSizeMb: v => ['maxFileSizeMb', numOrNull(v)],
        isMandatory: v => ['isMandatory', v === true || v === 'Yes']
      },
      ['mandatory']
    )
};

/** Adapter of every master resource (DataEngine dataKey). */
export const MASTER_ADAPTERS: Readonly<Record<string, ResourceAdapter>> = {
  SECTORS: SECTOR_ADAPTER,
  DESIGNATIONS: DESIGNATION_ADAPTER,
  EOI_CATEGORIES: EOI_CATEGORY_ADAPTER,
  SCHEME_CATEGORIES: SCHEME_CATEGORY_ADAPTER,
  SCHEME_MASTERS: SCHEME_ADAPTER,
  COURSES: COURSE_ADAPTER,
  DISTRICTS: DISTRICT_BLOCK_ADAPTER,
  REMARK_MASTERS: REMARK_ADAPTER,
  GRADING_MASTERS: GRADING_ADAPTER,
  DOC_MASTERS: DOC_ADAPTER
};
