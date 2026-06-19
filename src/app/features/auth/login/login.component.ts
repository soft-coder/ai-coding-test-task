import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Placeholder login screen — full reactive form + PrimeNG UI lands in the auth feature. */
@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<h1>Logon to Zidium</h1>',
})
export class LoginComponent {}
