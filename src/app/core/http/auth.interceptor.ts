import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { TokenStore } from '../auth/token-store';
import { isAuthFree } from './api-endpoints';

function withBearer<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

/**
 * Attaches `Authorization: Bearer <token>` to API calls and transparently
 * refreshes on 401: refresh the token pair once, then retry the original
 * request. Logon/refresh are exempt (they manage auth themselves), and a failed
 * refresh logs the user out. Refresh sharing lives in {@link AuthService}.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const tokens = inject(TokenStore);
  const token = tokens.token;

  const outgoing = !token || isAuthFree(req.url) ? req : withBearer(req, token);

  return next(outgoing).pipe(
    catchError((err: HttpErrorResponse) => {
      const canRefresh = err.status === 401 && !isAuthFree(req.url) && !!tokens.refreshToken;
      if (!canRefresh) {
        return throwError(() => err);
      }
      return auth.refresh().pipe(
        switchMap((next2) => next(withBearer(req, next2.token))),
        catchError((refreshErr) => {
          auth.logout();
          return throwError(() => refreshErr);
        }),
      );
    }),
  );
};
