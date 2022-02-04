import { TestBed } from '@angular/core/testing';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthInterceptor,
      {
        provide: AuthService,
        useValue: {
          login: () => null,
          userHasRoles$: () => null
        }
      }
    ]
  }));

  it('should be created', () => {
    const interceptor: AuthInterceptor = TestBed.get(AuthInterceptor);
    expect(interceptor).toBeTruthy();
  });

  it('should pass unchanged request if not authenticated', async () => {
    const auth = TestBed.get(AuthService);
    auth.isAuthenticated$ = of(false);
    const spy = jasmine.createSpy().and.returnValue(of(null));
    const req = { test: 123, url: '/api/test' };

    const interceptor = TestBed.get(AuthInterceptor);
    await interceptor.intercept(req, { handle: spy }).subscribe();

    expect(spy).toHaveBeenCalledWith(req);
  });

  it('should add token to the request if authenticated', async () => {
    const auth = TestBed.get(AuthService);
    auth.isAuthenticated$ = of(true);
    auth.getTokenSilently$ = of('abc-xyz');
    const spy = jasmine.createSpy().and.returnValue(of(null));

    const reqWithToken = { withToken: true };
    const req = { test: 123, url: '/api/test', clone: jasmine.createSpy().and.returnValue(reqWithToken) };

    const interceptor = TestBed.get(AuthInterceptor);
    await interceptor.intercept(req, { handle: spy }).subscribe();

    expect(spy).toHaveBeenCalledWith(reqWithToken);
    expect(req.clone).toHaveBeenCalledWith({ setHeaders: { authorization: 'Bearer abc-xyz' } });
  });
});
