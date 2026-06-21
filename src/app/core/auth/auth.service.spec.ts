import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { TokenStore } from './token-store';
import { LogonService } from '../api/api/logon.service';
import { LogonResponseDto } from '../api/model/logon-response-dto';

describe('AuthService', () => {
  let service: AuthService;
  let store: TokenStore;
  let logon: jasmine.SpyObj<LogonService>;

  beforeEach(() => {
    logon = jasmine.createSpyObj<LogonService>('LogonService', [
      'logon',
      'refreshToken',
      'getCurrentUser',
    ]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: LogonService, useValue: logon }],
    });
    service = TestBed.inject(AuthService);
    store = TestBed.inject(TokenStore);
    store.clear();
  });

  afterEach(() => store.clear());

  it('stores tokens and the user on login', (done) => {
    const response = {
      token: 't',
      refreshToken: 'r',
      user: { displayName: 'Alice', timezoneOffset: '00:00:00', permissions: {} },
    } as LogonResponseDto;
    // logon() is overloaded; use the untyped Spy view to stub the body overload.
    (logon.logon as jasmine.Spy).and.returnValue(of(response));

    service.login('u', 'p').subscribe(() => {
      expect(store.token).toBe('t');
      expect(store.refreshToken).toBe('r');
      expect(service.user()?.displayName).toBe('Alice');
      expect(service.isAuthenticated()).toBeTrue();
      done();
    });
  });

  it('clears tokens and navigates to /login on logout', () => {
    store.set({ token: 't', refreshToken: 'r' });
    const navigate = spyOn(TestBed.inject(Router), 'navigate');

    service.logout();

    expect(store.token).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
