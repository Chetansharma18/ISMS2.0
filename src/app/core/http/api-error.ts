import { HttpErrorResponse } from '@angular/common/http';

/**
 * One error shape for every failed API call, whatever the backend or the network returned.
 * The error interceptor converts every HttpErrorResponse into this, so callers only handle `ApiError`.
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status; 0 when the server could not be reached, 408 for a client-side timeout. */
    readonly status: number,
    message: string,
    /** Machine-readable code from the backend body (`code`), when it sends one. */
    readonly code?: string,
    /** Field / validation messages from the backend body. */
    readonly errors: string[] = [],
    /** Correlation id from the response header or body, to quote when reporting a problem. */
    readonly correlationId?: string,
    /** The method and URL of the failed request. */
    readonly request?: { method: string; url: string },
    /** Per-field validation errors when the backend names the field (`errors: [{ field, message, code }]`). */
    readonly fieldErrors: ApiFieldError[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }
}

const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'Cannot reach the server. Check your connection and try again.',
  400: 'The request was not valid.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to do this.',
  404: 'The requested record was not found.',
  408: 'The server took too long to respond. Please try again.',
  409: 'This record conflicts with an existing one.',
  413: 'The file is too large.',
  422: 'Some details are not valid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on the server. Please try again later.',
  502: 'The server is unavailable. Please try again later.',
  503: 'The server is unavailable. Please try again later.',
  504: 'The server took too long to respond. Please try again.'
};

/** The user-facing message for a status when the backend did not send one. */
export function defaultErrorMessage(status: number): string {
  return DEFAULT_MESSAGES[status] ?? (status >= 500 ? DEFAULT_MESSAGES[500] : 'The request failed. Please try again.');
}

type ErrorBody = {
  message?: unknown;
  title?: unknown;
  detail?: unknown;
  code?: unknown;
  error?: unknown;
  errors?: unknown;
  correlationId?: unknown;
};

/** One validation failure the backend tied to a field. */
export interface ApiFieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Field errors sent as `[{ field, message, code }]` (FluentValidation style) or as ASP.NET-style
 * `{ field: [messages] }`. Entries without a field name are left out.
 */
export function collectFieldErrors(errors: unknown): ApiFieldError[] {
  if (Array.isArray(errors)) {
    return errors.flatMap(e => {
      if (!e || typeof e !== 'object') return [];
      const item = e as Record<string, unknown>;
      const field = text(item['field']) ?? text(item['propertyName']);
      const message = text(item['message']) ?? text(item['errorMessage']);
      return field && message ? [{ field, message, code: text(item['code']) ?? text(item['errorCode']) }] : [];
    });
  }
  if (errors && typeof errors === 'object') {
    return Object.entries(errors as Record<string, unknown>).flatMap(([field, v]) =>
      (Array.isArray(v) ? v : [v]).filter((m): m is string => typeof m === 'string' && !!m.trim()).map(message => ({ field, message }))
    );
  }
  return [];
}

/** Flattens `errors` sent as a list of strings, a list of `{ message }` objects or ASP.NET-style `{ field: [messages] }`. */
function collectErrors(errors: unknown): string[] {
  if (Array.isArray(errors)) {
    return errors.flatMap(e =>
      typeof e === 'string' ? [e] : e && typeof e === 'object' && typeof (e as { message?: unknown }).message === 'string'
        ? [(e as { message: string }).message] : []
    );
  }
  if (errors && typeof errors === 'object') {
    return Object.values(errors as Record<string, unknown>).flatMap(v =>
      Array.isArray(v) ? v.filter((e): e is string => typeof e === 'string') : typeof v === 'string' ? [v] : []
    );
  }
  return [];
}

const text = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** Converts anything thrown by an HTTP call into an ApiError. Already-converted errors pass through. */
export function toApiError(error: unknown, request?: { method: string; url: string }): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof HttpErrorResponse) {
    const isProgressEvent = typeof ProgressEvent !== 'undefined' && error.error instanceof ProgressEvent;
    const body: ErrorBody | null =
      error.error && typeof error.error === 'object' && !isProgressEvent ? (error.error as ErrorBody) : null;
    const rawText = typeof error.error === 'string' ? text(error.error) : undefined;
    const errors = collectErrors(body?.errors);
    const message =
      text(body?.message) ?? text(body?.detail) ?? text(body?.title) ?? text(body?.error) ?? errors[0] ??
      (rawText && rawText.length <= 200 && !rawText.startsWith('<') ? rawText : undefined) ??
      defaultErrorMessage(error.status);
    const correlationId = error.headers?.get('X-Correlation-ID') ?? text(body?.correlationId);
    return new ApiError(
      error.status, message, text(body?.code), errors, correlationId ?? undefined, request, collectFieldErrors(body?.errors)
    );
  }

  if (error instanceof Error && error.name === 'TimeoutError') {
    return new ApiError(408, defaultErrorMessage(408), 'TIMEOUT', [], undefined, request);
  }

  const message = error instanceof Error ? error.message : defaultErrorMessage(-1);
  return new ApiError(-1, message, undefined, [], undefined, request);
}
