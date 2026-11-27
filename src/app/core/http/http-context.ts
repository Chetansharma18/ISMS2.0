import { HttpContext, HttpContextToken } from '@angular/common/http';
import type { LoadingMessageKey } from '../translations/loading.translations';

export type HttpLoadingMode = 'silent' | 'page' | 'fullscreen';

/** Per-request switches read by the interceptors. Set them with `withRequestFlags({ ... })`. */

/** Do not attach the bearer token or try a token refresh on 401 (login / refresh calls themselves). */
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

/** Do not show the global error toast; the caller shows its own message. */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Do not count the request in the global loading indicator (background polling, keep-alive). */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

/** Optional loading scope identifier for targeted inline/section loaders. */
export const LOADING_SCOPE = new HttpContextToken<string | null>(() => null);

/** Optional visual loading mode for the HTTP request (default is 'silent' background tracking). */
export const LOADING_MODE = new HttpContextToken<HttpLoadingMode>(() => 'silent');

/** Optional standardized message key for page/fullscreen HTTP loaders. */
export const LOADING_MESSAGE_KEY = new HttpContextToken<LoadingMessageKey | null>(() => null);

export interface RequestFlags {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
  skipLoading?: boolean;
  loadingScope?: string;
  loadingMode?: HttpLoadingMode;
  loadingMessageKey?: LoadingMessageKey;
}

/** Builds an HttpContext carrying the given flags (merged into `context` when one is passed). */
export function withRequestFlags(flags: RequestFlags, context = new HttpContext()): HttpContext {
  if (flags.skipAuth) context.set(SKIP_AUTH, true);
  if (flags.skipErrorToast) context.set(SKIP_ERROR_TOAST, true);
  if (flags.skipLoading) context.set(SKIP_LOADING, true);
  if (flags.loadingScope) context.set(LOADING_SCOPE, flags.loadingScope);
  if (flags.loadingMode) context.set(LOADING_MODE, flags.loadingMode);
  if (flags.loadingMessageKey) context.set(LOADING_MESSAGE_KEY, flags.loadingMessageKey);
  return context;
}
