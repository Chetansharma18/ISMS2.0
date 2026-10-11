import { signal } from '@angular/core';
import { AspirantDocumentItem, AspirantFormData } from '../../config/aspirant-form.config';
import {
  DEFAULT_AADHAAR_CARD_DATA_URL,
  DEFAULT_CANDIDATE_PHOTO_DATA_URL,
  generateDocumentPreviewSvg
} from './aspirant-document-preview.util';

/** Shape consumed by the shared document viewer modal. */
export interface AspirantViewerDoc {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'uploaded' | 'empty' | 'uploading';
  fileUrl: string;
}

/**
 * Signal state for the universal document viewer on the aspirant wizard.
 * It reads the (parent-owned, mutable) form data lazily so previews always use the latest values.
 */
export class AspirantDocumentViewerState {
  readonly isOpen = signal<boolean>(false);
  readonly title = signal<string>('Aadhaar Card Document Proof');
  readonly doc = signal<AspirantViewerDoc>({
    fileName: 'Aadhaar_Candidate_Card.pdf',
    fileSize: '1.4 MB',
    uploadDate: 'Today',
    status: 'uploaded',
    fileUrl: ''
  });

  constructor(private readonly getFormData: () => AspirantFormData) {}

  viewAadhaar(): void {
    const formData = this.getFormData();
    this.title.set('Aadhaar Card Document Proof');
    this.doc.set({
      fileName: formData.aadhaarDocName || 'Aadhaar_Candidate_Card.pdf',
      fileSize: formData.aadhaarDocSize || '1.4 MB',
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl: formData.aadhaarDocUrl || DEFAULT_AADHAAR_CARD_DATA_URL
    });
    this.isOpen.set(true);
  }

  viewPhoto(): void {
    const formData = this.getFormData();
    this.title.set('Candidate Photograph');
    this.doc.set({
      fileName: formData.candidatePhotoName || 'Candidate_Photograph.jpg',
      fileSize: '350 KB',
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl: formData.candidatePhotoUrl || DEFAULT_CANDIDATE_PHOTO_DATA_URL
    });
    this.isOpen.set(true);
  }

  viewDocument(doc: AspirantDocumentItem): void {
    const formData = this.getFormData();
    this.title.set(`${doc.itemNumber ? doc.itemNumber + '. ' : ''}${doc.docName}`);
    this.doc.set({
      fileName: doc.fileName || `${doc.docName}.pdf`,
      fileSize: doc.fileSize || '1.2 MB',
      uploadDate: doc.uploadedAt || 'Today',
      status: 'uploaded',
      fileUrl:
        doc.fileUrl ||
        generateDocumentPreviewSvg(doc.docName, doc.description || '', formData.aspirantName, formData.aadhaarNo)
    });
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
