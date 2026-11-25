import { describe, it, expect } from 'vitest';
import {
  buildCenterPhotoItem,
  buildSdcEditModel,
  formatSdcStatus,
  resolveDistrictLocation
} from './sdc-detail.util';
import { SdcRecord } from '../../models/sdc.model';

const center = (overrides: Record<string, unknown> = {}): SdcRecord =>
  ({ id: 's1', sdcName: 'Center A', sdcCapacity: 120, scheme: 'RAJKVIK', ...overrides }) as unknown as SdcRecord;

describe('sdc-detail.util', () => {
  describe('formatSdcStatus', () => {
    it('maps known statuses to labels', () => {
      expect(formatSdcStatus('APPROVED')).toBe('Approved');
      expect(formatSdcStatus('PENDING_INSPECTION')).toBe('Pending Inspection');
      expect(formatSdcStatus('INSPECTION_COMPLETED')).toBe('Inspection Completed');
      expect(formatSdcStatus('PENDING_APPROVAL')).toBe('Pending Approval');
      expect(formatSdcStatus('REJECTED')).toBe('Rejected');
      expect(formatSdcStatus('RETURNED_TO_TP')).toBe('Returned to TP');
      expect(formatSdcStatus('DRAFT')).toBe('Draft');
      expect(formatSdcStatus('SUBMITTED')).toBe('Submitted');
    });

    it('echoes unknown statuses and shows a dash when missing', () => {
      expect(formatSdcStatus('SOMETHING_ELSE')).toBe('SOMETHING_ELSE');
      expect(formatSdcStatus(undefined)).toBe('—');
      expect(formatSdcStatus('')).toBe('—');
    });
  });

  describe('resolveDistrictLocation', () => {
    it('picks first options when current selections do not belong to the district', () => {
      const r = resolveDistrictLocation('Jodhpur', {
        assemblyConstituency: 'Sanganer',
        parliamentConstituency: 'Jaipur',
        block: 'Amber'
      });
      expect(r).not.toBeNull();
      expect(r!.division).toBe('Jodhpur');
      expect(r!.assemblyConstituency).toBe('Sardarpura');
      expect(r!.parliamentConstituency).toBe('Jodhpur');
      expect(r!.block).toBe('Balesar');
      expect(r!.parliamentConstituencies).toEqual(['Jodhpur']);
    });

    it('keeps current selections that are still valid', () => {
      const r = resolveDistrictLocation('Jaipur', {
        assemblyConstituency: 'Amber',
        parliamentConstituency: 'Jaipur Rural',
        block: 'Chomu'
      });
      expect(r!.assemblyConstituency).toBe('Amber');
      expect(r!.parliamentConstituency).toBe('Jaipur Rural');
      expect(r!.block).toBe('Chomu');
    });

    it('falls back to Jaipur data for unknown districts', () => {
      const r = resolveDistrictLocation('Nowhere', {});
      expect(r!.division).toBe('Jaipur');
      expect(r!.assemblyConstituency).toBe('Sanganer');
      expect(r!.block).toBe('Sanganer');
    });
  });

  describe('buildSdcEditModel', () => {
    it('applies defaults for missing optional fields', () => {
      const m = buildSdcEditModel(center());
      expect(m.sdcName).toBe('Center A');
      expect(m.sector).toBe('Aerospace and Aviation');
      expect(m.state).toBe('Rajasthan');
      expect(m.district).toBe('Jaipur');
      expect(m.schemeCategory).toBe('RAJKVIK');
      expect(m.totalTrainedAspirants).toBe(500);
      expect(m.totalPlacedAspirants).toBe(400);
      expect(m.hostelCategory).toBe('Residential (Both Boys & Girls)');
      expect(m.tpName).toBe('SkillMasters Rajasthan');
      expect(m.centerPhotos).toEqual([]);
      expect(m.sdcCapacity).toBe(120);
    });

    it('keeps zero values for trained / placed counts', () => {
      const m = buildSdcEditModel(center({ totalTrainedAspirants: 0, totalPlacedAspirants: 0 }));
      expect(m.totalTrainedAspirants).toBe(0);
      expect(m.totalPlacedAspirants).toBe(0);
    });

    it('deep copies photos so edits do not touch the original record', () => {
      const photos = [{ id: 'p1', name: 'a.jpg', url: 'data:x', size: '1.0 MB', tag: 'Photo 1' }];
      const c = center({ centerPhotos: photos });
      const m = buildSdcEditModel(c);
      expect(m.centerPhotos).toEqual(photos);
      expect(m.centerPhotos).not.toBe(photos);
      m.centerPhotos.push({ id: 'p2' });
      expect(photos.length).toBe(1);
    });
  });

  describe('buildCenterPhotoItem', () => {
    it('formats size in MB and numbers the tag after existing photos', () => {
      const item = buildCenterPhotoItem({ name: 'x.jpg', size: 2.5 * 1024 * 1024 }, 'data:img', 2, 0);
      expect(item.name).toBe('x.jpg');
      expect(item.url).toBe('data:img');
      expect(item.size).toBe('2.5 MB');
      expect(item.tag).toBe('Photo 3');
      expect(item.id.startsWith('photo-')).toBe(true);
      expect(item.id.endsWith('-0')).toBe(true);
    });
  });
});
