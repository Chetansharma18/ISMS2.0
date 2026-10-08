import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DataEngineService, ResourceRepository } from '../../../core/services/data-engine.service';
import {
  SchemeTenderItem,
  MOCK_AVAILABLE_ADMINS,
  MOCK_RFP_DOCUMENTS,
  MOCK_ANNEXURE_DOCUMENTS,
  MOCK_EOI_REQUIRED_INFO
} from '../../../core/mock/data';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
  private dataEngine = inject(DataEngineService);
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
   * Creates / Configures a new Scheme
   */
  createScheme(data: Partial<SchemeTenderItem>): Observable<SchemeTenderItem> {
    return this.repo.create(data).pipe(
      tap(created => {
        this.schemes.update(current => [created, ...current].map((s, i) => ({ ...s, sNo: i + 1 })));
      })
    );
  }

  /**
   * Updates an existing scheme
   */
  updateScheme(refNo: string, patch: Partial<SchemeTenderItem>): Observable<SchemeTenderItem> {
    return this.repo.update(refNo, patch).pipe(
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
  assignCommittee(refNo: string, members: string[]): Observable<SchemeTenderItem> {
    return this.updateScheme(refNo, { committeeMembers: members });
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
