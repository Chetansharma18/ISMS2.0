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

export const GRIEVANCE_STATUS_BADGE: Record<GrievanceStatus, BadgeVariant> = {
  'Open': 'info',
  'In progress': 'warning',
  'Resolved': 'success',
  'closed': 'neutral'
};

export function grievanceStatusVariant(status: GrievanceStatus | string | undefined): BadgeVariant {
  return GRIEVANCE_STATUS_BADGE[status as GrievanceStatus] ?? 'neutral';
}
