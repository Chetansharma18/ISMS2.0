import { SafeResourceUrl } from '@angular/platform-browser';
import { BadgeVariant } from '../../shared/components/table/table.types';
import { GrievanceItem, AdminGrievanceItem } from '../../core/models/grievance.model';

/**
 * Shared by the citizen grievance list and the admin grievance desk so both
 * screens use one entity shape and one status -> badge colour mapping.
 */
export interface Grievance extends GrievanceItem {
  attachmentUrl?: SafeResourceUrl;
}

export interface AdminGrievance extends AdminGrievanceItem {
  attachmentUrl?: SafeResourceUrl;
}

export type GrievanceStatus = GrievanceItem['status'];

export const GRIEVANCE_STATUS_BADGE: Record<string, BadgeVariant> = {
  'Open': 'info',
  'open': 'info',
  'In progress': 'warning',
  'In Progress': 'warning',
  'Resolved': 'success',
  'resolved': 'success',
  'closed': 'neutral',
  'Closed': 'neutral'
};

export function grievanceStatusVariant(status: GrievanceStatus | string | undefined): BadgeVariant {
  if (!status) return 'neutral';
  return GRIEVANCE_STATUS_BADGE[status] ?? 'neutral';
}

export const DEFAULT_GRIEVANCE_SCHEMES: readonly string[] = [
  'Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)',
  'Vishwakarma Yuva Udyami Protsahan Yojana',
  'Mukhyamantri Yuva Swarojgar Yojana (2026)',
  'Mukhyamantri Yuva Sambal Yojana',
  'Mukhya Mantri Yuva Kaushal Yojana'
];
