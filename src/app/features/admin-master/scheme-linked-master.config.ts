import { signal } from '@angular/core';
import type { MasterCrudConfig, MasterFieldConfig, TableColumn } from '../../shared';
import type { SchemeLinkedMasterFields } from '../../core/models/admin-masters.model';

/**
 * Doc Master and Annexure Master are the same kind of screen: a named record that applies to one or more schemes
 * (backend `applicableSchemes`, at least one) with upload rules. This builds the shared master-crud config.
 */

/** Active Scheme Master names for the "Applicable Schemes" multi-select and the Scheme filter. */
export const applicableSchemeOptions = signal<string[]>([]);

export interface SchemeLinkedMasterOptions {
  dataKey: 'DOC_MASTERS' | 'ANNEXURE_MASTERS';
  title: string;
  entityLabel: string;
  itemUnit: string;
  /** Field holding the record's name (`docName` / `annexureName`). */
  nameKey: string;
  nameLabel: string;
  namePlaceholder: string;
  /** Default allowed file types of a new record. */
  defaultExtensions: string;
  /** Default "mandatory" of a new record. */
  defaultMandatory: boolean;
  /** Extra form fields (e.g. the Doc Master's category), placed after the name. */
  extraFields?: MasterFieldConfig[];
}

export function schemeLinkedMasterConfig<T extends SchemeLinkedMasterFields & { id: string }>(
  options: SchemeLinkedMasterOptions
): MasterCrudConfig<T> {
  const { nameKey } = options;
  const columns: TableColumn<T>[] = [
    { key: 'sNo', label: 'S. No.', type: 'number', align: 'center', width: 'w-16 min-w-[65px]' },
    { key: nameKey, label: options.nameLabel, cellClass: 'font-semibold text-slate-800 min-w-[240px]' },
    { key: 'schemes', label: 'Applicable Schemes', type: 'custom', cellClass: 'min-w-[130px]' },
    { key: 'allowedExtensions', label: 'Allowed Types', cellClass: 'whitespace-nowrap text-xs text-slate-600', format: v => (v as string) || '-' },
    { key: 'maxFileSizeMb', label: 'Max Size', align: 'center', cellClass: 'whitespace-nowrap text-slate-700', format: v => (v ? `${v} MB` : '-') },
    { key: 'isMandatory', label: 'Mandatory', align: 'center', cellClass: 'whitespace-nowrap text-slate-700', format: v => (v ? 'Yes' : 'No') }
  ];

  return {
    dataKey: options.dataKey,
    entityLabel: options.entityLabel,
    title: options.title,
    primaryActionLabel: 'Save',
    searchPlaceholder: `Search by ${options.nameLabel.toLowerCase()} or scheme...`,
    searchFields: [nameKey, 'schemes'] as (keyof T & string)[],
    itemUnit: options.itemUnit,
    columns,
    hasStatus: true,
    modalWidthClass: 'max-w-[600px]',
    filters: [{ key: 'schemes', label: 'Scheme', placeholder: 'All Schemes', options: () => applicableSchemeOptions() }],
    fields: [
      { key: nameKey, label: options.nameLabel, type: 'text', required: true, maxLength: 200, placeholder: options.namePlaceholder, colSpan: 3 },
      ...(options.extraFields ?? []),
      {
        key: 'schemes',
        label: 'Applicable Schemes',
        type: 'multiselect',
        required: true,
        options: () => applicableSchemeOptions(),
        placeholder: 'Select applicable schemes',
        colSpan: 3
      },
      { key: 'allowedExtensions', label: 'Allowed File Types', type: 'text', maxLength: 100, placeholder: options.defaultExtensions, colSpan: 2 },
      { key: 'maxFileSizeMb', label: 'Max Size (MB)', type: 'number', min: 1, placeholder: 'e.g. 5', colSpan: 1 },
      { key: 'mandatory', label: 'Mandatory by default', type: 'select', required: true, options: ['Yes', 'No'], colSpan: 3 },
      { key: 'description', label: 'Instructions', type: 'textarea', maxLength: 500, rows: 2, placeholder: 'Shown to applicants when they upload (optional)', colSpan: 3 }
    ],
    createDefaults: () => ({
      [nameKey]: '',
      schemes: [],
      allowedExtensions: options.defaultExtensions,
      maxFileSizeMb: 5,
      mandatory: options.defaultMandatory ? 'Yes' : 'No',
      description: '',
      ...Object.fromEntries((options.extraFields ?? []).map(f => [f.key, '']))
    }),
    buildPayload: formData => {
      const extra = Object.fromEntries(
        (options.extraFields ?? []).map(f => [f.key, String(formData[f.key] ?? '').trim()])
      );
      return {
        [nameKey]: String(formData[nameKey] ?? '').trim(),
        ...extra,
        // The multi-select adds 'ALL' while every option is ticked; it is not a scheme.
        schemes: (Array.isArray(formData.schemes) ? formData.schemes : []).filter((s: string) => s !== 'ALL'),
        allowedExtensions: String(formData.allowedExtensions ?? '').trim() || options.defaultExtensions,
        maxFileSizeMb: Number(formData.maxFileSizeMb) > 0 ? Number(formData.maxFileSizeMb) : 5,
        mandatory: formData.mandatory === 'Yes' ? 'Yes' : 'No',
        description: String(formData.description ?? '').trim(),
        status: formData.status === 'Inactive' ? 'Inactive' : 'Active'
      } as unknown as Partial<T>;
    },
    deleteConfirmText: item => `Are you sure you want to delete "${String((item as Record<string, unknown>)[nameKey] ?? '')}"?`
  };
}
