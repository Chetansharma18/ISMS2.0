import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { StorageService } from './storage.service';

/** Number of steps in the Apply-for-EOI wizard. */
export const EOI_WIZARD_STEP_COUNT = 6;

/** Progress of an EOI application the applicant has started but not yet submitted. */
export interface EoiDraft {
  refNo: string;
  schemeName: string;
  /** Query params used to reopen the wizard for this scheme. */
  queryParams: Record<string, string>;
  /** Step the applicant was on (2 to 5). */
  step: number;
  procFeePaid: boolean;
  procFeeDate: string;
  /** Per-document upload progress (Step 3). */
  documents: { id: number; fileName: string; fileSize: string; uploadedDate: string }[];
  updatedAt: string;
}

const STORAGE_KEY = 'isms_eoi_drafts';

/**
 * Remembers EOI applications that were started (processing fee paid) but not submitted,
 * so the Active Schemes page can show them as pending and let the applicant resume.
 * Drafts are stored per signed-in user in the browser.
 */
@Injectable({ providedIn: 'root' })
export class EoiDraftService {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);

  private readonly version = signal(0);

  /** All pending drafts of the signed-in user, newest first. */
  readonly drafts = computed<EoiDraft[]>(() => {
    this.version();
    const owner = this.ownerKey();
    return Object.values(this.readAll()[owner] ?? {}).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  });

  get(refNo: string): EoiDraft | null {
    return this.readAll()[this.ownerKey()]?.[refNo] ?? null;
  }

  save(draft: EoiDraft): void {
    const all = this.readAll();
    const owner = this.ownerKey();
    all[owner] = { ...(all[owner] ?? {}), [draft.refNo]: draft };
    this.write(all);
  }

  clear(refNo: string): void {
    const all = this.readAll();
    const owner = this.ownerKey();
    if (!all[owner]?.[refNo]) return;
    delete all[owner][refNo];
    this.write(all);
  }

  private ownerKey(): string {
    return this.auth.currentUser()?.id ?? 'guest';
  }

  private readAll(): Record<string, Record<string, EoiDraft>> {
    return this.storage.getItem<Record<string, Record<string, EoiDraft>>>(STORAGE_KEY) ?? {};
  }

  private write(all: Record<string, Record<string, EoiDraft>>): void {
    this.storage.setItem(STORAGE_KEY, all);
    this.version.update(v => v + 1);
  }
}
