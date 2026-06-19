/** Auth endpoints that must not carry a bearer token (or surface as toasts). */
export const AUTH_FREE_ENDPOINTS = ['/front/logon', '/front/logon/refresh-token'] as const;

/** True when the request targets an endpoint that handles auth itself. */
export function isAuthFree(url: string): boolean {
  return AUTH_FREE_ENDPOINTS.some((path) => url.includes(path));
}
