import { TestBed } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            login: () => null,
            userHasRoles$: () => null
          }
        }
      ]
    });
  });

  it('should login if not authenticated', async () => {
    const auth = TestBed.get(AuthService);
    auth.isAuthenticated$ = of(false);
    spyOn(auth, 'login');

    const guard = TestBed.get(AuthGuard);
    await guard.canActivate({}, { url: '/test' })
      .subscribe((res: boolean) => expect(res).toBeFalsy());

    expect(auth.login).toHaveBeenCalledWith('/test');
  });

  it('should pass if authenticated and no roles required', async () => {
    const auth = TestBed.get(AuthService);
    auth.isAuthenticated$ = of(true);

    const guard = TestBed.get(AuthGuard);
    await guard.canActivate({}, {})
      .subscribe((res: boolean) => expect(res).toBeTruthy());
  });

  it('should check roles if authenticated and required roles provided', async () => {
    const auth = TestBed.get(AuthService);
    auth.isAuthenticated$ = of(true);
    spyOn(auth, 'userHasRoles$').and.returnValue(of(true));

    const guard = TestBed.get(AuthGuard);
    await guard.canActivate({ data: { requiredRoles: ['tester'] } }, {})
      .subscribe((res: boolean) => expect(res).toBeTruthy());

    expect(auth.userHasRoles$).toHaveBeenCalledWith(['tester']);
  });
});
