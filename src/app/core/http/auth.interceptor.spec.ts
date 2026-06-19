import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from './auth.interceptor';
import { TokenStore } from '../auth/token-store';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let store: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(TokenStore);
    store.clear();
  });

  afterEach(() => {
    httpMock.verify();
    store.clear();
  });

  it('attaches the bearer token when one is present', () => {
    store.set({ token: 'abc', refreshToken: 'r' });
    http.get('/front/categories').subscribe();

    const req = httpMock.expectOne('/front/categories');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('does not attach a header when there is no token', () => {
    http.get('/front/categories').subscribe();

    const req = httpMock.expectOne('/front/categories');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('leaves logon requests unauthenticated even with a token', () => {
    store.set({ token: 'abc', refreshToken: 'r' });
    http.post('/front/logon', {}).subscribe();

    const req = httpMock.expectOne('/front/logon');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
