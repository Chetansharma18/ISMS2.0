import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService, RequestOptions } from '../http/http.service';
import { ApiResponse } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpService);

  get<T>(url: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(url, options);
  }

  post<T>(url: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(url, body, options);
  }

  put<T>(url: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(url, body, options);
  }

  patch<T>(url: string, body: any, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(url, body, options);
  }

  delete<T>(url: string, options?: RequestOptions): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(url, options);
  }
}
