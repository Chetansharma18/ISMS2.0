/**
 * Screens that do not belong to a backend table. With real sign-in every other screen opens only when the user's
 * permissions (GET /auth/permissions) allow its table; typing any other URL sends the user away.
 */

/** Open to everyone, signed in or not: the landing page, the sign-in page and Help & Support. */
export const PUBLIC_PATHS: readonly string[] = ['/', '/sso-login', '/help-support'];

/** Open to every signed-in user, whatever their permissions. */
export const SIGNED_IN_PATHS: readonly string[] = ['/profile'];

/** The path of a URL without query, fragment or trailing slash ("/" for the root). */
export function pathOf(url: string): string {
  const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return path === '' ? '/' : path.toLowerCase();
}

/** True when the URL is the path itself or below it ("/profile" covers "/profile/security"); "/" matches only "/". */
function under(path: string, base: string): boolean {
  return base === '/' ? path === '/' : path === base || path.startsWith(`${base}/`);
}

export function isPublicPath(url: string): boolean {
  const path = pathOf(url);
  return PUBLIC_PATHS.some(base => under(path, base));
}

export function isSignedInPath(url: string): boolean {
  const path = pathOf(url);
  return SIGNED_IN_PATHS.some(base => under(path, base));
}
