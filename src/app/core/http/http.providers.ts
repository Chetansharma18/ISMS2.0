import { EnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../auth/auth.interceptor';
import { apiInterceptor } from './interceptors/api.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { loadingInterceptor } from './interceptors/loading.interceptor';

/**
 * The application's HttpClient with every interceptor, in order (a request passes them top to bottom,
 * the response bottom to top):
 *
 * 1. apiInterceptor     - API headers (x-client, x-api-key), cookies, Accept, timeout
 * 2. loadingInterceptor - global in-flight counter (LoadingService)
 * 3. errorInterceptor   - converts failures to ApiError and shows one toast
 * 4. authInterceptor    - bearer token, one refresh + replay on 401, redirect to sign-in when it fails
 *
 * Register once in app.config.ts. Tests that need HttpClient call this too, plus provideHttpClientTesting().
 */
export function provideApiHttp(): EnvironmentProviders {
  return provideHttpClient(withInterceptors([apiInterceptor, loadingInterceptor, errorInterceptor, authInterceptor]));
}
