import { describe, it, expect } from 'vitest';
import type { BatchRecord } from '../models/batch.model';
import {
  StudyMaterialDraft,
  acceptedFormats,
  canUploadStudyMaterial,
  formatFileSize,
  kindOf,
  sessionLabel,
  validateStudyMaterial
} from './study-material.util';

const draft = (overrides: Partial<StudyMaterialDraft> = {}): StudyMaterialDraft => ({
  type: 'DOCUMENT',
  title: 'Safety notes',
  scope: 'COURSE',
  sessionNo: '',
  sessionTopic: '',
  file: { name: 'notes.pdf', sizeBytes: 1024 * 1024, mimeType: 'application/pdf' },
  link: '',
  liveDate: '',
  liveTime: '',
  ...overrides
});

describe('study material', () => {
  it('accepts a complete file material', () => {
    expect(validateStudyMaterial(draft())).toEqual({});
  });

  it('asks for a title and a file', () => {
    const errors = validateStudyMaterial(draft({ title: ' ', file: null }));
    expect(errors['title']).toBeTruthy();
    expect(errors['file']).toBeTruthy();
  });

  it('rejects a file of the wrong format or above the limit', () => {
    expect(validateStudyMaterial(draft({ file: { name: 'clip.mp4', sizeBytes: 1000, mimeType: 'video/mp4' } }))['file']).toBeTruthy();
    const syllabus = draft({ type: 'SYLLABUS', file: { name: 'syllabus.pdf', sizeBytes: 11 * 1024 * 1024, mimeType: 'application/pdf' } });
    expect(validateStudyMaterial(syllabus)['file']).toContain('10 MB');
  });

  it('takes digital media by media group', () => {
    const photo = draft({ type: 'DIGITAL_MEDIA', file: { name: 'diagram.png', sizeBytes: 5000, mimeType: 'image/png' } });
    expect(validateStudyMaterial(photo)).toEqual({});
    const sheet = draft({ type: 'DIGITAL_MEDIA', file: { name: 'sheet.xlsx', sizeBytes: 5000, mimeType: 'application/vnd.ms-excel' } });
    expect(validateStudyMaterial(sheet)['file']).toBeTruthy();
  });

  it('needs a session number only for a specific session', () => {
    expect(validateStudyMaterial(draft({ scope: 'SESSION', sessionNo: '' }))['sessionNo']).toBeTruthy();
    expect(validateStudyMaterial(draft({ scope: 'SESSION', sessionNo: '0' }))['sessionNo']).toBeTruthy();
    expect(validateStudyMaterial(draft({ scope: 'SESSION', sessionNo: '3' }))).toEqual({});
  });

  it('asks a live training video for a link, a date and a time instead of a file', () => {
    const live = draft({ type: 'LIVE_VIDEO', file: null });
    const errors = validateStudyMaterial(live);
    expect(errors['link']).toBeTruthy();
    expect(errors['liveDate']).toBeTruthy();
    expect(errors['liveTime']).toBeTruthy();
    expect(errors['file']).toBeUndefined();
    expect(validateStudyMaterial({ ...live, link: 'https://meet.example.com/abc', liveDate: '2026-11-02', liveTime: '10:30' })).toEqual({});
  });

  it('describes sizes, formats and sessions in words', () => {
    expect(formatFileSize(850 * 1024)).toBe('850 KB');
    expect(formatFileSize(12.4 * 1024 * 1024)).toBe('12.4 MB');
    expect(acceptedFormats(kindOf('SYLLABUS'))).toBe('PDF, DOC, DOCX');
    expect(acceptedFormats(kindOf('DIGITAL_MEDIA'))).toBe('image, audio or video');
    expect(sessionLabel({})).toBe('Whole course');
    expect(sessionLabel({ sessionNo: 3, sessionTopic: 'Safety' })).toBe('Session 3: Safety');
  });

  it('opens uploads only for approved batches', () => {
    const batchOf = (status: string, approvalStatus: string) => ({ status, approvalStatus }) as unknown as BatchRecord;
    expect(canUploadStudyMaterial(batchOf('APPROVED', 'APPROVED'))).toBe(true);
    expect(canUploadStudyMaterial(batchOf('ONGOING', 'APPROVED'))).toBe(true);
    expect(canUploadStudyMaterial(batchOf('RETURNED_TO_TP', 'RETURNED'))).toBe(false);
    expect(canUploadStudyMaterial(batchOf('PENDING_APPROVAL', 'PENDING'))).toBe(false);
    expect(canUploadStudyMaterial(batchOf('REJECTED', 'REJECTED'))).toBe(false);
  });
});
