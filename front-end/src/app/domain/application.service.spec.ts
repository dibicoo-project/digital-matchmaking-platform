import { TestBed } from '@angular/core/testing';

import { ApplicationService } from './application.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { Application } from './application-domain';
import { CacheService } from './cache.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationService, CacheService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(ApplicationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get applications', () => {
    service.getApplications().subscribe();
    http.expectOne({ method: 'GET', url: '/api/applications' });
  });

  it('should get user applications', () => {
    service.getUserApplications().subscribe();
    http.expectOne({ method: 'GET', url: '/api/user/applications' });
  });

  it('should get application', () => {
    service.getApplication('123').subscribe();
    http.expectOne({ method: 'GET', url: '/api/applications/123' });
  });

  it('should get user application', () => {
    service.getUserApplication('987').subscribe();
    http.expectOne({ method: 'GET', url: '/api/user/applications/987' });
  });

  it('should add application', () => {
    service.addApplication({} as Application).subscribe();
    http.expectOne({ method: 'POST', url: '/api/user/applications' });
  });

  it('should edit application', () => {
    service.editApplication('123', {} as Application).subscribe();
    http.expectOne({ method: 'PUT', url: '/api/user/applications/123' });
  });

  it('should change application status', () => {
    service.changeApplicationStatus('123', 'publish').subscribe();
    http.expectOne({ method: 'PATCH', url: '/api/user/applications/123' });
  });

  it('should delete application', () => {
    service.deleteApplication('234').subscribe();
    http.expectOne({ method: 'DELETE', url: '/api/user/applications/234' });
  });

  it('should report application', () => {
    service.reportApplication('123', 'message').subscribe();
    http.expectOne({ method: 'POST', url: '/api/applications/123/report' });
  });

  it('should get admin applications', () => {
    service.getAdminApplications().subscribe();
    http.expectOne({ method: 'GET', url: '/api/admin/applications' });
  });

  it('should get admin application', () => {
    service.getAdminApplication('123').subscribe();
    http.expectOne({ method: 'GET', url: '/api/admin/applications/123' });
  });

  it('should change admin application status', () => {
    service.changeAdminApplicationStatus('123', 'publish', 'test').subscribe();
    http.expectOne({ method: 'PATCH', url: '/api/admin/applications/123' });
  });
});
