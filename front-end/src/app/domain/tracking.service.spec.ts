/* eslint-disable @typescript-eslint/naming-convention */
import { TestBed } from '@angular/core/testing';

import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;
  let gtag: (...params) => void;


  beforeEach(() => {
    gtag = jasmine.createSpy();
    (window as any).gtag = gtag;
    TestBed.configureTestingModule({ providers: [TrackingService] });
    service = TestBed.inject(TrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register company profile view', () => {
    service.pageView('/enterprises/123');
    expect(gtag).toHaveBeenCalledWith('event', 'company_profile_view', jasmine.objectContaining({ company_id: '123' }));
  });

  it('should register application view', () => {
    service.pageView('/applications/123');
    expect(gtag).toHaveBeenCalledWith('event', 'application_view', jasmine.objectContaining({ application_id: '123' }));
  });

  it('should register general page view', () => {
    service.pageView('/privacy');
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', jasmine.anything());
  });
});
