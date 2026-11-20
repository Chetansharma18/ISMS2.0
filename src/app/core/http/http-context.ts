import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Per-request switches read by the interceptors. Set them with `withRequestFlags({ ... })`. */

/** Do not attach the bearer token or try a token refresh on 401 (login / refresh calls themselves). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** Do not show the global error toast; the caller shows its own message. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Do not count the request in the global loading indicator (background polling, keep-alive). */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export interface RequestFlags {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  skipLoading?: boolean;
}

/** Builds an HttpContext carrying the given flags (merged into `context` when one is passed). */
export function withRequestFlags(flags: RequestFlags, context = new HttpContext()): HttpContext {
  if (flags.skipAuth) context.set(SKIP_AUTH, true);
  if (flags.skipErrorToast) context.set(SKIP_ERROR_TOAST, true);
  if (flags.skipLoading) context.set(SKIP_LOADING, true);
  return context;
}
