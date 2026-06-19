import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth.token';
const REFRESH_KEY = 'auth.refreshToken';

/** A JWT pair as returned by the logon/refresh endpoints. */
export interface Tokens {
  token: string;
  refreshToken: string;
}

/**
 * Single source of truth for JWT tokens, persisted in localStorage so the
 * session survives a reload. The refresh/retry flow lives in the auth feature;
 * this store only reads, writes, and clears.
 */
@Injectable({ providedIn: 'root' })
export class TokenStore {
  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  get hasToken(): boolean {
    return this.token !== null;
  }

  set(tokens: Tokens): void {
    localStorage.setItem(TOKEN_KEY, tokens.token);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}
