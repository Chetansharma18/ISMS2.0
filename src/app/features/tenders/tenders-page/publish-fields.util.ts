import { DynamicFormField } from '../../../core/models/admin-masters.model';

/*
 * The Configure EOI custom fields:
 * - "Publish Details" fields are information FOR applicants: the department enters a value for each, and the EOI
 *   shows it read-only (backend: EoiOpenNoticeDetailDto.publishedInfo).
 * - "Uploading Details" fields are what the EOI requires FROM applicants: asked on the apply wizard.
 * These helpers check the Publish Details values the same way the backend does (EoiCustomFields.ValidatePublishValues).
 */

const NO_VALUE_TYPES = new Set(['file', 'photo', 'heading', 'divider']);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^[6-9]\d{9}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
}

/** The message for a Publish Details field's value, or null when it is fine. */
export function publishValueError(field: DynamicFormField): string | null {
  const type = String(field.type ?? 'text').toLowerCase();
  if (NO_VALUE_TYPES.has(type)) return null;
  const label = field.label?.trim() || 'this field';
  const value = field.value;
  if (isEmpty(value)) return field.mandatory ? `Please enter the value of ${label}.` : null;
  const text = typeof value === 'string' ? value.trim() : '';
  switch (type) {
    case 'number':
    case 'currency':
      return Number.isFinite(Number(text)) && text !== '' ? null : `${label} must be a number.`;
    case 'email':
      return EMAIL.test(text) ? null : `${label} must be a valid email address.`;
    case 'phone':
      return PHONE.test(text) ? null : `${label} must be a 10 digit mobile number.`;
    case 'datepicker':
      return DATE.test(text) ? null : `${label} must be a date.`;
    case 'dropdown':
    case 'radio': {
      const options = field.options ?? [];
      return options.length === 0 || options.includes(text) ? null : `${label}: choose one of the listed options.`;
    }
    case 'checkbox':
      return typeof value === 'boolean' ? null : `${label} must be Yes or No.`;
    default:
      return text.length > 2000 ? `${label} cannot exceed 2000 characters.` : null;
  }
}

/** Index and message of every Publish Details field whose value is missing or wrong. */
export function publishValueErrors(fields: readonly DynamicFormField[] | null | undefined): { index: number; message: string }[] {
  return (fields ?? []).flatMap((f, index) => {
    const message = publishValueError(f);
    return message ? [{ index, message }] : [];
  });
}

/** One Publish Details value as applicants see it (backend `publishedInfo`). */
export interface EoiPublishedInfo {
  key: string;
  label: string;
  type: string;
  value: string;
}

/** The value as display text: dates as dd-MM-yyyy, amounts in rupees, the rest as entered. */
export function publishedInfoText(info: Pick<EoiPublishedInfo, 'type' | 'value'>): string {
  const value = info.value ?? '';
  if (info.type === 'datepicker') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : value;
  }
  if (info.type === 'currency' && Number.isFinite(Number(value))) return `₹${Number(value).toLocaleString('en-IN')}`;
  return value;
}
