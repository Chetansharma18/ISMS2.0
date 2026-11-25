import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RequestOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private http = inject(HttpClient);

  get<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.get<T>(url, {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials
    });
  }

  post<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.post<T>(url, body, {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials
    });
  }

  put<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.put<T>(url, body, {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials
    });
  }

  patch<T>(url: string, body: unknown, options?: RequestOptions): Observable<T> {
    return this.http.patch<T>(url, body, {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials
    });
  }

  delete<T>(url: string, options?: RequestOptions): Observable<T> {
    return this.http.delete<T>(url, {
      headers: options?.headers,
      params: options?.params,
      withCredentials: options?.withCredentials
    });
  }
}
