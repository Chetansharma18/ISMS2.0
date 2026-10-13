import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ShortfallRequest, ShortfallResponse, SubmittedTender } from '../../../core/models/tender.model';
import { DataEngineService } from '../../../core/services/data-engine.service';
import { ApplicationActivityLog } from './eoi-state.models';
import { EoiStateService } from './eoi-state.service';

/** What the department fills in when it reverts an application. */
export type RaisedShortfall = Omit<ShortfallRequest, 'id' | 'status' | 'response'>;

/**
 * Connects the two sides of a shortfall:
 * - the department's revert (scrutiny desk) becomes a notice on the applicant's Tender Status page
 * - the applicant's reply sends the application back to the scrutiny desk
 */
@Injectable({ providedIn: 'root' })
export class ShortfallBridgeService {
  private readonly tenderRepo = inject(DataEngineService).for<SubmittedTender>('SUBMITTED_TENDERS');
  private readonly eoiState = inject(EoiStateService);

  /** Adds a notice to the submitted application the department just reverted. */
  raiseNotice(applicationId: string, notice: RaisedShortfall): Observable<boolean> {
    return this.eoiState.getResponseById(applicationId).pipe(
      take(1),
      switchMap(response => {
        const refs = new Set([applicationId, response?.id].filter((v): v is string => !!v));
        return this.tenderRepo.getAll().pipe(
          take(1),
          switchMap(list => {
            const tender = list.find(t => refs.has(t.appRef));
            if (!tender) return of(false);
            const existing = tender.shortfalls ?? [];
            const raised: ShortfallRequest = {
              ...notice,
              id: `SF-${tender.appRef}-${String(existing.length + 1).padStart(2, '0')}`,
              status: 'Open'
            };
            return this.tenderRepo.update(tender.id, { shortfalls: [...existing, raised] }).pipe(map(() => true));
          })
        );
      })
    );
  }

  /** Returns the application to the scrutiny desk after the applicant replied to a notice. */
  notifyDepartment(tender: SubmittedTender, notice: ShortfallRequest, response: ShortfallResponse): Observable<boolean> {
    return this.eoiState.getResponseById(tender.appRef).pipe(
      take(1),
      map(application => {
        if (!application) return false;

        const history: ApplicationActivityLog[] = application.activityLog?.length
          ? application.activityLog
          : [
              {
                id: `ACT-${Date.now()}-0`,
                timestamp: application.submissionDate,
                action: 'SUBMITTED',
                title: 'EOI Proposal Submitted',
                actor: application.authorizedSignatory?.name || 'Applicant',
                actorRole: 'Applicant / TP',
                description: `Proposal submitted under ${application.schemeName}.`
              }
            ];

        const uploaded = response.uploads.map(u => u.requiredDoc);
        const resubmitted: ApplicationActivityLog = {
          id: `ACT-${Date.now()}`,
          timestamp: response.respondedOn,
          action: 'RESUBMITTED',
          title: 'Applicant Responded to Shortfall Request',
          actor: `${application.authorizedSignatory?.name || 'Applicant'} (Authorized Signatory)`,
          actorRole: 'Applicant / TP',
          description:
            `Response to the shortfall request raised on ${notice.raisedOn} submitted with ${uploaded.length} document(s).` +
            (response.remarks ? ` Remarks: "${response.remarks}"` : ''),
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          meta: { documents: uploaded, officeOrderRef: notice.officeOrderRef, remarks: response.remarks }
        };

        return this.eoiState.updateScrutinyDecision(application.id, {
          status: 'UNDER_SCRUTINY',
          remarks: response.remarks || 'Documents re-submitted by Training Partner.',
          activityLog: [...history, resubmitted]
        });
      })
    );
  }
}
