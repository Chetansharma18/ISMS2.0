import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { HttpService } from '../../../../core/http/http.service';
import { EoiAnswerValue, EoiApplication, EoiPaymentInitiate, EoiProposalDetails } from './eoi-apply.model';

const QUIET = { skipErrorToast: true };

/**
 * The signed-in applicant's EOI application on the backend (`/api/eoi/apply`). Every call answers with the
 * whole application as the backend now has it. Errors reach the caller as `ApiError` (no toast).
 */
@Injectable({ providedIn: 'root' })
export class EoiApplyService {
  private readonly http = inject(HttpService);

  /** Starts my application for the EOI, or resumes the one I already have. */
  start(eoiId: number): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.START, { id: eoiId, flags: QUIET });
  }

  get(applicationId: number): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.APPLICATION, { id: applicationId, flags: QUIET });
  }

  /** complete: leaving the step, so the backend also checks the mandatory questions. */
  saveAnswers(applicationId: number, answers: Record<string, EoiAnswerValue>, complete: boolean): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.SAVE_ANSWERS, {
      id: applicationId,
      body: { answers },
      params: { complete },
      flags: QUIET
    });
  }

  /** The EOI Form's built-in sections; complete: leaving the step, so the backend also checks the required fields. */
  saveProposalDetails(applicationId: number, details: EoiProposalDetails, complete: boolean): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.PROPOSAL_DETAILS, {
      id: applicationId,
      body: details,
      params: { complete },
      flags: QUIET
    });
  }

  uploadDocument(applicationId: number, requiredDocumentId: number, file: File, comment?: string | null): Observable<EoiApplication> {
    const body = new FormData();
    body.append('file', file, file.name);
    if (comment) body.append('comment', comment);
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.UPLOAD_DOCUMENT, { id: `${applicationId}/${requiredDocumentId}`, body, flags: QUIET });
  }

  setComment(applicationId: number, requiredDocumentId: number, comment: string): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.DOCUMENT_COMMENT, {
      id: `${applicationId}/${requiredDocumentId}`,
      body: { comment },
      flags: QUIET
    });
  }

  deleteDocument(applicationId: number, requiredDocumentId: number): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.DELETE_DOCUMENT, { id: `${applicationId}/${requiredDocumentId}`, flags: QUIET });
  }

  /** Starts an RPP payment for the fee; the backend sets the amount and ties it to this application. */
  initiatePayment(applicationId: number, fee: 'process-fee' | 'emd'): Observable<EoiPaymentInitiate> {
    return this.http.call<EoiPaymentInitiate>(API_ENDPOINTS.EOI_APPLY.INITIATE_PAYMENT, { id: `${applicationId}/${fee}`, flags: QUIET });
  }

  /** Records the processing fee paid on RPP (no PRN: the backend finds this application's payment). */
  confirmProcessFee(applicationId: number, prn: string | null): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.CONFIRM_PROCESS_FEE, {
      id: applicationId,
      body: prn ? { prn } : {},
      flags: QUIET
    });
  }

  /** EMD: `payment` (paid on RPP), `exemption` (MSME / Udyam) or `none` (withdraw an exemption). */
  setEmd(applicationId: number, mode: 'payment' | 'exemption' | 'none', prn: string | null = null): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.SET_EMD, { id: applicationId, body: { mode, prn }, flags: QUIET });
  }

  submit(applicationId: number, declarationAccepted: boolean): Observable<EoiApplication> {
    return this.http.call<EoiApplication>(API_ENDPOINTS.EOI_APPLY.SUBMIT, { id: applicationId, body: { declarationAccepted }, flags: QUIET });
  }

  /** One of my uploaded files (documentId is the uploaded file's id). */
  documentBlob(applicationId: number, documentId: number): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_APPLY.DOCUMENT, { id: `${applicationId}/${documentId}`, flags: QUIET });
  }
}
