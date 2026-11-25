/**
 * Recognises a failed API answer that means "the access token is missing or expired", so the auth interceptor can
 * refresh the session and replay the request.
 *
 * A 401 always means that. Some endpoints check the session themselves and answer 400 / 403 instead, with a message;
 * e.g. switch-role: `400 { success: false, message: "Valid access token is required to switch roles." }`. The browser
 * drops the expired access_token cookie, so such a call arrives without any token although the refresh token is valid.
 */
const EXPIRED_SESSION_MESSAGE =
  /(valid )?access token is required|access token (is )?(missing|expired|invalid)|session has expired|token has expired|not authenticated/i;

/** Statuses that, with one of the messages above, mean the session needs a refresh. */
const MESSAGE_STATUSES = new Set([400, 403]);

/** The `message` of an error body (JSON object or JSON text), or ''. */
function messageOf(body: unknown): string {
  if (typeof body === 'string') {
    try {
      return messageOf(JSON.parse(body));
    } catch {
      return body;
    }
  }
  if (body && typeof body === 'object') {
    const value = (body as Record<string, unknown>)['message'] ?? (body as Record<string, unknown>)['error'];
    return typeof value === 'string' ? value : '';
  }
  return '';
}

/** True when the failed answer means the session must be refreshed before the request can succeed. */
export function needsSessionRefresh(status: number, body: unknown): boolean {
  if (status === 401) return true;
  return MESSAGE_STATUSES.has(status) && EXPIRED_SESSION_MESSAGE.test(messageOf(body));
}
