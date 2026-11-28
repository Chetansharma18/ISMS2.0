import { OtrFormDef, OtrUpdateLogDto } from './models/otr-api.model';
import { formatDate, formSteps, stepFields } from './otr-form.util';

/*
 * The OTR change history (GET /otr/me/update-logs) as rows for the screen: which step, created or updated, why, and
 * which fields changed, named by the form's own labels.
 */

/** Backend `section` of each step's logs. */
export const OTR_LOG_SECTIONS: Record<string, string> = {
  organisation: 'OrganisationDetails',
  'authorized-person': 'AuthorizedPerson',
  'bank-details': 'BankDetails'
};

export interface OtrUpdateLogRow {
  id: number;
  sNo: number;
  when: string;
  /** Sort key (ISO time). */
  createdAt: string;
  step: string;
  action: string;
  reason: string;
  changes: string;
}

const NON_FIELD_KEYS = new Set(['dynamicformid', 'dynamicformversion']);

function stepKeyOfSection(section: string): string | undefined {
  return Object.keys(OTR_LOG_SECTIONS).find(k => OTR_LOG_SECTIONS[k].toLowerCase() === section.toLowerCase());
}

/** "2026-01-02T10:05:00Z" -> "02-01-2026 15:35" (local time). */
export function formatLogTime(value: string): string {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return value ?? '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${formatDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** The changed fields of a log, by their labels on the form; "All details" for the first save. */
export function changedFieldLabels(log: Pick<OtrUpdateLogDto, 'section' | 'changedFields'>, form: OtrFormDef | null): string[] {
  const fields = log.changedFields ?? [];
  if (fields.includes('*')) return ['All details'];
  const stepKey = stepKeyOfSection(log.section);
  const step = form ? formSteps(form).find(s => s.key === stepKey) : undefined;
  const labels = new Map((step ? stepFields(step) : []).map(f => [f.key.toLowerCase(), f.label]));
  const names: string[] = [];
  for (const raw of fields) {
    const key = raw.trim();
    const lower = key.toLowerCase();
    if (!key || NON_FIELD_KEYS.has(lower)) continue;
    const label = lower === 'dynamicformanswers'
      ? 'Additional details'
      : labels.get(lower) ?? labels.get(lower.replace(/id$/, '')) ?? labels.get(`${lower}doc`) ?? key;
    if (!names.includes(label)) names.push(label);
  }
  return names;
}

/** Logs newest first, numbered, with the step title from the form. */
export function toUpdateLogRows(logs: readonly OtrUpdateLogDto[], form: OtrFormDef | null): OtrUpdateLogRow[] {
  const title = (section: string) => {
    const key = stepKeyOfSection(section);
    return (key && form?.steps.find(s => s.key === key)?.title) || section;
  };
  return [...logs]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map((log, i) => {
      const changes = changedFieldLabels(log, form);
      return {
        id: log.id,
        sNo: i + 1,
        when: formatLogTime(log.createdAt),
        createdAt: log.createdAt,
        step: title(log.section),
        action: log.action === 'Create' ? 'Created' : log.action === 'Update' ? 'Updated' : log.action,
        reason: log.reason?.trim() || '-',
        changes: changes.length > 0 ? changes.join(', ') : 'No field changed'
      };
    });
}
