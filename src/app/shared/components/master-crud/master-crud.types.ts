import { TableColumn } from '../table/table.types';

export type MasterFieldType = 'text' | 'number' | 'textarea' | 'select' | 'multiselect' | 'permissions';

export interface MasterFieldConfig<T = any> {
  /** Key on the form data object (not necessarily the same as the entity key) */
  key: string;
  label: string;
  type: MasterFieldType;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  /** Minimum numeric value (only used for type: 'number') */
  min?: number;
  /** Static options, or a function returning options (used for 'select'/'permissions') */
  options?: string[] | (() => string[]);
  uppercase?: boolean;
  rows?: number;
  /** Column span out of a 3-column responsive grid (1, 2 or 3). Defaults to 3 (full width). */
  colSpan?: 1 | 2 | 3;
}

export interface MasterCrudConfig<T extends { id: string; status?: string } = any> {
  /** DataEngineService resource key, e.g. 'SECTORS', 'DESIGNATIONS' */
  dataKey: string;
  /** Human label for the entity, e.g. "Sector", "Designation" */
  entityLabel: string;
  /** Page title shown in the header, e.g. "Sector Master" */
  title: string;
  /** Placeholder for the search box */
  searchPlaceholder: string;
  /** Raw item fields to match against when searching */
  searchFields: (keyof T & string)[];
  /** Unit label used in the table pagination footer, e.g. "sectors" */
  itemUnit: string;
  /** Table column definitions (status/action columns are handled automatically) */
  columns: TableColumn<T>[];
  /** Keys of columns whose values are string[] and should render as pill tags */
  tagsColumns?: string[];
  /** Whether this entity supports an Active/Inactive status toggle */
  hasStatus?: boolean;
  /** Primary submit button label in the modal (defaults to 'Save') */
  primaryActionLabel?: string;
  /** Dynamic add/edit modal field definitions */
  fields: MasterFieldConfig<T>[];
  /** Max-width tailwind class for the add/edit modal */
  modalWidthClass?: string;
  /** Builds the blank form data object used when opening the "Add" modal */
  createDefaults: () => Record<string, any>;
  /** Transforms submitted form data into the final entity payload sent to the API/mock store.
   *  Typed as `any` (rather than Record<string,any>) so screens can use plain dot-notation
   *  field access without tripping `noPropertyAccessFromIndexSignature`. */
  buildPayload: (formData: any) => Partial<T>;
  /** Optional custom confirmation text for delete */
  deleteConfirmText?: (item: T) => string;
}
