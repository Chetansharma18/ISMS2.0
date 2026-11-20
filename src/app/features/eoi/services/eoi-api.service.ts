import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import { PaginatedResponse, QueryOptions } from '../../../core/models/common.model';
import { EoiSubmissionItem } from './eoi-submission.model';

@Injectable({
  providedIn: 'root'
})
export class EoiApiService {
  private dataEngine = inject(DataEngineService);
  private repo: ResourceRepository<EoiSubmissionItem>;

  constructor() {
    this.repo = this.dataEngine.for<EoiSubmissionItem>('EOI', { idKey: 'id' });
  }

  /**
   * Fetches EOI applicant submissions list with optional filtering and pagination
   */
  getSubmissions(queryOpts?: QueryOptions): Observable<PaginatedResponse<EoiSubmissionItem>> {
    return this.repo.list(queryOpts);
  }

  /**
   * Gets single submission by ID
   */
  getSubmissionById(id: string | number): Observable<EoiSubmissionItem> {
    return this.repo.getById(id);
  }

  /**
   * Submits a new EOI proposal
   */
  submitProposal(proposal: Partial<EoiSubmissionItem>): Observable<EoiSubmissionItem> {
    return this.repo.create(proposal);
  }

  /**
   * Updates scrutiny status for an applicant submission
   */
  updateScrutinyStatus(
    id: string | number,
    status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED' | 'REVERTED',
    statusDisplay: string
  ): Observable<EoiSubmissionItem> {
    return this.repo.update(id, { status, statusDisplay });
  }
}
