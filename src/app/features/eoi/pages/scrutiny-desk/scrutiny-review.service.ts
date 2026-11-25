import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { HttpService } from '../../../../core/http/http.service';
import { ReviewDetail } from './scrutiny-desk.util';

const QUIET = { skipErrorToast: true };

/**
 * One submitted application on the department's Scrutiny Desk (`/api/eoi/responses/applications/{id}`).
 * Only the EOI's committee can read it, after the closing date; only the approver can decide. Every action answers
 * with the application as the backend now has it. Errors reach the caller as `ApiError` (no toast).
 */
@Injectable({ providedIn: 'root' })
export class ScrutinyReviewService {
  private readonly http = inject(HttpService);

  get(applicationId: number): Observable<ReviewDetail> {
    return this.http.call<ReviewDetail>(API_ENDPOINTS.EOI_RESPONSES.APPLICATION, { id: applicationId, flags: QUIET });
  }

  addRemark(applicationId: number, remark: string): Observable<ReviewDetail> {
    return this.http.call<ReviewDetail>(API_ENDPOINTS.EOI_RESPONSES.REMARK, { id: applicationId, body: { remark }, flags: QUIET });
  }

  /** version: the detail's decisionVersion; the backend refuses the decision when someone changed it since. */
  approve(applicationId: number, grade: string, remark: string, version: string | null): Observable<ReviewDetail> {
    return this.http.call<ReviewDetail>(API_ENDPOINTS.EOI_RESPONSES.APPROVE, {
      id: applicationId,
      body: { grade, remark: remark || null, version },
      flags: QUIET
    });
  }

  reject(applicationId: number, remark: string, version: string | null): Observable<ReviewDetail> {
    return this.http.call<ReviewDetail>(API_ENDPOINTS.EOI_RESPONSES.REJECT, { id: applicationId, body: { remark, version }, flags: QUIET });
  }

  /** A document the applicant uploaded with the application. */
  documentBlob(applicationId: number, documentId: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_RESPONSES.DOCUMENT, { id: `${applicationId}/${documentId}`, flags: QUIET });
  }

  /** Every uploaded document of the application in one ZIP. */
  documentsZip(applicationId: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_RESPONSES.DOCUMENTS_ZIP, { id: applicationId, flags: QUIET });
  }

  /** A document from the applicant's One Time Registration (documentType: gst-certificate, pan-card ...). */
  otrDocumentBlob(applicationId: number, documentType: string): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_RESPONSES.OTR_DOCUMENT, { id: `${applicationId}/${documentType}`, flags: QUIET });
  }
}
