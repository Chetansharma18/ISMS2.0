import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { ShortfallRequest, ShortfallResponse, SubmittedTender } from '../../../core/models/tender.model';
import { DataEngineService } from '../../../core/services/data-engine.service';
import { ApplicationActivityLog, ApplicantResponse, ApplicantAppeal } from './eoi-state.models';
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
  private readonly dataEngine = inject(DataEngineService);
  private readonly tenderRepo = this.dataEngine.for<SubmittedTender>('SUBMITTED_TENDERS');
  private readonly eoiState = inject(EoiStateService);

  /**
   * Resets both submitted tenders and department scrutiny records back to clean initial state.
   * Clears cached browser storage and dispatches sync events.
   */
  resetAppealDemo(): void {
    this.dataEngine.reset('SUBMITTED_TENDERS');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('isms_mock_db_SUBMITTED_TENDERS');
      localStorage.removeItem('isms_mock_db_SUBMITTED_TENDERS__seed');
      localStorage.removeItem('isms_dept_admin_responses');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('isms_mock_db_SUBMITTED_TENDERS');
      sessionStorage.removeItem('isms_mock_db_SUBMITTED_TENDERS__seed');
    }
    this.eoiState.resetResponses();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: 'isms_mock_db_SUBMITTED_TENDERS' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'isms_dept_admin_responses' }));
    }
  }

  private findMatchingTender(list: SubmittedTender[], applicationId: string, response?: any): SubmittedTender | undefined {
    const refs = new Set([applicationId, response?.id, response?.eoiRefNo].filter((v): v is string => !!v));
    return list.find(t =>
      refs.has(t.appRef) ||
      refs.has(t.id) ||
      (response?.anonymousLabel && t.orgDetails?.shortName === response.anonymousLabel) ||
      (response?.actualLegalName && t.orgDetails?.fullName === response.actualLegalName) ||
      ((applicationId === 'APP-004661' || applicationId === 'APP-2024-001') && t.appRef === 'APP-2024-001') ||
      ((applicationId === 'APP-004662' || applicationId === 'APP-2024-002') && t.appRef === 'APP-2024-002') ||
      ((applicationId === 'APP-004663' || applicationId === 'APP-2024-003') && t.appRef === 'APP-2024-003') ||
      ((applicationId === 'APP-004664' || applicationId === 'APP-2024-004') && t.appRef === 'APP-2024-004')
    );
  }

  /** Adds a notice to the submitted application the department just reverted / accepted appeal for. */
  raiseNotice(applicationId: string, notice: RaisedShortfall): Observable<boolean> {
    return this.eoiState.getResponseById(applicationId).pipe(
      take(1),
      switchMap(response => {
        return this.tenderRepo.getAll().pipe(
          take(1),
          switchMap(list => {
            const tender = this.findMatchingTender(list, applicationId, response);
            if (!tender) return of(false);
            const existing = tender.shortfalls ?? [];
            const raised: ShortfallRequest = {
              ...notice,
              id: `SF-${tender.appRef}-${String(existing.length + 1).padStart(2, '0')}`,
              status: 'Open'
            };
            const updatedAppeal = tender.appeal ? { ...tender.appeal, status: 'Accepted' as const } : undefined;
            return this.tenderRepo.update(tender.id, {
              shortfalls: [...existing, raised],
              appeal: updatedAppeal
            }).pipe(map(() => true));
          })
        );
      })
    );
  }

  /** Synchronizes an appeal submitted by the applicant with the department review desk. */
  notifyAppealSubmitted(tender: SubmittedTender, appeal: any): Observable<boolean> {
    return this.eoiState.getResponseById(tender.appRef).pipe(
      take(1),
      map(application => {
        const targetId = application ? application.id : tender.appRef;

        const history: ApplicationActivityLog[] = application?.activityLog?.length
          ? application.activityLog
          : [];

        const appealActivity: ApplicationActivityLog = {
          id: `ACT-${Date.now()}`,
          timestamp: appeal.submittedOn,
          action: 'REVERTED',
          title: 'Appeal Request Submitted',
          actor: application?.authorizedSignatory?.name || 'Applicant',
          actorRole: 'Applicant / TP',
          description: `Applicant submitted an appeal request against rejection. Remarks: "${appeal.reply}"`,
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          meta: { remarks: appeal.reply }
        };

        const originalDisqualification = application?.scrutinyDetails?.disqualificationReason
          || tender.rejectionReason
          || application?.scrutinyDetails?.remarks
          || 'Technical qualification criteria not met.';

        return this.eoiState.updateScrutinyDecision(targetId, {
          status: 'REVERTED',
          remarks: originalDisqualification,
          disqualificationReason: originalDisqualification,
          appeal: {
            submittedOn: appeal.submittedOn,
            reply: appeal.reply,
            files: appeal.files || [],
            status: 'Pending'
          },
          activityLog: [...history, appealActivity]
        });
      })
    );
  }

  /** Notifies applicant that their appeal was rejected by the department. */
  rejectAppealNotice(applicationId: string, remarks: string): Observable<boolean> {
    return this.eoiState.getResponseById(applicationId).pipe(
      take(1),
      switchMap(response => {
        return this.tenderRepo.getAll().pipe(
          take(1),
          switchMap(list => {
            const tender = this.findMatchingTender(list, applicationId, response);
            if (!tender) return of(false);
            const updatedAppeal = tender.appeal ? {
              ...tender.appeal,
              status: 'Rejected' as const,
              rejectionReason: remarks
            } : undefined;
            return this.tenderRepo.update(tender.id, { appeal: updatedAppeal }).pipe(map(() => true));
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
        const targetId = application ? application.id : tender.appRef;

        const history: ApplicationActivityLog[] = application?.activityLog?.length
          ? application.activityLog
          : [
              {
                id: `ACT-${Date.now()}-0`,
                timestamp: application?.submissionDate || '08/09/2026 14:30 PM',
                action: 'SUBMITTED',
                title: 'EOI Proposal Submitted',
                actor: application?.authorizedSignatory?.name || 'Applicant',
                actorRole: 'Applicant / TP',
                description: `Proposal submitted under ${application?.schemeName || tender.schemeTitle}.`
              }
            ];

        const uploaded = response.uploads.map(u => u.requiredDoc);
        const resubmitted: ApplicationActivityLog = {
          id: `ACT-${Date.now()}`,
          timestamp: response.respondedOn,
          action: 'RESUBMITTED',
          title: 'Applicant Responded to Appeal Response / Shortfall',
          actor: `${application?.authorizedSignatory?.name || 'Applicant'} (Authorized Signatory)`,
          actorRole: 'Applicant / TP',
          description:
            `Response to the shortfall request raised on ${notice.raisedOn} submitted with ${uploaded.length} document(s).` +
            (response.remarks ? ` Remarks: "${response.remarks}"` : ''),
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          meta: { documents: uploaded, officeOrderRef: notice.officeOrderRef, remarks: response.remarks }
        };

        const newDossierDocs = response.uploads.map((u, i) => ({
          id: `DOC-RESUB-${Date.now()}-${i}`,
          title: u.requiredDoc,
          fileSize: u.fileSize || '1.5 MB',
          category: 'Appeal / Shortfall Uploaded Document',
          verified: true
        }));

        const existingDocs = application?.uploadedDocuments || [];

        const appealBase = application?.appeal || (tender.appeal ? {
          submittedOn: tender.appeal.submittedOn,
          reply: tender.appeal.reply,
          files: tender.appeal.files || [],
          status: 'Accepted' as const
        } : {
          submittedOn: response.respondedOn,
          reply: 'Appeal request',
          files: [],
          status: 'Accepted' as const
        });

        const updatedAppeal = {
          ...appealBase,
          status: 'Accepted' as const,
          response: {
            respondedOn: response.respondedOn,
            remarks: response.remarks,
            uploads: response.uploads.map(u => ({
              requiredDoc: u.requiredDoc,
              fileName: u.fileName,
              fileSize: u.fileSize
            }))
          }
        };

        // Also persist updated appeal on the tender side
        const tenderAppeal = tender.appeal ? {
          ...tender.appeal,
          status: 'Accepted' as const,
          response: updatedAppeal.response
        } : undefined;
        if (tenderAppeal) {
          this.tenderRepo.update(tender.id, { appeal: tenderAppeal }).subscribe();
        }

        const originalDisqualification = application?.scrutinyDetails?.disqualificationReason
          || tender.rejectionReason
          || 'Technical qualification criteria not met.';

        return this.eoiState.updateScrutinyDecision(targetId, {
          status: 'UNDER_SCRUTINY',
          remarks: originalDisqualification,
          disqualificationReason: originalDisqualification,
          activityLog: [...history, resubmitted],
          uploadedDocuments: [...newDossierDocs, ...existingDocs],
          appeal: updatedAppeal
        });
      })
    );
  }

  /**
   * Ensures that if the matching tender already has appeal response documents or an appeal status,
   * it is hydrated into the department's ApplicantResponse record immediately.
   */
  syncFromTenderIfNeeded(application: ApplicantResponse): Observable<ApplicantResponse> {
    return this.tenderRepo.getAll().pipe(
      take(1),
      map(list => {
        const tender = this.findMatchingTender(list, application.id, application);
        if (!tender) return application;

        const respondedNotice = tender.shortfalls?.find(s => s.status === 'Responded' && s.response);

        // If tender has appeal but application doesn't
        let currentAppeal = application.appeal;
        if (!currentAppeal && tender.appeal) {
          currentAppeal = {
            submittedOn: tender.appeal.submittedOn,
            reply: tender.appeal.reply,
            files: tender.appeal.files || [],
            status: tender.appeal.status || 'Pending'
          };
        }

        // If tender has responded shortfall documents for appeal, hydrate them into application.appeal.response
        if (respondedNotice && respondedNotice.response && currentAppeal && (!currentAppeal.response || currentAppeal.status === 'Accepted')) {
          currentAppeal = {
            ...currentAppeal,
            status: 'Accepted',
            response: {
              respondedOn: respondedNotice.response.respondedOn,
              remarks: respondedNotice.response.remarks,
              uploads: respondedNotice.response.uploads.map(u => ({
                requiredDoc: u.requiredDoc,
                fileName: u.fileName,
                fileSize: u.fileSize
              }))
            }
          };

          const newDossierDocs = respondedNotice.response.uploads.map((u, i) => ({
            id: `DOC-RESUB-${Date.now()}-${i}`,
            title: u.requiredDoc,
            fileSize: u.fileSize || '1.5 MB',
            category: 'Appeal / Shortfall Uploaded Document',
            verified: true
          }));

          const existingDocs = application.uploadedDocuments || [];
          const mergedDocs = [...newDossierDocs.filter(nd => !existingDocs.some((ed: any) => ed.title === nd.title)), ...existingDocs];

          const syncedApp: ApplicantResponse = {
            ...application,
            status: application.status === 'REVERTED' ? 'UNDER_SCRUTINY' : application.status,
            appeal: currentAppeal,
            uploadedDocuments: mergedDocs
          };

          const originalDisqualification = application.scrutinyDetails?.disqualificationReason
            || tender.rejectionReason
            || 'Technical qualification criteria not met.';

          this.eoiState.updateScrutinyDecision(application.id, {
            status: syncedApp.status,
            remarks: originalDisqualification,
            disqualificationReason: originalDisqualification,
            appeal: currentAppeal,
            uploadedDocuments: mergedDocs
          });

          return syncedApp;
        }

        if (currentAppeal && currentAppeal !== application.appeal) {
          const originalDisqualification = application.scrutinyDetails?.disqualificationReason
            || tender.rejectionReason
            || 'Technical qualification criteria not met.';

          const syncedApp: ApplicantResponse = {
            ...application,
            appeal: currentAppeal
          };
          this.eoiState.updateScrutinyDecision(application.id, {
            status: application.status,
            remarks: originalDisqualification,
            disqualificationReason: originalDisqualification,
            appeal: currentAppeal
          });
          return syncedApp;
        }

        return application;
      })
    );
  }

  /** Syncs final decision (Approved / Rejected) from scrutiny desk back to the applicant tender. */
  syncStatusToTender(applicationId: string, status: 'APPROVED' | 'REJECTED', remarks?: string): Observable<boolean> {
    return this.eoiState.getResponseById(applicationId).pipe(
      take(1),
      switchMap(response => {
        return this.tenderRepo.getAll().pipe(
          take(1),
          switchMap(list => {
            const tender = this.findMatchingTender(list, applicationId, response);
            if (!tender) return of(false);
            const newStatus = status === 'APPROVED' ? 'Approved' : 'Rejected';
            const updatedAppeal = tender.appeal ? {
              ...tender.appeal,
              status: (status === 'APPROVED' ? 'Accepted' : 'Rejected') as 'Accepted' | 'Rejected',
              rejectionReason: status === 'REJECTED' ? (remarks || 'Appeal rejected after review.') : undefined
            } : undefined;
            return this.tenderRepo.update(tender.id, {
              submittedStatus: newStatus,
              rejectionReason: status === 'REJECTED' ? (remarks || tender.rejectionReason) : undefined,
              appeal: updatedAppeal
            }).pipe(map(() => true));
          })
        );
      })
    );
  }
}
