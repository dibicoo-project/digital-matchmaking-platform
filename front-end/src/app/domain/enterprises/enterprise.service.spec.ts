import { TestBed } from '@angular/core/testing';
import { Enterprise } from './enterprise-domain';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { EnterpriseService } from './enterprise.service';
import { CacheService } from '@domain/cache.service';

describe('EnterpriseService', () => {

  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EnterpriseService,
        CacheService
      ],
      imports: [HttpClientTestingModule]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should be created', () => {
    const service = TestBed.inject(EnterpriseService);
    expect(service).toBeTruthy();
  });

  describe('for public', () => {
    const root = '/api/enterprises';

    it('should get enterprise list', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getEnterprises().subscribe();
      http.expectOne({ method: 'GET', url: root });
    });

    it('should get enterprise details', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getEnterprise('100').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/100` });
    });

    it('should get invitation details', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getInvitationDetails('100').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/invite/100` });
    });

    it('should report enterprise', () => {
      const service = TestBed.inject(EnterpriseService);
      service.reportEnterprise('123', 'testing').subscribe();
      http.expectOne({ method: 'POST', url: `${root}/123/report` });
    });

  });

  describe('for user', () => {
    const root = '/api/user/enterprises';

    it('should get enterprise list', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getUserEnterprises().subscribe();
      http.expectOne({ method: 'GET', url: `${root}` });
    });

    it('should get enterprise details', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getUserEnterprise('200').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/200` });
    });

    it('should add new enterprise', () => {
      const service = TestBed.inject(EnterpriseService);
      service.addEnterprise({ id: '123' } as Enterprise).subscribe();
      http.expectOne({ method: 'POST', url: `${root}` });
    });

    it('should edit enterprise', () => {
      const service = TestBed.inject(EnterpriseService);
      service.editEnterprise('123', { id: '987' } as Enterprise).subscribe();
      http.expectOne({ method: 'PUT', url: `${root}/123` });
    });

    it('should add enterprise image', () => {
      const service = TestBed.inject(EnterpriseService);
      service.addEnterpriseLogo('123', new FormData()).subscribe();
      http.expectOne({ method: 'POST', url: `${root}/123/logo` });
    });

    it('should change enterprise status', () => {
      const service = TestBed.inject(EnterpriseService);
      service.changeEnterpriseStatus('123', 'publish').subscribe();
      http.expectOne({ method: 'PATCH', url: `${root}/123` });
    });

    it('should delete enterprise', () => {
      const service = TestBed.inject(EnterpriseService);
      service.deleteEnterprise('123').subscribe();
      http.expectOne({ method: 'DELETE', url: `${root}/123` });
    });

    it('should delete enterprise logo', () => {
      const service = TestBed.inject(EnterpriseService);
      service.deleteEnterpriseLogo('123').subscribe();
      http.expectOne({ method: 'DELETE', url: `${root}/123/logo` });
    });

    it('should get enterprise shares', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getEnterpriseShares('123').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/123/share` });
    });

    it('should add enterprise share', () => {
      const service = TestBed.inject(EnterpriseService);
      service.addEnterpriseShare('123', {}).subscribe();
      http.expectOne({ method: 'POST', url: `${root}/123/share` });
    });

    it('should revoke enterprise share', () => {
      const service = TestBed.inject(EnterpriseService);
      service.revokeEnterpriseShare('123', {}).subscribe();
      http.expectOne({ method: 'DELETE', url: `${root}/123/share` });
    });

    it('should accept invitation details', () => {
      const service = TestBed.inject(EnterpriseService);
      service.acceptInvitation('100').subscribe();
      http.expectOne({ method: 'POST', url: `${root}/invite/100` });
    });

    it('should get enterprise statistics', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getEnterpriseStatistics('123').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/123/statistics` });
    });

    it('should send message', () => {
      const service = TestBed.inject(EnterpriseService);
      service.sendMessage('123', { name: 'John'} as any).subscribe();
      http.expectOne({ method: 'POST', url: `${root}/123/message` });
    });

    it('should get filter list', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getSavedMatchmaking().subscribe();
      http.expectOne({ method: 'GET', url: `${root}/matchmaking` });
    });

    it('should add new filter', () => {
      const service = TestBed.inject(EnterpriseService);
      service.saveMatchmaking({  } as any).subscribe();
      http.expectOne({ method: 'POST', url: `${root}/matchmaking` });
    });

    it('should delete filter', () => {
      const service = TestBed.inject(EnterpriseService);
      service.deleteMatchmaking('123').subscribe();
      http.expectOne({ method: 'DELETE', url: `${root}/matchmaking/123` });
    });

  });

  describe('for admin', () => {
    const root = '/api/admin/enterprises';

    it('should get enterprise list', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getAdminEnterprises().subscribe();
      http.expectOne({ method: 'GET', url: `${root}` });
    });

    it('should get enterprise details', () => {
      const service = TestBed.inject(EnterpriseService);
      service.getAdminEnterprise('123').subscribe();
      http.expectOne({ method: 'GET', url: `${root}/123` });
    });

    it('should change enterprise status', () => {
      const service = TestBed.inject(EnterpriseService);
      service.changeAdminEnterpriseStatus('123', 'publish').subscribe();
      http.expectOne({ method: 'PATCH', url: `${root}/123` });
    });
  });
});
