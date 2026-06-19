import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../notifications/notification.service';
import { isAuthFree } from './api-endpoints';
import { httpErrorMessage } from './http-error-message';

/**
 * Central surface for HTTP failures: turns an error into a readable message and
 * forwards it to the notification service, then rethrows so callers can still
 * react. 401 is left to the auth feature's refresh flow, and auth endpoints
 * render their own inline errors, so neither is surfaced as a toast here.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 && !isAuthFree(req.url)) {
        notifications.error(httpErrorMessage(err));
      }
      return throwError(() => err);
    }),
  );
};
