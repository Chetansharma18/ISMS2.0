import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { StorageService } from '../../../../core/services/storage.service';
import { INITIAL_MOU_DOCUMENTS, MouDocument } from './mou.model';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';

const STORAGE_KEY = 'isms_mou_documents';

@Injectable({
  providedIn: 'root'
})
export class MouService {
  private readonly storage = inject(StorageService);
  private readonly docViewer = inject(DocumentViewerService);

  private readonly documentsSubject = new BehaviorSubject<MouDocument[]>(this.loadInitial());
  readonly documents$ = this.documentsSubject.asObservable();

  private loadInitial(): MouDocument[] {
    try {
      const stored = this.storage.getItem<MouDocument[]>(STORAGE_KEY);
      if (Array.isArray(stored) && stored.length > 0) {
        return stored;
      }
    } catch {
      // Fallback to initial seeds
    }
    const initial = [...INITIAL_MOU_DOCUMENTS];
    this.storage.setItem(STORAGE_KEY, initial);
    return initial;
  }

  getDocuments(): Observable<MouDocument[]> {
    return this.documents$;
  }

  uploadDocument(title: string, file?: File | null, fileNameOverride?: string, fileSizeOverride?: string): Observable<MouDocument> {
    const list = this.documentsSubject.value;
    const fileName = file ? file.name : (fileNameOverride || 'Signed_MoU.pdf');
    const fileSize = file ? this.formatFileSize(file.size) : (fileSizeOverride || '2.0 MB');

    if (file) {
      this.docViewer.registerFile(fileName, file);
    }

    const newDoc: MouDocument = {
      id: `mou-doc-${Date.now()}`,
      title: title.trim(),
      fileName,
      fileSize,
      uploadedOn: this.formatNow(),
      uploadedBy: 'Department User'
    };

    const updated = [newDoc, ...list];
    this.documentsSubject.next(updated);
    this.storage.setItem(STORAGE_KEY, updated);
    return of(newDoc);
  }

  deleteDocument(id: string): Observable<boolean> {
    const list = this.documentsSubject.value;
    const filtered = list.filter(d => d.id !== id);
    this.documentsSubject.next(filtered);
    this.storage.setItem(STORAGE_KEY, filtered);
    return of(true);
  }

  private formatFileSize(bytes: number): string {
    const sizeMb = bytes / (1024 * 1024);
    return sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  private formatNow(): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }
}
