import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import type {
  ApplicantResponse,
  IpaDocumentData,
  SanctionOrderDocumentData,
  Scheme,
  ScrutinyDecisionInput
} from './eoi-state.models';
import {
  buildDefaultIpaData,
  buildDefaultSanctionOrderData,
  buildInitialResponses,
  buildInitialSchemes
} from './eoi-state.seed';
import { EoiStorage } from './eoi-state.storage';
import {
  applyScrutinyDecision,
  filterResponsesByScheme,
  findDecisionTargetIndex,
  findSchemeById,
  matchesApplicationId,
  mergeStoredResponses,
  withCompany1UnderScrutiny,
  withCompany2SeedDecision
} from './eoi-state.util';

// The data shapes live in eoi-state.models.ts; re-exported so existing imports keep working.
export * from './eoi-state.models';

/**
 * Public facade for EOI schemes, applicant responses and the sanction / IPA documents.
 * Seed data lives in eoi-state.seed.ts, pure rules in eoi-state.util.ts and storage keys in
 * eoi-state.storage.ts.
 */
@Injectable({
  providedIn: 'root'
})
export class EoiStateService {
  private readonly storage = inject(EoiStorage);

  private initialSchemes: Scheme[] = buildInitialSchemes();
  private initialResponses: ApplicantResponse[] = buildInitialResponses();

  private schemesSubject = new BehaviorSubject<Scheme[]>(environment.useMockData ? this.initialSchemes : []);
  public schemes$ = this.schemesSubject.asObservable();

  private responsesSubject = new BehaviorSubject<ApplicantResponse[]>(environment.useMockData ? this.initialResponses : []);
  public responses$ = this.responsesSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!environment.useMockData) {
      this.schemesSubject.next([]);
      this.responsesSubject.next([]);
      return;
    }
    try {
      const parsed = this.storage.loadResponses();
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = withCompany1UnderScrutiny(
          withCompany2SeedDecision(mergeStoredResponses(this.initialResponses, parsed), this.initialResponses)
        );
        this.responsesSubject.next(merged);
        return;
      }
    } catch (e) {
      console.error('Error loading stored responses', e);
    }
    // Default fallback: only Company 1 is left UNDER_SCRUTINY
    const defaultList = withCompany1UnderScrutiny(this.initialResponses);
    this.responsesSubject.next(defaultList);
    this.saveToStorage(defaultList);
  }

  private saveToStorage(responses: ApplicantResponse[]): void {
    this.storage.saveResponses(responses);
  }

  getSchemes(): Observable<Scheme[]> {
    return this.schemes$;
  }

  getSchemeById(schemeId: string): Observable<Scheme | undefined> {
    return this.schemes$.pipe(
      map(schemes => findSchemeById(schemes, schemeId))
    );
  }

  getResponses(schemeId?: string): Observable<ApplicantResponse[]> {
    return this.responses$.pipe(
      map(responses => filterResponsesByScheme(responses, schemeId))
    );
  }

  getResponseById(applicationId: string): Observable<ApplicantResponse | undefined> {
    return this.responses$.pipe(
      map(responses => responses.find(r => matchesApplicationId(r, applicationId)))
    );
  }

  /**
   * Business Logic for Scrutiny Decision:
   * - If status is REJECTED -> automatically update emdStatus = 'REFUNDED'
   * - If status is APPROVED -> set emdStatus = 'PAID'
   * - Update state immutably and notify all subscribers
   */
  updateScrutinyDecision(applicationId: string, decision: ScrutinyDecisionInput): boolean {
    const currentList = this.responsesSubject.getValue();
    const targetIndex = findDecisionTargetIndex(currentList, applicationId);

    if (targetIndex === -1) {
      return false;
    }

    const updatedList = [...currentList];
    updatedList[targetIndex] = applyScrutinyDecision(currentList[targetIndex], decision);

    this.responsesSubject.next(updatedList);
    this.saveToStorage(updatedList);
    return true;
  }

  markSanctionSubmitted(schemeId: string): void {
    this.storage.markSanctionSubmitted(schemeId);
  }

  isSanctionSubmitted(schemeId: string): boolean {
    const currentResponses = this.responsesSubject.getValue();
    const hasPending = currentResponses.some(r => r.status === 'UNDER_SCRUTINY');
    if (hasPending) return false;

    return this.storage.isSanctionSubmitted(schemeId);
  }

  // ==========================================================================
  // SANCTION ORDER DOCUMENT STATE (PERSISTENT & SHARED ACROSS ADMIN & USER)
  // ==========================================================================
  getDefaultSanctionOrderData(schemeId: string = 'MMKVY-01'): SanctionOrderDocumentData {
    return buildDefaultSanctionOrderData(schemeId);
  }

  getSanctionOrderData(schemeId?: string): SanctionOrderDocumentData {
    const sId = schemeId || 'MMKVY-01';
    return this.storage.loadSanctionOrder(sId) ?? this.getDefaultSanctionOrderData(sId);
  }

  /** The sanction order saved for exactly this scheme (draft or released), or null. */
  getSchemeSanctionOrder(schemeId: string): SanctionOrderDocumentData | null {
    return this.storage.loadSchemeSanctionOrder(schemeId);
  }

  /** True once this scheme's sanction order has been e-signed and released. */
  isSchemeSanctionReleased(schemeId: string): boolean {
    return this.storage.isSchemeSanctionReleased(schemeId);
  }

  /** Keeps the sanction order as a draft: it is not released until it is e-signed. */
  saveSanctionOrderDraft(schemeId: string, data: SanctionOrderDocumentData): void {
    this.storage.saveSanctionOrder(schemeId, data);
  }

  saveSanctionOrderData(schemeId: string, data: SanctionOrderDocumentData): void {
    this.storage.saveSanctionOrder(schemeId, data);
    this.markSanctionSubmitted(schemeId);
  }

  // ==========================================================================
  // IN-PRINCIPLE APPROVAL (IPA) DOCUMENT STATE (PERSISTENT & SHARED)
  // ==========================================================================
  getDefaultIpaData(schemeId: string = 'MMKVY-01', appId: string = 'APP-004661'): IpaDocumentData {
    return buildDefaultIpaData(schemeId, appId);
  }

  getIpaData(schemeId?: string, appId?: string): IpaDocumentData {
    const sId = schemeId || 'MMKVY-01';
    const aId = appId || 'APP-004661';
    return this.storage.loadIpa(sId, aId) ?? this.getDefaultIpaData(sId, aId);
  }

  saveIpaData(schemeId: string, appId: string, data: IpaDocumentData): void {
    this.storage.saveIpa(schemeId, appId, data);
  }

  /** The IPA saved for exactly this application (draft or released), or null. */
  getAppIpa(schemeId: string, appId: string): IpaDocumentData | null {
    return this.storage.loadAppIpa(schemeId, appId);
  }

  /** True once this application's IPA has been e-signed and released. */
  isIpaReleased(schemeId: string, appId: string): boolean {
    return this.storage.isIpaReleased(schemeId, appId);
  }

  /** Saves the IPA and marks it released (it has been e-signed). */
  saveIpaReleased(schemeId: string, appId: string, data: IpaDocumentData): void {
    this.storage.saveIpa(schemeId, appId, data);
    this.storage.appendIssuedIpa(schemeId, appId, data);
    this.storage.markIpaReleased(schemeId, appId);
  }

  /** How many IPAs have been e-signed for this application. */
  getIssuedIpaCount(schemeId: string, appId: string): number {
    const issued = this.storage.loadIssuedIpas(schemeId, appId).length;
    // An IPA released before copies were kept still counts as one.
    return issued > 0 ? issued : this.storage.isIpaReleased(schemeId, appId) ? 1 : 0;
  }

  /** The IPA that was e-signed last for this application, or null when none has been. */
  getLatestIssuedIpa(schemeId: string, appId: string): IpaDocumentData | null {
    const issued = this.getIssuedIpas(schemeId, appId);
    return issued.length > 0 ? issued[issued.length - 1] : null;
  }

  /** Every IPA that was e-signed for this application, oldest first. */
  getIssuedIpas(schemeId: string, appId: string): IpaDocumentData[] {
    const issued = this.storage.loadIssuedIpas(schemeId, appId);
    if (issued.length > 0) return issued;
    // An IPA released before copies were kept is read from the saved document.
    const legacy = this.storage.isIpaReleased(schemeId, appId) ? this.storage.loadAppIpa(schemeId, appId) : null;
    return legacy ? [legacy] : [];
  }
}
