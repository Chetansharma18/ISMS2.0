import { Injectable, inject } from '@angular/core';
import { isMockEnabled } from '../../../core/mock/mock.config';
import { createPersistedStore, PersistedStore } from '../../../core/services/persisted-store';
import { StorageService } from '../../../core/services/storage.service';
import type {
  ApplicantResponse,
  IpaDocumentData,
  SanctionOrderDocumentData
} from './eoi-state.models';

const RESPONSES_KEY = 'isms_dept_admin_responses';
const SANCTION_SUBMITTED_LATEST_KEY = 'isms_sanction_submitted_latest';
const SANCTION_DOC_LATEST_KEY = 'isms_sanction_doc_latest';
const IPA_DOC_LATEST_KEY = 'isms_ipa_doc_latest';

/** API record of resource SANCTION_DOCUMENTS: the sanction order of one scheme. */
export interface SanctionDocumentRecord {
  /** The scheme id. */
  id: string;
  data: SanctionOrderDocumentData | null;
  released: boolean;
  updatedAt: string;
}

/** API record of resource IPA_DOCUMENTS: the IPA of one application. */
export interface IpaDocumentRecord {
  /** `${schemeId}__${appId}` */
  id: string;
  schemeId: string;
  appId: string;
  data: IpaDocumentData | null;
  released: boolean;
  /** Every e-signed copy, oldest first. */
  issued: IpaDocumentData[];
  updatedAt: string;
}

const ipaRecordId = (schemeId: string, appId: string): string => `${schemeId}__${appId}`;
const byLatest = <T extends { updatedAt: string }>(a: T, b: T): number => b.updatedAt.localeCompare(a.updatedAt);

/**
 * Persistence for EoiStateService. Each kind of data follows its own resource flag in mock.config.ts:
 *
 * - mock mode: the localStorage keys the EOI feature has always used (JSON documents, `'true'` flags);
 * - API mode: resources EOI_RESPONSES, SANCTION_DOCUMENTS and IPA_DOCUMENTS, loaded once and kept in memory so the
 *   document editors can keep reading synchronously; every save is sent to the API.
 */
@Injectable({
  providedIn: 'root'
})
export class EoiStorage {
  private readonly storage = inject(StorageService);

  /** API mode only (empty and unused in mock mode). */
  readonly remoteResponses: PersistedStore<ApplicantResponse> = createPersistedStore<ApplicantResponse>({
    dataKey: 'EOI_RESPONSES',
    seed: []
  });
  private readonly sanctionDocs = createPersistedStore<SanctionDocumentRecord>({ dataKey: 'SANCTION_DOCUMENTS', seed: [] });
  private readonly ipaDocs = createPersistedStore<IpaDocumentRecord>({ dataKey: 'IPA_DOCUMENTS', seed: [] });

  readonly responsesRemote = !isMockEnabled('EOI_RESPONSES');
  private readonly sanctionRemote = !isMockEnabled('SANCTION_DOCUMENTS');
  private readonly ipaRemote = !isMockEnabled('IPA_DOCUMENTS');

  // ---- Applicant responses -------------------------------------------------------------------

  loadResponses(): ApplicantResponse[] | null {
    if (this.responsesRemote) return this.remoteResponses.items();
    return this.storage.getItem<ApplicantResponse[]>(RESPONSES_KEY);
  }

  saveResponses(responses: ApplicantResponse[]): void {
    if (this.responsesRemote) {
      this.remoteResponses.items.set(responses);
      this.remoteResponses.persist(responses);
      return;
    }
    this.storage.setItem(RESPONSES_KEY, responses);
  }

  getString(key: string): string | null {
    return this.storage.getString(key);
  }

  setString(key: string, value: string): void {
    this.storage.setString(key, value);
  }

  // ---- Sanction orders -----------------------------------------------------------------------

  markSanctionSubmitted(schemeId: string): void {
    if (this.sanctionRemote) {
      this.upsertSanction(schemeId, rec => ({ ...rec, released: true }));
      return;
    }
    this.storage.setString(`isms_sanction_submitted_${schemeId}`, 'true');
    this.storage.setString(SANCTION_SUBMITTED_LATEST_KEY, 'true');
  }

  isSanctionSubmitted(schemeId: string): boolean {
    if (this.sanctionRemote) {
      return this.sanctionDocs.items().some(rec => rec.released);
    }
    if (this.storage.getString(`isms_sanction_submitted_${schemeId}`) === 'true') return true;
    return this.storage.getString(SANCTION_SUBMITTED_LATEST_KEY) === 'true';
  }

  /** Saved sanction order for the scheme, falling back to the most recently saved one. */
  loadSanctionOrder(schemeId: string): SanctionOrderDocumentData | null {
    if (this.sanctionRemote) {
      return this.sanctionRecord(schemeId)?.data
        ?? [...this.sanctionDocs.items()].filter(rec => rec.data).sort(byLatest)[0]?.data
        ?? null;
    }
    return this.storage.getItem<SanctionOrderDocumentData>(`isms_sanction_doc_${schemeId}`)
      ?? this.storage.getItem<SanctionOrderDocumentData>(SANCTION_DOC_LATEST_KEY);
  }

  /** Sanction order saved for exactly this scheme (no fallback to another scheme's order). */
  loadSchemeSanctionOrder(schemeId: string): SanctionOrderDocumentData | null {
    if (this.sanctionRemote) return this.sanctionRecord(schemeId)?.data ?? null;
    return this.storage.getItem<SanctionOrderDocumentData>(`isms_sanction_doc_${schemeId}`);
  }

  /** True once the sanction order of exactly this scheme has been e-signed and released. */
  isSchemeSanctionReleased(schemeId: string): boolean {
    if (this.sanctionRemote) return !!this.sanctionRecord(schemeId)?.released;
    return this.storage.getString(`isms_sanction_submitted_${schemeId}`) === 'true';
  }

  saveSanctionOrder(schemeId: string, data: SanctionOrderDocumentData): void {
    if (this.sanctionRemote) {
      this.upsertSanction(schemeId, rec => ({ ...rec, data }));
      return;
    }
    this.storage.setItem(`isms_sanction_doc_${schemeId}`, data);
    this.storage.setItem(SANCTION_DOC_LATEST_KEY, data);
  }

  // ---- IPAs ----------------------------------------------------------------------------------

  /** Saved IPA for the application, then for the scheme, then the most recently saved one. */
  loadIpa(schemeId: string, appId: string): IpaDocumentData | null {
    if (this.ipaRemote) {
      const withData = [...this.ipaDocs.items()].filter(rec => rec.data).sort(byLatest);
      return this.ipaRecord(schemeId, appId)?.data
        ?? withData.find(rec => rec.schemeId === schemeId)?.data
        ?? withData[0]?.data
        ?? null;
    }
    return this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}_${appId}`)
      ?? this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}`)
      ?? this.storage.getItem<IpaDocumentData>(IPA_DOC_LATEST_KEY);
  }

  /** IPA saved for exactly this application (no fallback to another company's IPA). */
  loadAppIpa(schemeId: string, appId: string): IpaDocumentData | null {
    if (this.ipaRemote) return this.ipaRecord(schemeId, appId)?.data ?? null;
    return this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}_${appId}`);
  }

  /** True once the IPA of exactly this application has been e-signed and released. */
  isIpaReleased(schemeId: string, appId: string): boolean {
    if (this.ipaRemote) return !!this.ipaRecord(schemeId, appId)?.released;
    return this.storage.getString(`isms_ipa_released_${schemeId}_${appId}`) === 'true';
  }

  markIpaReleased(schemeId: string, appId: string): void {
    if (this.ipaRemote) {
      this.upsertIpa(schemeId, appId, rec => ({ ...rec, released: true }));
      return;
    }
    this.storage.setString(`isms_ipa_released_${schemeId}_${appId}`, 'true');
  }

  /** Every IPA that was e-signed for this application, oldest first. */
  loadIssuedIpas(schemeId: string, appId: string): IpaDocumentData[] {
    if (this.ipaRemote) return this.ipaRecord(schemeId, appId)?.issued ?? [];
    return this.storage.getItem<IpaDocumentData[]>(`isms_ipa_issued_${schemeId}_${appId}`) ?? [];
  }

  /** Keeps a copy of an e-signed IPA, so later drafts for the same application do not replace it. */
  appendIssuedIpa(schemeId: string, appId: string, data: IpaDocumentData): void {
    if (this.ipaRemote) {
      this.upsertIpa(schemeId, appId, rec => ({ ...rec, issued: [...rec.issued, data] }));
      return;
    }
    const issued = this.loadIssuedIpas(schemeId, appId);
    this.storage.setItem(`isms_ipa_issued_${schemeId}_${appId}`, [...issued, data]);
  }

  saveIpa(schemeId: string, appId: string, data: IpaDocumentData): void {
    if (this.ipaRemote) {
      this.upsertIpa(schemeId, appId, rec => ({ ...rec, data }));
      return;
    }
    this.storage.setItem(`isms_ipa_doc_${schemeId}_${appId}`, data);
    this.storage.setItem(`isms_ipa_doc_${schemeId}`, data);
    this.storage.setItem(IPA_DOC_LATEST_KEY, data);
  }

  // ---- API-mode records ----------------------------------------------------------------------

  private sanctionRecord(schemeId: string): SanctionDocumentRecord | undefined {
    return this.sanctionDocs.items().find(rec => rec.id === schemeId);
  }

  private ipaRecord(schemeId: string, appId: string): IpaDocumentRecord | undefined {
    const id = ipaRecordId(schemeId, appId);
    return this.ipaDocs.items().find(rec => rec.id === id);
  }

  private upsertSanction(schemeId: string, change: (rec: SanctionDocumentRecord) => SanctionDocumentRecord): void {
    const current = this.sanctionRecord(schemeId) ?? { id: schemeId, data: null, released: false, updatedAt: '' };
    const next = { ...change(current), updatedAt: new Date().toISOString() };
    this.sanctionDocs.items.update(list => [next, ...list.filter(rec => rec.id !== schemeId)]);
    this.sanctionDocs.persist();
  }

  private upsertIpa(schemeId: string, appId: string, change: (rec: IpaDocumentRecord) => IpaDocumentRecord): void {
    const id = ipaRecordId(schemeId, appId);
    const current = this.ipaRecord(schemeId, appId) ?? { id, schemeId, appId, data: null, released: false, issued: [], updatedAt: '' };
    const next = { ...change(current), updatedAt: new Date().toISOString() };
    this.ipaDocs.items.update(list => [next, ...list.filter(rec => rec.id !== id)]);
    this.ipaDocs.persist();
  }
}
