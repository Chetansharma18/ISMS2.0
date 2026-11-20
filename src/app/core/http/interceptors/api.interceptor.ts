import { HttpInterceptorFn } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { isApiUrl } from '../../config/api.config';

/**
 * Request policy for every call to our backend (URLs under `environment.apiUrl`; other URLs pass untouched):
 * the `x-client` / `x-api-key` headers, cookies (`withCredentials`), a JSON `Accept` header and a timeout.
 */
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiUrl(req.url)) return next(req);

  const { clientId, apiKey, withCredentials, timeoutMs } = environment.api;
  const setHeaders: Record<string, string> = {};
  if (clientId && !req.headers.has('x-client')) setHeaders['x-client'] = clientId;
  if (apiKey && !req.headers.has('x-api-key')) setHeaders['x-api-key'] = apiKey;
  if (req.responseType === 'json' && !req.headers.has('Accept')) setHeaders['Accept'] = 'application/json';

  const apiReq = req.clone({ setHeaders, withCredentials: req.withCredentials || withCredentials });
  return timeoutMs > 0 ? next(apiReq).pipe(timeout({ each: timeoutMs })) : next(apiReq);
};
