import { TemplateRef } from '@angular/core';

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'badge'
  | 'status'
  | 'link'
  | 'custom'
  | 'action';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface TableColumn<T = any> {
  /** Property key on data item, or dot-notation path, or arbitrary key for custom/action */
  key: string;
  /** Display label for table header */
  label: string;
  /** Presentation type */
  type?: ColumnType;
  /** Column alignment: 'left' | 'center' | 'right' */
  align?: 'left' | 'center' | 'right';
  /** Tailwind width class (e.g. 'w-12', 'w-24', 'min-w-[220px]') */
  width?: string;
  /** Whether column can be sorted */
  sortable?: boolean;
  /** For status/badge type: map string values to BadgeVariant */
  badgeVariantMap?: Record<string, BadgeVariant>;
  /** Optional custom value formatter */
  format?: (value: any, item: T, index: number) => string;
  /** Optional cell CSS class or dynamic class generator */
  cellClass?: string | ((value: any, item: T) => string);
  /** Optional header CSS class */
  headerClass?: string;
  /** Optional custom cell template */
  template?: TemplateRef<any>;
}

export interface TableAction<T = any> {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'pdf-view' | 'outline' | 'danger' | 'ghost';
  title?: string;
  action: (item: T) => void;
  visible?: (item: T) => boolean;
}

export interface PaginationConfig {
  pageSize: number;
  currentPage: number;
  totalItems: number;
}
