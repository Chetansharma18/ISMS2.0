import { describe, it, expect } from 'vitest';
import type { AspirantDocumentItem, AspirantFormData } from '../../config/aspirant-form.config';
import { AspirantDocumentViewerState } from './aspirant-document-viewer.state';
import {
  DEFAULT_AADHAAR_CARD_DATA_URL,
  DEFAULT_CANDIDATE_PHOTO_DATA_URL
} from './aspirant-document-preview.util';

const makeFormData = (overrides: Partial<AspirantFormData> = {}): AspirantFormData =>
  ({
    aspirantName: 'Asha Verma',
    aadhaarNo: '123456789012',
    aadhaarDocName: '',
    aadhaarDocSize: '',
    aadhaarDocUrl: '',
    candidatePhotoName: '',
    candidatePhotoUrl: '',
    documents: [],
    ...overrides
  }) as AspirantFormData;

const makeDoc = (overrides: Partial<AspirantDocumentItem> = {}): AspirantDocumentItem => ({
  id: 'doc-1',
  itemNumber: 3,
  docType: 'Certificate',
  docName: 'Caste Certificate',
  status: 'PENDING',
  ...overrides
});

describe('AspirantDocumentViewerState', () => {
  it('starts closed with the Aadhaar title', () => {
    const state = new AspirantDocumentViewerState(() => makeFormData());
    expect(state.isOpen()).toBe(false);
    expect(state.title()).toBe('Aadhaar Card Document Proof');
  });

  it('opens the Aadhaar viewer with defaults when nothing is uploaded', () => {
    const state = new AspirantDocumentViewerState(() => makeFormData());
    state.viewAadhaar();
    expect(state.isOpen()).toBe(true);
    expect(state.doc().fileName).toBe('Aadhaar_Candidate_Card.pdf');
    expect(state.doc().fileSize).toBe('1.4 MB');
    expect(state.doc().fileUrl).toBe(DEFAULT_AADHAAR_CARD_DATA_URL);
  });

  it('uses the uploaded Aadhaar file when present', () => {
    const state = new AspirantDocumentViewerState(() =>
      makeFormData({ aadhaarDocName: 'my.pdf', aadhaarDocSize: '2.0 MB', aadhaarDocUrl: 'data:application/pdf;base64,AA==' })
    );
    state.viewAadhaar();
    expect(state.doc()).toEqual({
      fileName: 'my.pdf',
      fileSize: '2.0 MB',
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl: 'data:application/pdf;base64,AA=='
    });
  });

  it('opens the candidate photo with defaults, then with the uploaded photo', () => {
    let formData = makeFormData();
    const state = new AspirantDocumentViewerState(() => formData);
    state.viewPhoto();
    expect(state.title()).toBe('Candidate Photograph');
    expect(state.doc().fileName).toBe('Candidate_Photograph.jpg');
    expect(state.doc().fileUrl).toBe(DEFAULT_CANDIDATE_PHOTO_DATA_URL);

    formData = makeFormData({ candidatePhotoName: 'me.png', candidatePhotoUrl: 'data:image/png;base64,AA==' });
    state.viewPhoto();
    expect(state.doc().fileName).toBe('me.png');
    expect(state.doc().fileUrl).toBe('data:image/png;base64,AA==');
  });

  it('titles a document with its item number and falls back to a generated preview', () => {
    const state = new AspirantDocumentViewerState(() => makeFormData());
    state.viewDocument(makeDoc());
    expect(state.title()).toBe('3. Caste Certificate');
    expect(state.doc().fileName).toBe('Caste Certificate.pdf');
    expect(state.doc().fileSize).toBe('1.2 MB');
    expect(state.doc().uploadDate).toBe('Today');
    expect(state.doc().fileUrl.startsWith('data:image/svg+xml;charset=UTF-8,')).toBe(true);
  });

  it('omits the number prefix when the document has none and uses the uploaded file', () => {
    const state = new AspirantDocumentViewerState(() => makeFormData());
    state.viewDocument(
      makeDoc({
        itemNumber: undefined,
        fileName: 'c.pdf',
        fileSize: '0.4 MB',
        fileUrl: 'blob:abc',
        uploadedAt: 'Just now',
        status: 'UPLOADED'
      })
    );
    expect(state.title()).toBe('Caste Certificate');
    expect(state.doc()).toEqual({
      fileName: 'c.pdf',
      fileSize: '0.4 MB',
      uploadDate: 'Just now',
      status: 'uploaded',
      fileUrl: 'blob:abc'
    });
  });

  it('close() hides the viewer', () => {
    const state = new AspirantDocumentViewerState(() => makeFormData());
    state.viewAadhaar();
    state.close();
    expect(state.isOpen()).toBe(false);
  });
});
