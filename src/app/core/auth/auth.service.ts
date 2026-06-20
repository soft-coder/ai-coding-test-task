import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, shareReplay, tap, throwError } from 'rxjs';

import { LogonService } from '../api/api/logon.service';
import { CurrentUserDto } from '../api/model/current-user-dto';
import { TokenStore, Tokens } from './token-store';

/**
 * Owns the authenticated session: login, logout, token refresh, and the current
 * user. Tokens persist in {@link TokenStore} (localStorage) so the session
 * survives a reload; the guard treats a stored token as an active session.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly logonApi = inject(LogonService);
  private readonly tokens = inject(TokenStore);
  private readonly router = inject(Router);

  private readonly _user = signal<CurrentUserDto | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** Shared in-flight refresh so parallel 401s trigger a single refresh call. */
  private refresh$: Observable<Tokens> | null = null;

  login(login: string, password: string): Observable<void> {
    return this.logonApi.logon({ login, password }).pipe(
      tap((res) => {
        this.tokens.set({ token: res.token, refreshToken: res.refreshToken });
        this._user.set(res.user);
      }),
      map(() => undefined),
    );
  }

  logout(): void {
    this.tokens.clear();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  /** Refreshes the token pair; multiple callers share one request. */
  refresh(): Observable<Tokens> {
    if (this.refresh$) return this.refresh$;

    const refreshToken = this.tokens.refreshToken;
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    this.refresh$ = this.logonApi.refreshToken({ refreshToken }).pipe(
      map((res): Tokens => ({ token: res.token, refreshToken: res.refreshToken })),
      tap((next) => this.tokens.set(next)),
      shareReplay(1),
      finalize(() => (this.refresh$ = null)),
    );
    return this.refresh$;
  }

  /** Loads the current user into the signal (used to restore display state). */
  loadCurrentUser(): Observable<CurrentUserDto> {
    return this.logonApi.getCurrentUser().pipe(tap((user) => this._user.set(user)));
  }
}
