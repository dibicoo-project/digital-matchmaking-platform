import { TestBed } from '@angular/core/testing';

import { DiBiCooCookieService } from './dibicoo-cookie.service';
import { CookieService } from 'ngx-cookie-service';

describe('DiBiCooCookieService', () => {
  let service: DiBiCooCookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DiBiCooCookieService,
        {
          provide: CookieService,
          useValue: {
            set: () => null,
            delete: () => null,
            check: () => null,
            get: () => null
          }
        },
        {
          provide: 'LOCATION',
          useValue: {
            reload: () => null
          }
        }
      ]
    });
    service = TestBed.inject(DiBiCooCookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save preferences', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'set');

    const data = { media: true, tracking: true };
    service.save(data as any);

    expect(cookies.set as any).toHaveBeenCalledWith('dibicoo.consent', JSON.stringify(data), 30, '/');
  });

  it('should reset preferences', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'delete');

    service.reset();

    expect(cookies.delete).toHaveBeenCalledWith('dibicoo.consent', '/');
  });

  it('should check is cookie saved', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'check').and.returnValue(true);

    expect(service.isSaved()).toBeTrue();
    expect(cookies.check).toHaveBeenCalledWith('dibicoo.consent');
  });

  it('should check tracking', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'get').and.returnValue(JSON.stringify({ tracking: true }));

    expect(service.checkTracking()).toBeTrue();
    expect(cookies.get).toHaveBeenCalledWith('dibicoo.consent');
  });

  it('should check media', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'get').and.returnValue(JSON.stringify({ media: true }));

    expect(service.checkMedia()).toBeTrue();
    expect(cookies.get).toHaveBeenCalledWith('dibicoo.consent');
  });

  it('should check malformed string', () => {
    const cookies = TestBed.inject(CookieService);
    spyOn(cookies, 'get').and.returnValue('asdasdas');

    expect(service.checkMedia()).toBeFalse();
    expect(service.checkTracking()).toBeFalse();
    expect(cookies.get).toHaveBeenCalledWith('dibicoo.consent');
  });
});
