import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { createPersistedStore } from '../../../../core/services/persisted-store';
import { INITIAL_MOU_DOCUMENTS, MouDocument } from './mou.model';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';

/** Signed MoU documents (resource `MOU_DOCUMENTS`: mock storage or the API, per mock.config.ts). */
@Injectable({
  providedIn: 'root'
})
export class MouService {
  private readonly docViewer = inject(DocumentViewerService);

  private readonly store = createPersistedStore<MouDocument>({
    key: 'isms_mou_documents',
    dataKey: 'MOU_DOCUMENTS',
    seed: INITIAL_MOU_DOCUMENTS
  });

  private readonly documentsSubject = new BehaviorSubject<MouDocument[]>(this.store.items());
  readonly documents$ = this.documentsSubject.asObservable();

  constructor() {
    // Follows the store when it changes on its own (API load, another tab).
    toObservable(this.store.items).subscribe(list => {
      if (list !== this.documentsSubject.value) this.documentsSubject.next(list);
    });
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

    this.save([newDoc, ...list]);
    return of(newDoc);
  }

  deleteDocument(id: string): Observable<boolean> {
    this.save(this.documentsSubject.value.filter(d => d.id !== id));
    return of(true);
  }

  private save(list: MouDocument[]): void {
    this.store.items.set(list);
    this.store.persist(list);
    this.documentsSubject.next(list);
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
