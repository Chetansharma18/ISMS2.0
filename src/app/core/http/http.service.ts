import { Injectable, Injector, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EndpointDef, buildApiUrl, resolveEndpointUrl } from '../config/api.config';
import { RequestFlags, withRequestFlags } from './http-context';
import { QueryParamInput, toHttpParams } from './query-params';

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  /** Query params. Empty values are dropped and nested values are serialized safely (see `toHttpParams`). */
  params?: HttpParams | QueryParamInput;
  withCredentials?: boolean;
  /** Interceptor switches for this request (skip auth / error toast / loading indicator). */
  flags?: RequestFlags;
  context?: HttpContext;
}

export interface EndpointCallOptions extends RequestOptions {
  /** Path id for endpoints declared with a `(id) => url` resolver. */
  id?: string | number;
  /** Request body for POST / PUT / PATCH. */
  body?: unknown;
}

/**
 * The only class that talks to HttpClient. Headers, credentials, auth, timeouts, loading and error handling are
 * added by the interceptors registered in `provideApiHttp()`, so callers never repeat them.
 *
 * Prefer `call()` with an entry of `API_ENDPOINTS`: the URL and method then come from the central registry.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly injector = inject(Injector);

  /** Resolved on first use, so services that only call the API in API mode work without HttpClient in mock mode. */
  private get http(): HttpClient {
    return this.injector.get(HttpClient);
  }

  /** Calls a registered endpoint: `http.call(API_ENDPOINTS.SCHEMES.ASSIGN_COMMITTEE, { id, body })`. */
  call<T>(endpoint: EndpointDef, options: EndpointCallOptions = {}): Observable<T> {
    const url = buildApiUrl(resolveEndpointUrl(endpoint.url, options.id));
    return this.http.request<T>(endpoint.method, url, {
      ...this.toHttpOptions(options),
      body: options.body
    });
  }

  /** Downloads a registered endpoint (or absolute URL) as a Blob, e.g. `API_ENDPOINTS.FILES.DOWNLOAD`. */
  blob(endpointOrUrl: EndpointDef | string, options: EndpointCallOptions = {}): Observable<Blob> {
    const url = typeof endpointOrUrl === 'string'
      ? endpointOrUrl
      : buildApiUrl(resolveEndpointUrl(endpointOrUrl.url, options.id));
    const method = typeof endpointOrUrl === 'string' ? 'GET' : endpointOrUrl.method;
    return this.http.request(method, url, {
      ...this.toHttpOptions(options),
      body: options.body,
      responseType: 'blob'
    });
  }

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(url, this.toHttpOptions(options));
  }

  post<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(url, body, this.toHttpOptions(options));
  }

  put<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(url, body, this.toHttpOptions(options));
  }

  patch<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(url, body, this.toHttpOptions(options));
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(url, this.toHttpOptions(options));
  }

  private toHttpOptions(options?: RequestOptions) {
    return {
      headers: options?.headers,
      params: toHttpParams(options?.params),
      withCredentials: options?.withCredentials,
      context: options?.flags ? withRequestFlags(options.flags, options.context) : options?.context
    };
  }
}
