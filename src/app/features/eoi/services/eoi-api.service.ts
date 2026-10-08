import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import { MockEoiApplicantItem } from '../../../core/mock/data';
import { PaginatedResponse } from '../../../core/models/common.model';
import { QueryOptions } from '../../../core/mock/mock-database.service';

@Injectable({
  providedIn: 'root'
})
export class EoiApiService {
  private dataEngine = inject(DataEngineService);
  private repo: ResourceRepository<MockEoiApplicantItem>;

  constructor() {
    this.repo = this.dataEngine.for<MockEoiApplicantItem>('EOI', { idKey: 'id' });
  }

  /**
   * Fetches EOI applicant submissions list with optional filtering and pagination
   */
  getSubmissions(queryOpts?: QueryOptions): Observable<PaginatedResponse<MockEoiApplicantItem>> {
    return this.repo.list(queryOpts);
  }

  /**
   * Gets single submission by ID
   */
  getSubmissionById(id: string | number): Observable<MockEoiApplicantItem> {
    return this.repo.getById(id);
  }

  /**
   * Submits a new EOI proposal
   */
  submitProposal(proposal: Partial<MockEoiApplicantItem>): Observable<MockEoiApplicantItem> {
    return this.repo.create(proposal);
  }

  /**
   * Updates scrutiny status for an applicant submission
   */
  updateScrutinyStatus(
    id: string | number,
    status: 'UNDER_SCRUTINY' | 'APPROVED' | 'REJECTED',
    statusDisplay: string
  ): Observable<MockEoiApplicantItem> {
    return this.repo.update(id, { status, statusDisplay });
  }
}
