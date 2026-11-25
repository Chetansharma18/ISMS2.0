import { Injectable, inject, signal } from '@angular/core';
import { EMPTY, Observable, concatMap, defaultIfEmpty, from, last, map, of, switchMap, tap } from 'rxjs';
import { API_ENDPOINTS, EndpointDef } from '../../../core/config/api.config';
import { HttpService } from '../../../core/http/http.service';
import { toPaginated } from '../../../core/http/response-adapter';
import { TableAccessService } from '../../../core/permissions/table-access.service';
import type { CommitteeAdmin, EoiAttachment, EoiFormData, SchemeTenderItem } from '../tenders.models';
import {
  EoiCommittee,
  EoiDetail,
  EoiFormOptions,
  EoiListItem,
  EoiOpenNotice,
  EoiOpenNoticeDetail,
  EoiUser
} from './eoi-config.model';
import {
  attachmentChanges,
  detailToScheme,
  formToRequest,
  listItemToScheme,
  noticeToScheme,
  toCommitteeAdmin
} from './eoi-config.util';

/** Backend table that guards /api/eoi/configurations. */
const CONFIG_TABLE = 'EoiNotices';
const PAGE_SIZE = 100;
const QUIET = { skipErrorToast: true };

/**
 * EOIs on the "Active Schemes" pages, from the backend:
 * - administrators (EoiNotices permission): `/api/eoi/configurations` (list, configure, edit, status, committee);
 * - applicants: `/api/eoi/apply/notices` (open EOIs, read only).
 * Errors reach the caller as `ApiError`; the backend checks every save.
 */
@Injectable({ providedIn: 'root' })
export class SchemeService {
  private readonly http = inject(HttpService);
  private readonly tableAccess = inject(TableAccessService);

  readonly schemes = signal<SchemeTenderItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  /** Dropdowns of the Configure EOI form (schemes, EOI categories, documents, annexures, limits). */
  readonly options = signal<EoiFormOptions | null>(null);
  /** Full details of EOIs opened for viewing or editing, by EOI id. */
  private readonly details = new Map<number, EoiDetail>();
  /** Open EOIs opened for viewing by an applicant, by EOI id. */
  private readonly noticeDetails = new Map<number, EoiOpenNoticeDetail>();

  /** True when the user manages EOIs (the configuration API), false for applicants. */
  isAdmin(): boolean {
    return this.tableAccess.can(CONFIG_TABLE, 'GET');
  }

  loadSchemes(): Observable<SchemeTenderItem[]> {
    this.loading.set(true);
    this.error.set(null);
    const source$ = this.isAdmin()
      ? this.allPages<EoiListItem>(API_ENDPOINTS.EOI_CONFIG.LIST).pipe(map(rows => rows.map(listItemToScheme)))
      : this.allPages<EoiOpenNotice>(API_ENDPOINTS.EOI_APPLY.NOTICES).pipe(map(rows => rows.map(noticeToScheme)));
    return source$.pipe(
      map(list => list.map((s, i) => ({ ...s, sNo: i + 1 }))),
      tap({
        next: list => {
          this.schemes.set(list);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.error.set((err as { message?: string })?.message || 'Failed to load schemes');
          this.loading.set(false);
        }
      })
    );
  }

  loadOptions(): Observable<EoiFormOptions> {
    return this.http
      .call<EoiFormOptions>(API_ENDPOINTS.EOI_CONFIG.OPTIONS)
      .pipe(tap(options => this.options.set(options)));
  }

  /** The full EOI (documents, attachments, committee, custom fields). */
  getDetail(id: number): Observable<EoiDetail> {
    return this.http.call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.GET, { id }).pipe(tap(d => this.remember(d)));
  }

  cachedDetail(id: number): EoiDetail | null {
    return this.details.get(id) ?? null;
  }

  /** An open EOI as applicants see it (required documents, annexures, published files). */
  getNoticeDetail(id: number): Observable<EoiOpenNoticeDetail> {
    return this.http
      .call<EoiOpenNoticeDetail>(API_ENDPOINTS.EOI_APPLY.NOTICE, { id })
      .pipe(tap(d => this.noticeDetails.set(id, d)));
  }

  /**
   * Opens one of the EOI's published files, matched by title or file name, through the API the user may call
   * (configuration API for administrators, apply API for applicants). Emits nothing when the file is unknown.
   */
  openAttachment(eoiId: number, title: string): Observable<Blob> {
    const admin = this.isAdmin();
    const files = admin ? this.details.get(eoiId)?.attachments : this.noticeDetails.get(eoiId)?.attachments;
    const file = files?.find(a => a.title === title || a.fileName === title);
    if (!file) return EMPTY;
    const endpoint = admin ? API_ENDPOINTS.EOI_CONFIG.ATTACHMENT : API_ENDPOINTS.EOI_APPLY.ATTACHMENT;
    return this.http.blob(endpoint, { id: `${eoiId}/${file.id}` });
  }

  /**
   * Creates the EOI (or a draft), then uploads the files attached on the form.
   * Returns the saved EOI as the backend has it after the uploads.
   */
  createEoi(form: EoiFormData, saveAsDraft: boolean): Observable<EoiDetail> {
    const body = formToRequest(form, this.options(), saveAsDraft);
    return this.http.call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.ADD, { body, flags: QUIET }).pipe(
      switchMap(created => this.syncAttachments(created, form, null)),
      tap(saved => this.upsert(saved))
    );
  }

  /** Updates the EOI, then removes and uploads attachments to match the form. */
  updateEoi(id: number, form: EoiFormData, saveAsDraft: boolean): Observable<EoiDetail> {
    const existing = this.details.get(id) ?? null;
    const body = formToRequest(form, this.options(), saveAsDraft, existing);
    const headers = existing?.concurrencyStamp ? { 'If-Match': existing.concurrencyStamp } : undefined;
    return this.http.call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.UPDATE, { id, body, headers, flags: QUIET }).pipe(
      switchMap(updated => this.syncAttachments(updated, form, existing)),
      tap(saved => this.upsert(saved))
    );
  }

  /** Issues a corrigendum (allowed until the EOI closes). */
  addCorrigendum(id: number, title: string, file: File): Observable<EoiDetail> {
    return this.uploadAttachment(id, 'Corrigendum', title, file).pipe(tap(saved => this.upsert(saved)));
  }

  setActive(id: number, isActive: boolean): Observable<EoiDetail> {
    return this.http
      .call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.SET_STATUS, { id, body: { isActive }, flags: QUIET })
      .pipe(tap(saved => this.upsert(saved)));
  }

  getCommittee(id: number): Observable<EoiCommittee> {
    return this.http.call<EoiCommittee>(API_ENDPOINTS.EOI_CONFIG.COMMITTEE, { id });
  }

  /** People who can sit on a committee. */
  committeeCandidates(search = ''): Observable<CommitteeAdmin[]> {
    return this.http
      .call<EoiUser[]>(API_ENDPOINTS.EOI_CONFIG.COMMITTEE_CANDIDATES, { params: { search, limit: 100 } })
      .pipe(map(list => (list ?? []).map(toCommitteeAdmin)));
  }

  saveCommittee(id: number, approverSsoId: string, memberSsoIds: string[]): Observable<EoiCommittee> {
    return this.http
      .call<EoiCommittee>(API_ENDPOINTS.EOI_CONFIG.SAVE_COMMITTEE, { id, body: { approverSsoId, memberSsoIds }, flags: QUIET })
      .pipe(
        tap(c => {
          const count = (c.approver ? 1 : 0) + (c.members?.length ?? 0);
          this.schemes.update(list => list.map(s => (s.id === String(id) ? { ...s, committeeCount: count } : s)));
        })
      );
  }

  // ---------------------------------------------------------------- internals

  /** Every page of a paged list (the backend returns at most 100 rows a page). */
  private allPages<T>(endpoint: EndpointDef, page = 1, acc: T[] = []): Observable<T[]> {
    return this.http.call<unknown>(endpoint, { params: { page, pageSize: PAGE_SIZE } }).pipe(
      switchMap(res => {
        const result = toPaginated<T>(res);
        const rows = [...acc, ...result.items];
        return result.items.length === PAGE_SIZE && rows.length < result.total ? this.allPages(endpoint, page + 1, rows) : of(rows);
      })
    );
  }

  private syncAttachments(saved: EoiDetail, form: EoiFormData, existing: EoiDetail | null): Observable<EoiDetail> {
    const { removed, added } = attachmentChanges(form, existing);
    const steps: Observable<EoiDetail>[] = [
      ...removed.map(attId => this.http.call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.DELETE_ATTACHMENT, { id: `${saved.id}/${attId}`, flags: QUIET })),
      ...added.map((a: EoiAttachment) => this.uploadAttachment(saved.id, 'Document', a.title, a.file))
    ];
    if (steps.length === 0) return of(saved);
    return from(steps).pipe(concatMap(step => step), last(), defaultIfEmpty(saved));
  }

  private uploadAttachment(id: number, kind: 'Document' | 'Corrigendum', title: string, file: File): Observable<EoiDetail> {
    const body = new FormData();
    body.append('title', title);
    body.append('kind', kind);
    body.append('file', file, file.name);
    return this.http.call<EoiDetail>(API_ENDPOINTS.EOI_CONFIG.ADD_ATTACHMENT, { id, body, flags: QUIET });
  }

  private remember(detail: EoiDetail): void {
    this.details.set(detail.id, detail);
  }

  private upsert(detail: EoiDetail): void {
    this.remember(detail);
    const row = detailToScheme(detail);
    this.schemes.update(list => {
      const exists = list.some(s => s.id === row.id);
      const next = exists ? list.map(s => (s.id === row.id ? { ...s, ...row } : s)) : [row, ...list];
      return next.map((s, i) => ({ ...s, sNo: i + 1 }));
    });
  }
}
