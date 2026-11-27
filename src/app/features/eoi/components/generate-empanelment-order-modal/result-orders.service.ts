import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../core/config/api.config';
import { HttpService } from '../../../../core/http/http.service';
import {
  BulkUploadDto,
  ESignChallengeDto,
  OrderContent,
  OrderDto,
  OrderEditorDto,
  OrderType,
  OrdersOverviewDto,
  PublishResultDto,
  ReadinessDto
} from './result-orders.util';

const QUIET = { skipErrorToast: true };

/**
 * Evaluation Excel (bulk decisions), the result orders of one EOI and their e-sign on the backend. Errors reach the
 * caller as `ApiError` (no toast). Any committee member can check and apply an Excel; only the approver generates
 * and edits the orders; each order is e-signed by its own signing authority; the approver (or a publisher) publishes.
 */
@Injectable({ providedIn: 'root' })
export class ResultOrdersService {
  private readonly http = inject(HttpService);

  overview(eoiId: number): Observable<OrdersOverviewDto> {
    return this.http.call<OrdersOverviewDto>(API_ENDPOINTS.EOI_RESPONSES.ORDERS, { id: eoiId, flags: QUIET });
  }

  /** Checks the filled Excel row by row; nothing is saved yet. */
  uploadDecisions(eoiId: number, file: File): Observable<BulkUploadDto> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http.call<BulkUploadDto>(API_ENDPOINTS.EOI_RESPONSES.DECISIONS_UPLOAD, { id: eoiId, body, flags: QUIET });
  }

  /** Applies every change of a checked Excel, or none. */
  confirmDecisions(eoiId: number, uploadId: number): Observable<BulkUploadDto> {
    return this.http.call<BulkUploadDto>(API_ENDPOINTS.EOI_RESPONSES.DECISIONS_CONFIRM, { id: `${eoiId}/${uploadId}`, flags: QUIET });
  }

  generate(eoiId: number, type: OrderType, round = 1): Observable<OrderDto> {
    return this.http.call<OrderDto>(API_ENDPOINTS.EOI_RESPONSES.ORDER_GENERATE, { id: eoiId, body: { type, round }, flags: QUIET });
  }

  /** The editable text of the order with its rows. */
  content(eoiId: number, orderId: number): Observable<OrderEditorDto> {
    return this.http.call<OrderEditorDto>(API_ENDPOINTS.EOI_RESPONSES.ORDER_CONTENT, { id: `${eoiId}/${orderId}`, flags: QUIET });
  }

  /** Saves the edited text; the backend renders the draft PDF again. */
  saveContent(eoiId: number, orderId: number, content: OrderContent): Observable<OrderEditorDto> {
    return this.http.call<OrderEditorDto>(API_ENDPOINTS.EOI_RESPONSES.ORDER_SAVE_CONTENT, { id: `${eoiId}/${orderId}`, body: content, flags: QUIET });
  }

  /** The draft PDF, or the e-signed copy once released. */
  file(eoiId: number, orderId: number, signed: boolean): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.EOI_RESPONSES.ORDER_FILE, { id: `${eoiId}/${orderId}/${signed ? 'signed' : 'draft'}`, flags: QUIET });
  }

  /** What is still missing before the orders can be e-signed, and whether I can e-sign. */
  readiness(eoiId: number, round = 1): Observable<ReadinessDto> {
    return this.http.call<ReadinessDto>(API_ENDPOINTS.EOI_RESPONSES.RESULTS_READINESS, { id: eoiId, params: { round }, flags: QUIET });
  }

  /** Sends the e-sign OTP of one order to my mobile (only that order's signing authority may ask). */
  requestOrderESignOtp(eoiId: number, orderId: number): Observable<ESignChallengeDto> {
    return this.http.call<ESignChallengeDto>(API_ENDPOINTS.EOI_RESPONSES.ORDER_ESIGN_CHALLENGE, { id: `${eoiId}/${orderId}`, body: {}, flags: QUIET });
  }

  /** Verifies the OTP and e-signs every page of that one order (it becomes Signed). */
  eSignOrder(eoiId: number, orderId: number, challengeId: number, otp: string): Observable<OrderDto> {
    return this.http.call<OrderDto>(API_ENDPOINTS.EOI_RESPONSES.ORDER_ESIGN, { id: `${eoiId}/${orderId}`, body: { challengeId, otp }, flags: QUIET });
  }

  /** Sends the publishing OTP to my mobile. */
  requestPublishOtp(eoiId: number, round = 1): Observable<ESignChallengeDto> {
    return this.http.call<ESignChallengeDto>(API_ENDPOINTS.EOI_RESPONSES.RESULTS_CHALLENGE, { id: eoiId, body: { round }, flags: QUIET });
  }

  /** Verifies the publishing OTP and releases the e-signed orders to the applicants. */
  publish(eoiId: number, challengeId: number, otp: string): Observable<PublishResultDto> {
    return this.http.call<PublishResultDto>(API_ENDPOINTS.EOI_RESPONSES.RESULTS_PUBLISH, { id: eoiId, body: { challengeId, otp }, flags: QUIET });
  }
}
