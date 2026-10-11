import { describe, it, expect } from 'vitest';
import { GRIEVANCE_STATUS_BADGE, grievanceStatusVariant } from './grievance.shared';

describe('grievance.shared', () => {
  it('maps every status to a badge variant', () => {
    expect(GRIEVANCE_STATUS_BADGE['Open']).toBe('info');
    expect(GRIEVANCE_STATUS_BADGE['In progress']).toBe('warning');
    expect(GRIEVANCE_STATUS_BADGE['Resolved']).toBe('success');
    expect(GRIEVANCE_STATUS_BADGE['closed']).toBe('neutral');
  });

  it('falls back to neutral for unknown or missing statuses', () => {
    expect(grievanceStatusVariant('Escalated')).toBe('neutral');
    expect(grievanceStatusVariant(undefined)).toBe('neutral');
  });
});
