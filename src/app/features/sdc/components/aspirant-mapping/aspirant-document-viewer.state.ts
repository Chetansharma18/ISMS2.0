import { signal } from '@angular/core';
import { AspirantDocumentItem, AspirantFormData } from '../../config/aspirant-form.config';
import {
  DEFAULT_AADHAAR_CARD_DATA_URL,
  DEFAULT_CANDIDATE_PHOTO_DATA_URL,
  generateDocumentPreviewSvg
} from './aspirant-document-preview.util';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';

/** Shape consumed by document viewer. */
export interface AspirantViewerDoc {
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'uploaded' | 'empty' | 'uploading';
  fileUrl: string;
}

/**
 * State for opening candidate documents directly in another tab in Chrome.
 * Reads the (parent-owned, mutable) form data lazily so previews always use the latest values.
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

  constructor(
    private readonly getFormData: () => AspirantFormData,
    private readonly docViewer?: DocumentViewerService
  ) {}

  viewAadhaar(): void {
    const formData = this.getFormData();
    const fileName = formData.aadhaarDocName || 'Aadhaar_Candidate_Card.pdf';
    const fileSize = formData.aadhaarDocSize || '1.4 MB';
    const fileUrl = formData.aadhaarDocUrl || DEFAULT_AADHAAR_CARD_DATA_URL;
    const title = 'Aadhaar Card Document Proof';

    this.title.set(title);
    this.doc.set({
      fileName,
      fileSize,
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl
    });

    if (this.docViewer) {
      this.docViewer.openDocument({ fileName, fileSize, fileUrl, status: 'uploaded' }, title);
    }
  }

  viewPhoto(): void {
    const formData = this.getFormData();
    const fileName = formData.candidatePhotoName || 'Candidate_Photograph.jpg';
    const fileSize = '350 KB';
    const fileUrl = formData.candidatePhotoUrl || DEFAULT_CANDIDATE_PHOTO_DATA_URL;
    const title = 'Candidate Photograph';

    this.title.set(title);
    this.doc.set({
      fileName,
      fileSize,
      uploadDate: 'Today',
      status: 'uploaded',
      fileUrl
    });

    if (this.docViewer) {
      this.docViewer.openDocument({ fileName, fileSize, fileUrl, status: 'uploaded' }, title);
    }
  }

  viewDocument(doc: AspirantDocumentItem): void {
    const formData = this.getFormData();
    const title = `${doc.itemNumber ? doc.itemNumber + '. ' : ''}${doc.docName}`;
    const fileName = doc.fileName || `${doc.docName}.pdf`;
    const fileSize = doc.fileSize || '1.2 MB';
    const uploadDate = doc.uploadedAt || 'Today';
    const fileUrl =
      doc.fileUrl ||
      generateDocumentPreviewSvg(doc.docName, doc.description || '', formData.aspirantName, formData.aadhaarNo);

    this.title.set(title);
    this.doc.set({
      fileName,
      fileSize,
      uploadDate,
      status: 'uploaded',
      fileUrl
    });

    if (this.docViewer) {
      this.docViewer.openDocument({ fileName, fileSize, uploadDate, fileUrl, status: 'uploaded' }, title);
    }
  }

  close(): void {
    this.isOpen.set(false);
  }
}
