import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getDocExtension,
  stripFileExtension,
  todayIsoDate,
  buildFallbackDocuments,
  buildFallbackEditDocuments
} from './aspirant-document.util';
import { AspirantRecord } from '../../models/aspirant.model';

describe('aspirant-document.util', () => {
  it('formatFileSize renders megabytes with one decimal', () => {
    expect(formatFileSize(0)).toBe('0.0 MB');
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('getDocExtension upper-cases short extensions', () => {
    expect(getDocExtension('scan.pdf')).toBe('PDF');
    expect(getDocExtension('photo.jpeg')).toBe('JPEG');
  });

  it('getDocExtension falls back to DOC when missing or too long', () => {
    expect(getDocExtension()).toBe('DOC');
    expect(getDocExtension('')).toBe('DOC');
    expect(getDocExtension('archive.verylong')).toBe('DOC');
  });

  it('stripFileExtension removes only the trailing extension', () => {
    expect(stripFileExtension('marksheet.pdf')).toBe('marksheet');
    expect(stripFileExtension('my.file.name.png')).toBe('my.file.name');
    expect(stripFileExtension('noextension')).toBe('noextension');
  });

  it('todayIsoDate returns a YYYY-MM-DD string', () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('buildFallbackDocuments uses the aadhaar file details when present', () => {
    const cand = { aadhaarDocName: 'my_aadhaar.pdf', aadhaarDocSize: '3.3 MB' } as AspirantRecord;
    const docs = buildFallbackDocuments(cand);
    expect(docs.map(d => d.id)).toEqual(['doc-1', 'doc-2', 'doc-3']);
    expect(docs[0].fileName).toBe('my_aadhaar.pdf');
    expect(docs[0].fileSize).toBe('3.3 MB');
    expect(docs.every(d => d.status === 'UPLOADED' && d.uploadedAt === '2026-09-02')).toBe(true);
  });

  it('buildFallbackDocuments uses defaults when aadhaar details are absent', () => {
    const docs = buildFallbackDocuments({} as AspirantRecord);
    expect(docs[0].fileName).toBe('Aadhaar_Document.pdf');
    expect(docs[0].fileSize).toBe('1.4 MB');
  });

  it('buildFallbackEditDocuments has no upload date and a fixed aadhaar size', () => {
    const docs = buildFallbackEditDocuments({ aadhaarDocName: 'a.pdf', aadhaarDocSize: '9 MB' } as AspirantRecord);
    expect(docs).toHaveLength(3);
    expect(docs[0].fileName).toBe('a.pdf');
    expect(docs[0].fileSize).toBe('1.4 MB');
    expect(docs.every(d => d.uploadedAt === undefined)).toBe(true);
  });
});
