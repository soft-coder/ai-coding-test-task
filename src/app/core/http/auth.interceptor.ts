import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStore } from '../auth/token-store';
import { isAuthFree } from './api-endpoints';

/**
 * Attaches `Authorization: Bearer <token>` to API calls when a token is present.
 * Logon/refresh are exempt so a stale token can't interfere with re-authentication.
 * Transparent 401 refresh+retry is layered on in the auth feature.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).token;
  if (!token || isAuthFree(req.url)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
