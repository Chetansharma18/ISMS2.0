/**
 * Skill sectors offered under MMKVY (Cat. I - RAJKViK) and MNSKSY, as listed in the official
 * Course List (effective 18-Aug-2026). The `code` is the Sector Skill Council prefix used in the
 * QP / Job Role codes of that sector.
 *
 * This is the single source for the Sector Master seed data, the Course Master sector dropdown
 * and the "Preferred Sector" field of the organisation registration form.
 */
export interface SkillSector {
  name: string;
  code: string;
}

export const SKILL_SECTORS: readonly SkillSector[] = [
  { name: 'Aerospace and Aviation', code: 'AAS' },
  { name: 'Agriculture', code: 'AGR' },
  { name: 'Apparel', code: 'AMH' },
  { name: 'Automotive', code: 'ASC' },
  { name: 'Beauty & Wellness', code: 'BWS' },
  { name: 'BFSI', code: 'BSC' },
  { name: 'Capital Goods', code: 'CSC' },
  { name: 'Construction', code: 'CON' },
  { name: 'Domestic Workers', code: 'DWC' },
  { name: 'Electronics', code: 'ELE' },
  { name: 'Food Processing', code: 'FIC' },
  { name: 'Furniture & Fittings', code: 'FFS' },
  { name: 'Green Jobs', code: 'SGJ' },
  { name: 'Handicrafts and Carpet', code: 'HCS' },
  { name: 'Healthcare', code: 'HSS' },
  { name: 'Hydrocarbon', code: 'HYC' },
  { name: 'Information Technology Sector', code: 'ITS' },
  { name: 'Infrastructure Equipment', code: 'IES' },
  { name: 'Iron and Steel', code: 'ISC' },
  { name: 'IT-ITeS', code: 'SSC' },
  { name: 'Leather', code: 'LSS' },
  { name: 'Life Sciences', code: 'LFS' },
  { name: 'Logistics', code: 'LSC' },
  { name: 'Management', code: 'MEP' },
  { name: 'Media & Entertainment', code: 'MES' },
  { name: 'Mining', code: 'MIN' },
  { name: 'Plumbing', code: 'PSC' },
  { name: 'Power', code: 'PSS' },
  { name: 'PwD', code: 'PWD' },
  { name: 'Retail', code: 'RAS' },
  { name: 'Rubber', code: 'RSC' },
  { name: 'Sports', code: 'SPF' },
  { name: 'Telecom', code: 'TEL' },
  { name: 'Textile', code: 'TSC' },
  { name: 'Tourism & Hospitality', code: 'THC' }
];

export const SKILL_SECTOR_NAMES: readonly string[] = SKILL_SECTORS.map(s => s.name);
