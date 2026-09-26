import { TemplateRef } from '@angular/core';

export type FormFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'tel'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'switch'
  | 'heading'
  | 'divider'
  | 'custom';

export interface FormOption {
  label: string;
  value: any;
  disabled?: boolean;
  hint?: string;
  badge?: string;
}

export interface FormFieldConfig<T = any> {
  /** Property key on model or dot-notation path (e.g. 'scheme', 'sdcName', 'step1.mouRefNo') */
  key: string;
  /** Display label for the field */
  label: string;
  /** Input type (default: 'text') */
  type?: FormFieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is mandatory */
  required?: boolean;
  /** Custom error message when required */
  requiredMessage?: string;
  /** Helper text displayed below the field */
  hint?: string;
  /** Disabled state or dynamic evaluator based on current model */
  disabled?: boolean | ((model: T) => boolean);
  /** Read-only state */
  readonly?: boolean;
  /** Options list for 'select' or 'radio' inputs */
  options?: FormOption[];
  /** Grid column span: 1, 2, 3, 4, or 'full' */
  colSpan?: 1 | 2 | 3 | 4 | 'full';
  /** Prefix text inside input (e.g. '+91', '₹') */
  prefixText?: string;
  /** Suffix text inside input (e.g. 'hrs', '%', 'sq.ft') */
  suffixText?: string;
  /** Transform input text to uppercase */
  uppercase?: boolean;
  /** Length and numeric range constraints */
  maxLength?: number;
  minLength?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  /** Number of rows for textarea (default: 3) */
  rows?: number;
  /** Accepted file formats (e.g. '.pdf,.jpg,.png') */
  accept?: string;
  /** Max file size in MB */
  maxFileSizeMb?: number;
  /** Whether to show live character count */
  showCharCount?: boolean;
  /** Regex pattern for format validation */
  pattern?: RegExp | string;
  patternMessage?: string;
  /** Custom synchronous validator returning error message string or null */
  validator?: (value: any, model: T) => string | null;
  /** Conditional visibility predicate */
  visible?: boolean | ((model: T) => boolean);
  /** Custom Angular template for 'custom' type */
  template?: TemplateRef<any>;
  /** Callback fired when field value changes */
  onChange?: (value: any, field: FormFieldConfig<T>, model: T) => void;
  /** Additional custom CSS class */
  className?: string;
}

export interface FormSectionConfig<T = any> {
  id?: string;
  /** Title of the section (e.g. 'Organization Details') */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Pre-defined icon name: 'building' | 'home' | 'location' | 'document' | 'user' | 'academic' | 'shield' | 'clock' | 'settings' */
  icon?: string;
  /** Grid columns inside this section: 1 | 2 | 3 | 4 (default: 2) */
  gridCols?: 1 | 2 | 3 | 4;
  /** Fields inside this section */
  fields: FormFieldConfig<T>[];
  /** Conditional visibility for the entire section */
  visible?: boolean | ((model: T) => boolean);
  /** Optional badge tag */
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'info' | 'neutral';
  /** Collapsible section support */
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FormActionConfig<T = any> {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  icon?: string;
  loading?: boolean;
  disabled?: boolean | ((model: T) => boolean);
  action: (model: T) => void;
}
