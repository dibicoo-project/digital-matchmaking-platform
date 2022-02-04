import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('AuthService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthService
    ],
    imports: [RouterTestingModule]

  }));

  it('should be created', () => {
    const service: AuthService = TestBed.get(AuthService);
    expect(service).toBeTruthy();
  });

  it('should load user profile on startup if user is authneticated', () => {
    const service = TestBed.get(AuthService);
    service.isAuthenticated$ = of(true);
    spyOn(service, 'getUser$').and.returnValue(of({ name: 'John' }));

    service.localAuthSetup();

    expect(service.getUser$).toHaveBeenCalled();
  });

  it('should handle Auth0 callback on startup', () => {
    const service = TestBed.get(AuthService);
    // const spy = spyOnProperty(window.location, 'search', 'get').and.returnValue('?code=123&state=987')

    service.handleAuthCallback();

    pending('needs refactoring');
  });
});
