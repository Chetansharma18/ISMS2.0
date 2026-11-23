import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { apiClientHeaders, isApiUrl } from '../../config/api.config';

/**
 * Request policy for every call to our backend (any URL under `environment.apiUrl`; other URLs pass untouched):
 * the mandatory `x-client` / `x-api-key` headers, cookies (`withCredentials`), a JSON `Accept` header and a timeout.
 * Registered globally (provideApiHttp), so every HttpClient call, present or future, gets the headers.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiUrl(req.url)) return next(req);

  const { withCredentials, timeoutMs } = environment.api;
  const setHeaders: Record<string, string> = {};
  for (const [name, value] of Object.entries(apiClientHeaders())) {
    if (!req.headers.has(name)) setHeaders[name] = value;
  }
  if (req.responseType === 'json' && !req.headers.has('Accept')) setHeaders['Accept'] = 'application/json';

  const apiReq = req.clone({ setHeaders, withCredentials: req.withCredentials || withCredentials });
  return timeoutMs > 0 ? next(apiReq).pipe(timeout({ each: timeoutMs })) : next(apiReq);
};
