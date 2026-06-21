import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';

import { authGuard } from './auth.guard';
import { TokenStore } from './token-store';

function runGuard(): boolean | UrlTree {
  return TestBed.runInInjectionContext(() =>
    authGuard({} as ActivatedRouteSnapshot, { url: '/categories' } as RouterStateSnapshot),
  ) as boolean | UrlTree;
}

describe('authGuard', () => {
  let store: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    store = TestBed.inject(TokenStore);
    store.clear();
  });

  afterEach(() => store.clear());

  it('allows navigation when a token exists', () => {
    store.set({ token: 't', refreshToken: 'r' });
    expect(runGuard()).toBeTrue();
  });

  it('redirects to /login with returnUrl when unauthenticated', () => {
    const result = runGuard();
    expect(result instanceof UrlTree).toBeTrue();
    const tree = result as UrlTree;
    expect(tree.toString()).toContain('/login');
    expect(tree.toString()).toContain('returnUrl');
  });
});
