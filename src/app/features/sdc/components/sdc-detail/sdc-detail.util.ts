import { SdcRecord } from '../../models/sdc.model';
import { RAJASTHAN_LOCATION_DATA } from '../../config/sdc-form.config';

/** Human readable label for an SDC workflow status. */
export function formatSdcStatus(status?: string): string {
  switch (status) {
    case 'APPROVED': return 'Approved';
    case 'PENDING_INSPECTION': return 'Pending Inspection';
    case 'INSPECTION_COMPLETED': return 'Inspection Completed';
    case 'PENDING_APPROVAL': return 'Pending Approval';
    case 'REJECTED': return 'Rejected';
    case 'RETURNED_TO_TP': return 'Returned to TP';
    case 'DRAFT': return 'Draft';
    case 'SUBMITTED': return 'Submitted';
    default: return status || '—';
  }
}

export interface DistrictLocationSelection {
  division: string;
  assemblyConstituencies: string[];
  parliamentConstituencies: string[];
  blocks: string[];
  assemblyConstituency: string;
  parliamentConstituency: string;
  block: string;
}

/**
 * Resolves dropdown options for a district (falls back to Jaipur data for unknown districts) and
 * keeps the current selections when still valid, otherwise picks the first option.
 */
export function resolveDistrictLocation(
  district: string,
  current: { assemblyConstituency?: string; parliamentConstituency?: string; block?: string }
): DistrictLocationSelection | null {
  const info = RAJASTHAN_LOCATION_DATA[district] || RAJASTHAN_LOCATION_DATA['Jaipur'];
  if (!info) return null;

  const assemblyConstituencies = info.assemblyConstituencies || [];
  const parliamentConstituencies = info.parliamentConstituencies || [];
  const blocks = info.blocks || [];

  return {
    division: info.division,
    assemblyConstituencies,
    parliamentConstituencies,
    blocks,
    assemblyConstituency: assemblyConstituencies.includes(current.assemblyConstituency ?? '')
      ? (current.assemblyConstituency as string)
      : (assemblyConstituencies[0] || ''),
    parliamentConstituency: parliamentConstituencies.includes(current.parliamentConstituency ?? '')
      ? (current.parliamentConstituency as string)
      : (parliamentConstituencies[0] || ''),
    block: blocks.includes(current.block ?? '') ? (current.block as string) : (blocks[0] || '')
  };
}

/** Builds the editable form model for an SDC. Photos are deep-copied so edits can be cancelled. */
export function buildSdcEditModel(center: SdcRecord): any {
  return {
    sdcName: center.sdcName,
    sector: center.sector || 'Aerospace and Aviation',
    scheme: center.scheme,
    schemeCategory: center.schemeCategory || 'RAJKVIK',
    state: center.state || 'Rajasthan',
    district: center.district || 'Jaipur',
    assemblyConstituency: center.assemblyConstituency || '',
    parliamentConstituency: center.parliamentConstituency || '',
    division: center.division || 'Jaipur',
    block: center.block || '',
    proposedStartDate: center.proposedStartDate || '',
    sdcCapacity: center.sdcCapacity,
    centerEmail: center.centerEmail || '',
    fullAddress: center.fullAddress || '',
    pincode: center.pincode || '',
    totalTrainedAspirants: center.totalTrainedAspirants ?? 500,
    totalPlacedAspirants: center.totalPlacedAspirants ?? 400,
    hostelCategory: center.hostelCategory || 'Residential (Both Boys & Girls)',
    latitude: center.latitude,
    longitude: center.longitude,
    remarks: center.remarks || '',
    tpName: center.tpName || 'SkillMasters Rajasthan',
    centerPhotos: center.centerPhotos ? JSON.parse(JSON.stringify(center.centerPhotos)) : []
  };
}

/** Creates the photo item stored on the edit model for an uploaded file. */
export function buildCenterPhotoItem(
  file: { name: string; size: number },
  url: string,
  existingCount: number,
  index: number
): { id: string; name: string; url: string; size: string; tag: string } {
  return {
    id: `photo-${Date.now()}-${index}`,
    name: file.name,
    url,
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
    tag: `Photo ${existingCount + 1}`
  };
}
