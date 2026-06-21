import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { TokenStore } from './token-store';

/**
 * Protects authenticated routes. A stored token counts as an active session
 * (survives reload); otherwise redirect to /login, preserving the target as
 * `returnUrl` so login can send the user back.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (inject(TokenStore).hasToken) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
