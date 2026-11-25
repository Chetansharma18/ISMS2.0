import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '../../core/config/api.config';
import { HttpService } from '../../core/http/http.service';
import { toItems } from '../../core/http/response-adapter';
import { CreateFormRequest, FormManagerForm, UpdateFormRequest } from './form-manager.model';

/** The backend's Form Manager (`/api/form-manager`). Errors reach the caller as `ApiError`. */
@Injectable({ providedIn: 'root' })
export class FormManagerApiService {
  private readonly http = inject(HttpService);

  /**
   * Every form with its current schema. The list endpoint returns no schema, so each form's current version is
   * read too; a form whose schema cannot be read is still listed (without fields).
   */
  listWithSchemas(): Observable<FormManagerForm[]> {
    return this.http.call<unknown>(API_ENDPOINTS.FORM_MANAGER.LIST).pipe(
      map(res => toItems<FormManagerForm>(res)),
      switchMap(list => (list.length === 0 ? of([] as FormManagerForm[]) : forkJoin(list.map(f => this.withSchema(f)))))
    );
  }

  /** One form with the schema of its current version, or of `version`. */
  get(id: number, version?: number): Observable<FormManagerForm> {
    return this.http.call<FormManagerForm>(API_ENDPOINTS.FORM_MANAGER.GET, {
      id,
      params: version ? { version } : undefined
    });
  }

  create(body: CreateFormRequest): Observable<FormManagerForm> {
    return this.http.call<FormManagerForm>(API_ENDPOINTS.FORM_MANAGER.ADD, { body, flags: { skipErrorToast: true } });
  }

  /** Updates the form; a `newSchema` publishes a new version. */
  update(id: number, body: UpdateFormRequest): Observable<FormManagerForm> {
    return this.http.call<FormManagerForm>(API_ENDPOINTS.FORM_MANAGER.UPDATE, { id, body, flags: { skipErrorToast: true } });
  }

  private withSchema(form: FormManagerForm): Observable<FormManagerForm> {
    return this.http
      .call<FormManagerForm>(API_ENDPOINTS.FORM_MANAGER.GET, { id: form.id, flags: { skipErrorToast: true } })
      .pipe(
        map(full => ({ ...form, ...full })),
        catchError(() => of(form))
      );
  }
}
