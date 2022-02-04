import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '@root/app/auth/auth.service';
import { Subject } from 'rxjs';

import { EnterpriseWatchlistService } from './enterprise-watchlist.service';

describe('EnterpriseWatchlistService', () => {
  let service: EnterpriseWatchlistService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnterpriseWatchlistService,
        {
          provide: AuthService,
          useValue: {
            isAuthenticated$: new Subject()
          }
        }
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(EnterpriseWatchlistService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    expect(() => http.verify()).not.toThrow();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load watchlist for authenticated user', () => {
    const auth = TestBed.inject(AuthService);
    (auth.isAuthenticated$ as Subject<boolean>).next(true);
    http.expectOne({ method: 'GET', url: '/api/user/enterprises/watchlist' });
  });

  it('should not load watchlist for anonymous user', () => {
    const auth = TestBed.inject(AuthService);
    (auth.isAuthenticated$ as Subject<boolean>).next(false);
    http.expectNone({ method: 'GET', url: '/api/user/enterprises/watchlist' });
  });

  it('should add ID to watchlist', () => {
    service.toggle('123');

    service.all$.subscribe(all => expect(all).toEqual(['123']));
    http.expectOne({ method: 'PUT', url: '/api/user/enterprises/watchlist' });
  });

  it('should remove ID from watchlist', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['state'] = ['111', '222', '333'];

    service.toggle('222');

    service.all$.subscribe(all => expect(all).toEqual(['111', '333']));
    http.expectOne({ method: 'PUT', url: '/api/user/enterprises/watchlist' });
  });
});
