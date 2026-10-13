import { Injectable, inject } from '@angular/core';
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

/**
 * Persistence for EoiStateService: every localStorage key the EOI feature owns and how each is
 * encoded. Responses and documents are JSON; the "sanction submitted" flags are the raw string
 * `'true'`. All access goes through StorageService.
 */
@Injectable({
  providedIn: 'root'
})
export class EoiStorage {
  private readonly storage = inject(StorageService);

  loadResponses(): ApplicantResponse[] | null {
    return this.storage.getItem<ApplicantResponse[]>(RESPONSES_KEY);
  }

  saveResponses(responses: ApplicantResponse[]): void {
    this.storage.setItem(RESPONSES_KEY, responses);
  }

  markSanctionSubmitted(schemeId: string): void {
    this.storage.setString(`isms_sanction_submitted_${schemeId}`, 'true');
    this.storage.setString(SANCTION_SUBMITTED_LATEST_KEY, 'true');
  }

  isSanctionSubmitted(schemeId: string): boolean {
    if (this.storage.getString(`isms_sanction_submitted_${schemeId}`) === 'true') return true;
    return this.storage.getString(SANCTION_SUBMITTED_LATEST_KEY) === 'true';
  }

  /** Saved sanction order for the scheme, falling back to the most recently saved one. */
  loadSanctionOrder(schemeId: string): SanctionOrderDocumentData | null {
    return this.storage.getItem<SanctionOrderDocumentData>(`isms_sanction_doc_${schemeId}`)
      ?? this.storage.getItem<SanctionOrderDocumentData>(SANCTION_DOC_LATEST_KEY);
  }

  /** Sanction order saved for exactly this scheme (no fallback to another scheme's order). */
  loadSchemeSanctionOrder(schemeId: string): SanctionOrderDocumentData | null {
    return this.storage.getItem<SanctionOrderDocumentData>(`isms_sanction_doc_${schemeId}`);
  }

  /** True once the sanction order of exactly this scheme has been e-signed and released. */
  isSchemeSanctionReleased(schemeId: string): boolean {
    return this.storage.getString(`isms_sanction_submitted_${schemeId}`) === 'true';
  }

  saveSanctionOrder(schemeId: string, data: SanctionOrderDocumentData): void {
    this.storage.setItem(`isms_sanction_doc_${schemeId}`, data);
    this.storage.setItem(SANCTION_DOC_LATEST_KEY, data);
  }

  /** Saved IPA for the application, then for the scheme, then the most recently saved one. */
  loadIpa(schemeId: string, appId: string): IpaDocumentData | null {
    return this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}_${appId}`)
      ?? this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}`)
      ?? this.storage.getItem<IpaDocumentData>(IPA_DOC_LATEST_KEY);
  }

  /** IPA saved for exactly this application (no fallback to another company's IPA). */
  loadAppIpa(schemeId: string, appId: string): IpaDocumentData | null {
    return this.storage.getItem<IpaDocumentData>(`isms_ipa_doc_${schemeId}_${appId}`);
  }

  /** True once the IPA of exactly this application has been e-signed and released. */
  isIpaReleased(schemeId: string, appId: string): boolean {
    return this.storage.getString(`isms_ipa_released_${schemeId}_${appId}`) === 'true';
  }

  markIpaReleased(schemeId: string, appId: string): void {
    this.storage.setString(`isms_ipa_released_${schemeId}_${appId}`, 'true');
  }

  /** Every IPA that was e-signed for this application, oldest first. */
  loadIssuedIpas(schemeId: string, appId: string): IpaDocumentData[] {
    return this.storage.getItem<IpaDocumentData[]>(`isms_ipa_issued_${schemeId}_${appId}`) ?? [];
  }

  /** Keeps a copy of an e-signed IPA, so later drafts for the same application do not replace it. */
  appendIssuedIpa(schemeId: string, appId: string, data: IpaDocumentData): void {
    const issued = this.loadIssuedIpas(schemeId, appId);
    this.storage.setItem(`isms_ipa_issued_${schemeId}_${appId}`, [...issued, data]);
  }

  saveIpa(schemeId: string, appId: string, data: IpaDocumentData): void {
    this.storage.setItem(`isms_ipa_doc_${schemeId}_${appId}`, data);
    this.storage.setItem(`isms_ipa_doc_${schemeId}`, data);
    this.storage.setItem(IPA_DOC_LATEST_KEY, data);
  }
}
