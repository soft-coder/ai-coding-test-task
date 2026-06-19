import { Injectable, signal } from '@angular/core';

export type NotificationSeverity = 'error' | 'success' | 'info';

export interface AppNotification {
  severity: NotificationSeverity;
  text: string;
}

/**
 * App-wide notification surface. HTTP failures and feature actions push messages
 * here; the toast UI (PrimeNG) renders them in a later feature. Exposed as a
 * signal so consumers can react without RxJS plumbing.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _last = signal<AppNotification | null>(null);
  readonly last = this._last.asReadonly();

  error(text: string): void {
    this._last.set({ severity: 'error', text });
  }

  success(text: string): void {
    this._last.set({ severity: 'success', text });
  }

  info(text: string): void {
    this._last.set({ severity: 'info', text });
  }
}
