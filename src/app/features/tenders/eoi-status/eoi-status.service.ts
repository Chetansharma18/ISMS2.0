import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { HttpService } from '../../../core/http/http.service';
import type { EoiAppealInfo, EoiStatusApplication, EoiStatusPage } from './eoi-status.model';

const QUIET = { skipErrorToast: true };

/**
 * The signed-in organisation's EOI applications on EOI Status (`/api/eoi/apply`, EoiApplications permission).
 * Errors reach the caller as `ApiError` (no toast).
 */
@Injectable({ providedIn: 'root' })
export class EoiStatusService {
  private readonly http = inject(HttpService);

  list(status: string | null, page = 1, pageSize = 100): Observable<EoiStatusPage> {
    return this.http.call<EoiStatusPage>(API_ENDPOINTS.EOI_APPLY.MY_APPLICATIONS, {
      params: { status, page, pageSize },
      flags: QUIET
    });
  }

  get(id: number): Observable<EoiStatusApplication> {
    return this.http.call<EoiStatusApplication>(API_ENDPOINTS.EOI_APPLY.APPLICATION, { id, flags: QUIET });
  }

  resultOrder(id: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_APPLY.RESULT_ORDER, { id, flags: QUIET });
  }

  document(id: number, documentId: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_APPLY.DOCUMENT, { id: `${id}/${documentId}`, flags: QUIET });
  }

  uploadClarification(id: number, title: string, file: File): Observable<EoiStatusApplication> {
    const body = new FormData();
    body.append('title', title);
    body.append('file', file, file.name);
    return this.http.call<EoiStatusApplication>(API_ENDPOINTS.EOI_APPLY.CLARIFICATION_UPLOAD, { id, body, flags: QUIET });
  }

  submitClarification(id: number, comment: string): Observable<EoiStatusApplication> {
    return this.http.call<EoiStatusApplication>(API_ENDPOINTS.EOI_APPLY.CLARIFICATION_SUBMIT, { id, body: { comment }, flags: QUIET });
  }

  submitAppeal(id: number, reason: string, files: { title: string; file: File }[]): Observable<EoiAppealInfo> {
    const body = new FormData();
    body.append('reason', reason);
    for (const f of files) {
      body.append('files', f.file, f.file.name);
      body.append('titles', f.title);
    }
    return this.http.call<EoiAppealInfo>(API_ENDPOINTS.EOI_APPLY.APPEAL_SUBMIT, { id, body, flags: QUIET });
  }

  uploadAppealDocument(id: number, title: string, file: File): Observable<EoiAppealInfo> {
    const body = new FormData();
    body.append('title', title);
    body.append('file', file, file.name);
    return this.http.call<EoiAppealInfo>(API_ENDPOINTS.EOI_APPLY.APPEAL_UPLOAD, { id, body, flags: QUIET });
  }

  submitAppealResponse(id: number, text: string): Observable<EoiAppealInfo> {
    return this.http.call<EoiAppealInfo>(API_ENDPOINTS.EOI_APPLY.APPEAL_RESPONSE, { id, body: { text }, flags: QUIET });
  }

  appealDocument(id: number, documentId: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_APPLY.APPEAL_DOCUMENT, { id: `${id}/${documentId}`, flags: QUIET });
  }
}
