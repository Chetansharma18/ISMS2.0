import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { API_ENDPOINTS, EndpointDef } from '../../../core/config/api.config';
import { HttpService } from '../../../core/http/http.service';
import { SectorMasterItem } from '../../../core/models/admin-masters.model';
import { DataEngineService } from '../../../core/services/data-engine.service';
import {
  OtrFormDef,
  OtrFullFormResponse,
  OtrLookups,
  OtrRecords,
  OtrStepDef,
  OtrStepFormDto,
  OtrStepRecord,
  OtrUpdateLogDto
} from '../models/otr-api.model';
import { OTR_STEP_KEYS, buildFormDef, replaceStep, stepChanged, stepOfField, toOtrFormData } from '../otr-form.util';
import { OtrFormService } from './otr-form.service';

const READ: Record<string, EndpointDef> = {
  organisation: API_ENDPOINTS.OTR.ME,
  'authorized-person': API_ENDPOINTS.OTR.AUTHORIZED_PERSON,
  'bank-details': API_ENDPOINTS.OTR.BANK_DETAILS
};

const SAVE: Record<string, EndpointDef> = {
  organisation: API_ENDPOINTS.OTR.SAVE_ORGANISATION,
  'authorized-person': API_ENDPOINTS.OTR.SAVE_AUTHORIZED_PERSON,
  'bank-details': API_ENDPOINTS.OTR.SAVE_BANK_DETAILS
};

/** PATCH: a change to a saved step with the reason for it (recorded in the update logs). */
const UPDATE: Record<string, EndpointDef> = {
  organisation: API_ENDPOINTS.OTR.UPDATE_ORGANISATION,
  'authorized-person': API_ENDPOINTS.OTR.UPDATE_AUTHORIZED_PERSON,
  'bank-details': API_ENDPOINTS.OTR.UPDATE_BANK_DETAILS
};

const QUIET = { skipErrorToast: true };

/** An empty body (204 / null) means "not saved yet". */
const asRecord = (value: unknown): OtrStepRecord | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as OtrStepRecord) : null;

/**
 * The signed-in organisation's One Time Registration on the backend (`/api/otr`): the form definition, the master
 * lookups it needs (sectors, districts) and one saved record per step. Errors reach the caller as `ApiError`.
 */
@Injectable({ providedIn: 'root' })
export class OtrRegistrationService {
  private readonly http = inject(HttpService);
  private readonly dataEngine = inject(DataEngineService);
  private readonly legacy = inject(OtrFormService);

  private readonly _form = signal<OtrFormDef | null>(null);
  private readonly _records = signal<OtrRecords>({});
  private readonly _lookups = signal<OtrLookups>({ sectors: [], districts: [] });

  readonly form = this._form.asReadonly();
  readonly records = this._records.asReadonly();
  readonly lookups = this._lookups.asReadonly();

  /** The form definition, the lookups and every step record. */
  load(): Observable<{ form: OtrFormDef; records: OtrRecords }> {
    return forkJoin({
      response: this.http.call<OtrFullFormResponse>(API_ENDPOINTS.OTR.FORM, { flags: QUIET }),
      lookups: this.loadLookups(),
      records: this.loadRecords()
    }).pipe(
      map(({ response, lookups, records }) => {
        this._lookups.set(lookups);
        const form = buildFormDef(response, lookups);
        this._form.set(form);
        this.setRecords(records);
        return { form, records };
      })
    );
  }

  /**
   * Only the form definition (with its lookups), without the signed-in user's records. Used to show another
   * organisation's registration, e.g. on the department's Scrutiny Desk. Does not change this service's state.
   */
  loadForm(source: EndpointDef = API_ENDPOINTS.OTR.FORM): Observable<OtrFormDef> {
    return forkJoin({
      response: this.http.call<OtrFullFormResponse>(source, { flags: QUIET }),
      lookups: this.loadLookups()
    }).pipe(map(({ response, lookups }) => buildFormDef(response, lookups)));
  }

  /**
   * Re-reads one step's definition (GET /otr/form/steps/{stepKey}, not cached) and puts it in the form, so a
   * FormManager schema published meanwhile is used. Answers the new step, or null when nothing changed or the call
   * failed (the step loaded with the form stays).
   */
  refreshStep(stepKey: string): Observable<OtrStepDef | null> {
    return this.http.call<OtrStepFormDto>(API_ENDPOINTS.OTR.STEP_FORM, { id: stepKey, flags: QUIET }).pipe(
      map(dto => {
        const form = this._form();
        const current = form?.steps.find(s => s.key === stepKey);
        if (!form || !current || !dto || dto.stepKey !== stepKey) return null;
        const next = replaceStep(form, dto, this._lookups());
        const step = next.steps.find(s => s.key === stepKey)!;
        if (!stepChanged(current, step)) return null;
        this._form.set(next);
        return step;
      }),
      catchError(() => of(null))
    );
  }

  /** The registration's change history, newest first by the screen; `section` narrows it to one step. */
  updateLogs(section?: string): Observable<OtrUpdateLogDto[]> {
    return this.http
      .call<unknown>(API_ENDPOINTS.OTR.UPDATE_LOGS, { params: section ? { section } : undefined, flags: QUIET })
      .pipe(map(res => (Array.isArray(res) ? (res as OtrUpdateLogDto[]) : [])));
  }

  /** Saves one step (create or update); the answer is the saved record. With a reason, the change goes by PATCH. */
  saveStep(stepKey: string, body: Record<string, unknown>, reason?: string): Observable<OtrStepRecord> {
    const call = reason !== undefined
      ? this.http.call<unknown>(UPDATE[stepKey], { body: { ...body, reason }, flags: QUIET })
      : this.http.call<unknown>(SAVE[stepKey], { body, flags: QUIET });
    return call.pipe(
      map(asRecord),
      map(record => record ?? ({ id: null, status: 'Draft' } as OtrStepRecord)),
      tap(record => this.setRecords({ ...this._records(), [stepKey]: record }))
    );
  }

  /** Uploads a document, then re-reads the record of the step it belongs to (the answer is always step 1). */
  uploadDocument(fieldKey: string, documentType: string, file: File): Observable<OtrRecords> {
    const body = new FormData();
    body.append('file', file, file.name);
    return this.http
      .call<unknown>(API_ENDPOINTS.OTR.UPLOAD_DOCUMENT, { id: documentType, body, flags: QUIET })
      .pipe(switchMap(org => this.afterDocumentChange(fieldKey, org)));
  }

  deleteDocument(fieldKey: string, documentType: string): Observable<OtrRecords> {
    return this.http
      .call<unknown>(API_ENDPOINTS.OTR.DELETE_DOCUMENT, { id: documentType, flags: QUIET })
      .pipe(switchMap(org => this.afterDocumentChange(fieldKey, org)));
  }

  documentBlob(documentType: string): Observable<Blob> {
    return this.http.blob(API_ENDPOINTS.OTR.DOCUMENT, { id: documentType, flags: QUIET });
  }

  /** Submits the registration; the answer is the organisation record with its new status. */
  submit(declarationAccepted: boolean): Observable<OtrRecords> {
    return this.http
      .call<unknown>(API_ENDPOINTS.OTR.SUBMIT, { body: { declarationAccepted }, flags: QUIET })
      .pipe(
        switchMap(() => this.loadRecords()),
        tap(records => this.setRecords(records))
      );
  }

  private afterDocumentChange(fieldKey: string, orgAnswer: unknown): Observable<OtrRecords> {
    const next: OtrRecords = { ...this._records(), organisation: asRecord(orgAnswer) ?? this._records()['organisation'] ?? null };
    const form = this._form();
    const stepKey = form ? stepOfField(form, fieldKey)?.key : undefined;
    const reread = stepKey && stepKey !== 'organisation'
      ? this.http.call<unknown>(READ[stepKey], { flags: QUIET }).pipe(map(r => ({ ...next, [stepKey]: asRecord(r) })))
      : of(next);
    return reread.pipe(tap(records => this.setRecords(records)));
  }

  private loadRecords(): Observable<OtrRecords> {
    const calls = Object.fromEntries(
      OTR_STEP_KEYS.map(key => [key, this.http.call<unknown>(READ[key], { flags: QUIET }).pipe(map(asRecord))])
    ) as Record<string, Observable<OtrStepRecord | null>>;
    return forkJoin(calls);
  }

  /** Sectors and districts for the dropdowns. A failing master only leaves its dropdown empty. */
  private loadLookups(): Observable<OtrLookups> {
    const sectors = this.dataEngine.for<SectorMasterItem>('SECTORS').getAll().pipe(
      map(list =>
        list
          .filter(s => s.status !== 'Inactive')
          .map(s => ({ id: Number(s.id), name: s.sectorName }))
          .filter(s => Number.isFinite(s.id) && !!s.name)
      ),
      catchError(() => of([]))
    );
    const districts = this.dataEngine.for<Record<string, unknown>>('DISTRICT_MASTERS').getAll().pipe(
      map(list =>
        list
          .filter(d => d['isActive'] !== false)
          .map(d => ({ id: Number(d['id']), name: String(d['name'] ?? d['districtName'] ?? ''), state: String(d['state'] ?? '') }))
          .filter(d => Number.isFinite(d.id) && !!d.name)
      ),
      catchError(() => of([]))
    );
    return forkJoin({ sectors, districts });
  }

  private setRecords(records: OtrRecords): void {
    this._records.set(records);
    this.legacy.applyServerData(toOtrFormData(records, this._form(), this._lookups()));
  }
}
