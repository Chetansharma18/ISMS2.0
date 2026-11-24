import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap, throwError } from 'rxjs';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { HttpService } from '../../../core/http/http.service';
import { unwrapData } from '../../../core/http/response-adapter';
import { isMockEnabled } from '../../../core/mock/mock.config';
import {
  MOCK_AVAILABLE_ADMINS,
  MOCK_RFP_DOCUMENTS,
  MOCK_ANNEXURE_DOCUMENTS,
  MOCK_EOI_REQUIRED_INFO
} from '../../../core/mock/data/schemes.mock';
import type { SchemeTenderItem } from '../tenders.models';
import {
  parseEoiDuration,
  sanitizeInput,
  toInputDate,
  validateDocuments,
  validateEoiDuration,
  validateEoiRefNo,
  validateFee,
  validatePublishedDate,
  validateSubmissionDate
} from '../tenders-page/tenders-page.util';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
  private dataEngine = inject(DataEngineService);
  private http = inject(HttpService);
  private repo: ResourceRepository<SchemeTenderItem>;

  // Reactive state signals
  readonly schemes = signal<SchemeTenderItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.repo = this.dataEngine.for<SchemeTenderItem>('SCHEMES', { idKey: 'refNo' });
  }

  /**
   * Fetches the complete list of active and closed schemes
   */
  loadSchemes(): Observable<SchemeTenderItem[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.repo.getAll().pipe(
      tap({
        next: list => {
          this.schemes.set(list);
          this.loading.set(false);
        },
        error: err => {
          this.error.set(err?.message || 'Failed to load schemes');
          this.loading.set(false);
        }
      })
    );
  }

  /**
   * Creates / Configures a new Scheme with backend-grade validation and audit tracking
   */
  createScheme(data: Partial<SchemeTenderItem>): Observable<SchemeTenderItem> {
    const existingRefNos = this.schemes().map(s => s.refNo);
    const refError = validateEoiRefNo(data.refNo, existingRefNos);
    if (refError) {
      return throwError(() => new Error(refError));
    }

    if (!data.schemeName?.trim()) {
      return throwError(() => new Error('Please select a valid scheme.'));
    }

    const isDraft = data.status === 'Draft';
    if (!isDraft) {
      const pubIso = toInputDate(data.datePublished);
      const isScheduled = data.status === 'Scheduled';
      const pubError = validatePublishedDate(pubIso, isScheduled);
      if (pubError) {
        return throwError(() => new Error(pubError));
      }

      const subIso = toInputDate(data.closingDate);
      const subError = validateSubmissionDate(subIso, pubIso);
      if (subError) {
        return throwError(() => new Error(subError));
      }

      const durVal = parseEoiDuration(data.eoiDuration).value;
      const durError = validateEoiDuration(durVal);
      if (durError) {
        return throwError(() => new Error(durError));
      }

      const emdError = validateFee(data.emdFee, 'EMD Fee', undefined, data.isFeeExempted);
      if (emdError) {
        return throwError(() => new Error(emdError));
      }

      const procError = validateFee(data.processFee, 'Process Fee', undefined, data.isFeeExempted);
      if (procError) {
        return throwError(() => new Error(procError));
      }

      const docCheck = validateDocuments(data.requiredDocs || []);
      if (!docCheck.isValid) {
        const firstDocErr = Object.values(docCheck.errors)[0];
        return throwError(() => new Error(String(firstDocErr)));
      }
    }

    const now = Date.now();
    const enriched: Partial<SchemeTenderItem> = {
      ...data,
      refNo: data.refNo?.trim(),
      eoiDescription: sanitizeInput(data.eoiDescription),
      createdAt: data.createdAt || now,
      updatedAt: now,
      publishedAt: data.status === 'Open' ? (data.publishedAt || now) : undefined,
      status: data.status || 'Open',
      isActive: data.isActive !== undefined ? data.isActive : true
    };

    return this.repo.create(enriched).pipe(
      tap(created => {
        this.schemes.update(current => [created, ...current].map((s, i) => ({ ...s, sNo: i + 1 })));
      })
    );
  }

  /**
   * Updates an existing scheme with uniqueness and integrity validation
   */
  updateScheme(refNo: string, patch: Partial<SchemeTenderItem>): Observable<SchemeTenderItem> {
    if (patch.refNo && patch.refNo.trim().toLowerCase() !== refNo.trim().toLowerCase()) {
      const existingRefNos = this.schemes().map(s => s.refNo);
      const refError = validateEoiRefNo(patch.refNo, existingRefNos, refNo);
      if (refError) {
        return throwError(() => new Error(refError));
      }
    }

    const now = Date.now();
    const enrichedPatch: Partial<SchemeTenderItem> = {
      ...patch,
      ...(patch.refNo ? { refNo: patch.refNo.trim() } : {}),
      ...(patch.eoiDescription !== undefined ? { eoiDescription: sanitizeInput(patch.eoiDescription) } : {}),
      updatedAt: now
    };

    return this.repo.update(refNo, enrichedPatch).pipe(
      tap(updated => {
        this.schemes.update(current =>
          current.map(s => (s.refNo === refNo ? { ...s, ...updated } : s))
        );
      })
    );
  }

  /**
   * Deletes a scheme configuration
   */
  deleteScheme(refNo: string): Observable<boolean> {
    return this.repo.delete(refNo).pipe(
      tap(success => {
        if (success) {
          this.schemes.update(current =>
            current.filter(s => s.refNo !== refNo).map((s, i) => ({ ...s, sNo: i + 1 }))
          );
        }
      })
    );
  }

  /**
   * Assigns committee members to a scheme
   */
  assignCommittee(refNo: string, members: string[], approver?: string): Observable<SchemeTenderItem> {
    const patch: Partial<SchemeTenderItem> = {
      committeeMembers: members,
      ...(approver !== undefined ? { committeeApprover: approver } : {})
    };
    if (isMockEnabled('SCHEMES')) {
      return this.updateScheme(refNo, patch);
    }
    return this.http.call<unknown>(API_ENDPOINTS.SCHEMES.ASSIGN_COMMITTEE, { id: refNo, body: patch }).pipe(
      map(res => ({ ...patch, ...(unwrapData(res) as Partial<SchemeTenderItem> | null) }) as SchemeTenderItem),
      tap(updated => {
        this.schemes.update(current => current.map(s => (s.refNo === refNo ? { ...s, ...updated } : s)));
      })
    );
  }

  /**
   * Static reference data accessors
   */
  getAvailableAdmins() {
    return MOCK_AVAILABLE_ADMINS;
  }

  getRfpDocuments() {
    return MOCK_RFP_DOCUMENTS;
  }

  getAnnexures() {
    return MOCK_ANNEXURE_DOCUMENTS;
  }

  getRequiredInfo() {
    return MOCK_EOI_REQUIRED_INFO;
  }
}
