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

export interface MasterFilterConfig {
  key: string;
  label: string;
  options: string[] | (() => string[]);
  placeholder?: string;
}

export interface MasterCrudConfig<T extends { id: string; status?: string } = any> {
  /**
   * Display mode for Add/Edit form and View Details:
   * - 'modal' (default): opens centered popup modal dialogs
   * - 'screen': seamlessly switches the current page view into an in-screen form/detail view with Back button,
   *   ideal when there is extensive information (like Course Master with 12+ fields).
   */
  displayMode?: 'modal' | 'screen';
  /** DataEngineService resource key, e.g. 'SECTORS', 'DESIGNATIONS' */
  dataKey: string;
  /** Human label for the entity, e.g. "Sector", "Designation" */
  entityLabel: string;
  /** Page title shown in the header, e.g. "Sector Master" */
  title: string;
  /** Optional subtitle shown in the header */
  subtitle?: string;
  /** Optional custom breadcrumbs shown in the header */
  breadcrumbs?: { label: string; url?: string }[];
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
  /** Optional custom cell templates keyed by column key */
  customTemplates?: Record<string, import('@angular/core').TemplateRef<unknown>>;
  /** Whether this entity supports an Active/Inactive status toggle */
  hasStatus?: boolean;
  /** Primary submit button label in the modal (defaults to 'Save') */
  primaryActionLabel?: string;
  /** Dynamic add/edit modal field definitions */
  fields: MasterFieldConfig<T>[];
  /** Max-width tailwind class for the add/edit modal */
  modalWidthClass?: string;
  /** Max-width tailwind class for the view details modal */
  viewModalWidthClass?: string;
  /** Builds the blank form data object used when opening the "Add" modal */
  createDefaults: () => Record<string, any>;
  /** Transforms submitted form data into the final entity payload sent to the API/mock store.
   *  Typed as `any` (rather than Record<string,any>) so screens can use plain dot-notation
   *  field access without tripping `noPropertyAccessFromIndexSignature`. */
  buildPayload: (formData: any) => Partial<T>;
  /** Optional custom confirmation text for delete */
  deleteConfirmText?: (item: T) => string;
  /**
   * Converts one record as the API (or mock store) returns it into the row the screen shows.
   * Needed when the backend field names differ from the screen's (e.g. `name` / `isActive` vs `roleTypeName` / `status`).
   */
  normalizer?: (raw: unknown, index: number) => T;
  /**
   * API mode only: builds the request body from the screen payload (`buildPayload`, or `{ status }` for the status
   * switch) and the row being edited (null when adding). Lets an endpoint that needs the full record (PUT) get it.
   */
  toApiPayload?: (payload: Partial<T>, current: T | null) => unknown;
  /** Completes the loaded rows (e.g. fills in names from another master); runs after every load. */
  afterLoad?: (rows: T[]) => import('rxjs').Observable<T[]>;
  /** Reload the list after a save instead of using the saved record from the response (when it lacks joined fields). */
  reloadAfterSave?: boolean;
  /** Whether to hide the View action button in the table action column */
  hideViewAction?: boolean;
  /** Explicit column width for the Action column (e.g. 'w-44 min-w-[175px]') */
  actionColumnWidth?: string;
  /** Explicit column definitions for the View Details modal (defaults to config.columns) */
  viewColumns?: TableColumn<T>[];
  /** Dynamic top filter dropdowns (e.g. Sector, Category, Department) */
  filters?: MasterFilterConfig[];
  /** Whether to hide the default quick Status filter [All, Active, Inactive] (defaults to false if hasStatus=true) */
  hideStatusFilter?: boolean;
}
