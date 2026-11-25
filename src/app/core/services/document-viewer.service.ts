import { Injectable } from '@angular/core';
import { FileDoc } from '../../features/registration/models/otr-form.model';

export interface DocumentPreviewPayload {
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadDate?: string;
  title?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentViewerService {
  /**
   * The single authentic RFP document provided in public/document/ISMS RFP.pdf
   * Accessible in the browser via /document/ISMS%20RFP.pdf
   */
  readonly RFP_DOCUMENT_PATH = encodeURI('/document/ISMS RFP.pdf');

  /** In-memory cache of uploaded File objects keyed by filename / id */
  private fileCache = new Map<string, File>();

  /**
   * Registers a newly selected File in the cache and returns a fresh object URL.
   */
  registerFile(fileName: string, file: File): string {
    this.fileCache.set(fileName, file);
    try {
      return URL.createObjectURL(file);
    } catch {
      return this.RFP_DOCUMENT_PATH;
    }
  }

  /**
   * Opens the document directly in a NEW Chrome tab (`_blank`).
   * Opens the single authentic RFP document from public/document/ISMS RFP.pdf
   * without creating any synthetic HTML templates or mock viewers.
   */
  openDocument(
    _doc?: FileDoc | DocumentPreviewPayload | string | null,
    _fallbackTitle?: string
  ): void {
    window.open(this.RFP_DOCUMENT_PATH, '_blank');
  }
}
