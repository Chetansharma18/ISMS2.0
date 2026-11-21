import {
  DynamicFormBuilderItem,
  DynamicFormField,
  DynamicFormFieldType,
  FormFieldCondition,
  FormFieldOption,
  FormStep
} from '../../core/models/admin-masters.model';

export interface FieldTypeDefinition {
  type: DynamicFormFieldType;
  label: string;
  icon: string;
  category: 'basic' | 'advanced' | 'layout';
  description: string;
  defaultConfig: Partial<DynamicFormField>;
}

export const FIELD_TYPE_REGISTRY: readonly FieldTypeDefinition[] = [
  // Basic Fields
  {
    type: 'text',
    label: 'Single-Line Text',
    icon: 'text',
    category: 'basic',
    description: 'Standard single-line text input for names, titles, codes.',
    defaultConfig: { type: 'text', mandatory: true, placeholder: 'Enter text' }
  },
  {
    type: 'textarea',
    label: 'Multi-Line Textarea',
    icon: 'document',
    category: 'basic',
    description: 'Multi-line paragraph text input for descriptions, remarks.',
    defaultConfig: { type: 'textarea', mandatory: false, placeholder: 'Enter detailed description' }
  },
  {
    type: 'number',
    label: 'Number Input',
    icon: 'hash',
    category: 'basic',
    description: 'Numeric input with min, max, and step boundaries.',
    defaultConfig: { type: 'number', mandatory: false, placeholder: 'e.g. 100' }
  },
  {
    type: 'currency',
    label: 'Currency (INR ₹)',
    icon: 'dollar',
    category: 'basic',
    description: 'Indian Rupee currency input formatted with commas.',
    defaultConfig: { type: 'currency', mandatory: false, placeholder: '₹0' }
  },
  {
    type: 'email',
    label: 'Email Address',
    icon: 'mail',
    category: 'basic',
    description: 'Validated email address with RFC syntax checking.',
    defaultConfig: { type: 'email', mandatory: false, placeholder: 'name@domain.gov.in' }
  },
  {
    type: 'phone',
    label: 'Mobile / Phone No.',
    icon: 'phone',
    category: 'basic',
    description: '10-digit Indian mobile number input with prefix format.',
    defaultConfig: { type: 'phone', mandatory: false, placeholder: '9876543210' }
  },
  {
    type: 'datepicker',
    label: 'Date Picker',
    icon: 'calendar',
    category: 'basic',
    description: 'Calendar date selection with past/future constraints.',
    defaultConfig: { type: 'datepicker', mandatory: false, placeholder: 'YYYY-MM-DD' }
  },
  {
    type: 'dropdown',
    label: 'Dropdown List',
    icon: 'chevron-down',
    category: 'basic',
    description: 'Single-choice selection from configured options.',
    defaultConfig: {
      type: 'dropdown',
      mandatory: false,
      optionsText: 'Option 1, Option 2, Option 3',
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    type: 'radio',
    label: 'Radio Options',
    icon: 'check',
    category: 'basic',
    description: 'Radio button selection where only one option can be chosen.',
    defaultConfig: {
      type: 'radio',
      mandatory: false,
      optionsText: 'Yes, No',
      options: ['Yes', 'No']
    }
  },
  {
    type: 'checkbox',
    label: 'Checkbox (Yes / No)',
    icon: 'check',
    category: 'basic',
    description: 'Single boolean checkbox for agreements, consent, confirmation.',
    defaultConfig: { type: 'checkbox', mandatory: false }
  },

  // Advanced Fields
  {
    type: 'photo',
    label: 'Photo Upload',
    icon: 'image',
    category: 'advanced',
    description: 'Camera / image upload with image previews and size limits.',
    defaultConfig: { type: 'photo', mandatory: false, minPhotos: 1, maxPhotos: 5, maxSizeMb: 5 }
  },
  {
    type: 'file',
    label: 'Document Upload (PDF/DOC)',
    icon: 'upload',
    category: 'advanced',
    description: 'Document attachment supporting PDF, DOCX, and XLS formats.',
    defaultConfig: { type: 'file', mandatory: false, minPhotos: 1, maxPhotos: 3, maxSizeMb: 10 }
  },

  // Layout Components
  {
    type: 'heading',
    label: 'Section Heading',
    icon: 'document',
    category: 'layout',
    description: 'Visual group banner separating distinct sections of the form.',
    defaultConfig: { type: 'heading', mandatory: false, label: 'Section Header' }
  },
  {
    type: 'divider',
    label: 'Divider Line',
    icon: 'minus',
    category: 'layout',
    description: 'Horizontal divider separating field clusters.',
    defaultConfig: { type: 'divider', mandatory: false, label: 'Divider' }
  }
];

/**
 * Derives a machine-safe field key from a user-provided label (e.g. "Center Name" -> "center_name").
 */
export function generateFieldKey(label: string): string {
  if (!label) return 'field_' + Math.floor(1000 + Math.random() * 9000);
  const clean = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return clean || 'field_' + Math.floor(1000 + Math.random() * 9000);
}

/**
 * Normalizes comma-separated options string into clean trimmed string array.
 */
export function parseOptionsText(text?: string): string[] {
  if (!text) return [];
  return text
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

/**
 * Formats options array into comma-separated string for quick visual editing.
 */
export function optionsToText(options?: string[] | FormFieldOption[]): string {
  if (!options || options.length === 0) return '';
  if (typeof options[0] === 'string') {
    return (options as string[]).join(', ');
  }
  return (options as FormFieldOption[]).map(o => o.label || o.value).join(', ');
}

/**
 * Evaluates whether a conditional rule evaluates to true given current form values.
 */
export function evaluateCondition(cond: FormFieldCondition, values: Record<string, any>): boolean {
  if (!cond || !cond.fieldId) return true;
  const currentVal = values[cond.fieldId];

  switch (cond.operator) {
    case 'equals':
      return String(currentVal ?? '').trim().toLowerCase() === String(cond.value ?? '').trim().toLowerCase();
    case 'notEquals':
      return String(currentVal ?? '').trim().toLowerCase() !== String(cond.value ?? '').trim().toLowerCase();
    case 'contains':
      return String(currentVal ?? '').toLowerCase().includes(String(cond.value ?? '').toLowerCase());
    case 'isNotEmpty':
      return currentVal !== null && currentVal !== undefined && String(currentVal).trim() !== '';
    case 'greaterThan':
      return Number(currentVal) > Number(cond.value);
    case 'lessThan':
      return Number(currentVal) < Number(cond.value);
    default:
      return true;
  }
}

/**
 * Checks if a field should be visually visible based on its configured conditional rules.
 */
export function isFieldVisible(field: DynamicFormField, values: Record<string, any>): boolean {
  if (!field.conditions || field.conditions.length === 0) return true;
  // Evaluate all visibility conditions (AND logic)
  for (const cond of field.conditions) {
    const matched = evaluateCondition(cond, values);
    if (cond.action === 'show' && !matched) return false;
    if (cond.action === 'hide' && matched) return false;
  }
  return true;
}

/**
 * Determines whether a field is required either via mandatory flag, validation.required, or conditional require rule.
 */
export function isFieldRequired(
  field: DynamicFormField,
  allValues: Record<string, any> = {}
): boolean {
  if (field.mandatory || field.validation?.required) {
    return true;
  }
  if (field.conditions && field.conditions.length > 0) {
    const requireCondition = field.conditions.find(c => c.action === 'require');
    if (requireCondition) {
      return evaluateCondition(requireCondition, allValues);
    }
  }
  return false;
}

/**
 * Validates a single field's value against its configured validation constraints.
 * Returns an error message string or null if valid.
 */
export function validateFieldValue(
  field: DynamicFormField,
  val: any,
  allValues: Record<string, any> = {}
): string | null {
  // Layout components never fail validation
  if (field.type === 'heading' || field.type === 'divider') {
    return null;
  }

  // If conditionally hidden, skip validation
  if (!isFieldVisible(field, allValues)) {
    return null;
  }

  const strVal = String(val ?? '').trim();
  const isRequired = field.mandatory || field.validation?.required;

  // 1. Mandatory check
  if (isRequired) {
    if (field.type === 'checkbox') {
      if (!val) {
        return field.validation?.customError || `${field.label} must be checked.`;
      }
    } else if (field.type === 'photo' || field.type === 'file') {
      if (!val || (Array.isArray(val) && val.length === 0)) {
        return field.validation?.customError || `Please upload ${field.label}.`;
      }
    } else if (!strVal) {
      return field.validation?.customError || `${field.label} is required.`;
    }
  }

  // If empty and not required, skip further value-specific checks
  if (!strVal && (field.type !== 'checkbox' && field.type !== 'photo' && field.type !== 'file')) {
    return null;
  }

  // 2. Text / Textarea min/max length
  if (field.type === 'text' || field.type === 'textarea') {
    if (field.validation?.minLength && strVal.length < field.validation.minLength) {
      return `Minimum ${field.validation.minLength} characters required.`;
    }
    if (field.validation?.maxLength && strVal.length > field.validation.maxLength) {
      return `Maximum length of ${field.validation.maxLength} characters exceeded.`;
    }
    if (field.validation?.pattern) {
      try {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(strVal)) {
          return field.validation.customError || `Invalid format for ${field.label}.`;
        }
      } catch (e) {
        // Safe fallback if administrator provided malformed regex
      }
    }
  }

  // 3. Email format
  if (field.type === 'email') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(strVal)) {
      return 'Please enter a valid email address.';
    }
  }

  // 4. Phone format
  if (field.type === 'phone') {
    const phoneRegex = /^[6-9]\d{9}$/;
    const digitsOnly = strVal.replace(/\D/g, '');
    if (!phoneRegex.test(digitsOnly)) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
  }

  // 5. Number / Currency bounds
  if (field.type === 'number' || field.type === 'currency') {
    const num = Number(strVal.replace(/[₹,\s]/g, ''));
    if (isNaN(num)) {
      return 'Please enter a valid numeric value.';
    }
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return `Value cannot be less than ${field.validation.min}.`;
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return `Value cannot exceed ${field.validation.max}.`;
    }
  }

  // 6. Date bounds
  if (field.type === 'datepicker') {
    if (field.validation?.pastOnly || field.validation?.futureOnly) {
      const today = new Date().toISOString().split('T')[0];
      if (field.validation.pastOnly && strVal > today) {
        return `${field.label} cannot be a future date.`;
      }
      if (field.validation.futureOnly && strVal < today) {
        return `${field.label} must be a future date.`;
      }
    }
  }

  return null;
}

/**
 * Validates a list of fields and returns a record of fieldId -> error message.
 */
export function validateFieldsList(
  fields: DynamicFormField[],
  values: Record<string, any>
): Record<string, string> {
  const errors: Record<string, string> = {};
  fields.forEach(field => {
    const err = validateFieldValue(field, values[field.id], values);
    if (err) {
      errors[field.id] = err;
    }
  });
  return errors;
}

/**
 * Safe conversion from Direct Form fields to Step Form wizard without losing any field definitions.
 */
export function convertDirectToStep(
  fields: DynamicFormField[],
  existingSteps?: FormStep[]
): FormStep[] {
  if (existingSteps && existingSteps.length > 0) {
    // Preserve existing step structure, updating step 1 fields if empty
    const cloned = existingSteps.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    if (cloned[0].fields.length === 0 && fields.length > 0) {
      cloned[0].fields = [...fields];
    }
    return cloned;
  }

  // Fresh conversion: place all existing direct fields into Step 1
  return [
    {
      id: 'stp-' + Date.now() + '-1',
      stepNumber: 1,
      title: 'Step 1: General Details',
      fields: fields.length > 0 ? [...fields] : [
        { id: 'fld-' + Date.now() + '-1', label: '', type: 'text', mandatory: true }
      ]
    }
  ];
}

/**
 * Safe conversion from Step Form wizard to Direct Form without data loss:
 * Flattens all fields across all steps into a single continuous fields array.
 */
export function convertStepToDirect(steps: FormStep[]): DynamicFormField[] {
  if (!steps || steps.length === 0) {
    return [{ id: 'fld-' + Date.now() + '-1', label: '', type: 'text', mandatory: true }];
  }
  const merged: DynamicFormField[] = [];
  steps.forEach(step => {
    if (step.fields && step.fields.length > 0) {
      merged.push(...step.fields);
    }
  });
  return merged.length > 0 ? merged : [
    { id: 'fld-' + Date.now() + '-1', label: '', type: 'text', mandatory: true }
  ];
}
