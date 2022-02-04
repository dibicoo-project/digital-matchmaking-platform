import { createMock } from './../../test/utils';

import { NotificationService } from '../notifications/notification.service';
import { MatchmakingFacade } from './matchmaking.facade';
import { ApplicationMatchmakingService } from './application-matchmaking.service';
import { EnterpriseMatchmakingService } from './enterprise-matchmaking.service';
import { Application } from '../applications/application.domain';
import { Enterprise } from '../enterprises/enterprise.domain';


describe('MatchmakingFacade', () => {
  let applications: ApplicationMatchmakingService;
  let enterprises: EnterpriseMatchmakingService;
  let notifications: NotificationService;
  let facade: MatchmakingFacade;

  beforeEach(() => {
    applications = createMock(ApplicationMatchmakingService);
    enterprises = createMock(EnterpriseMatchmakingService);
    notifications = createMock(NotificationService);
    facade = new MatchmakingFacade(applications, enterprises, notifications);
  });

  it('should match application to filters', async () => {
    spyOn(applications, 'matchFiltersAndNotify');
    const one = {} as any;
    await facade.matchApplicationToFilters(one);
    expect(applications.matchFiltersAndNotify).toHaveBeenCalledWith(one);
  });

  it('should match application to enterprises', async () => {
    spyOn(enterprises, 'filterObjects').and.returnValue(
      Promise.resolve([
        { companyName: 'Company A', owners: ['john', 'peter'] },
        { companyName: 'Company B', owners: ['peter'] },
        { companyName: 'Company C', owners: ['peter', 'mary'] }
      ] as Enterprise[])
    );
    spyOn(notifications, 'add');

    const one = { mainCategoryId: '987', categoryId: '123' } as Application;
    await facade.matchApplicationToEnterprises(one);

    expect(enterprises.filterObjects).toHaveBeenCalledWith({ 'business-field': [{ type: 'categoryId', value: '123' }] });
    expect(notifications.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ body: jasmine.stringMatching('Company A') }),
      'john', 'peter'
    );
    expect(notifications.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ body: jasmine.stringMatching('Company B') }),
      'peter'
    );
    expect(notifications.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ body: jasmine.stringMatching('Company C') }),
      'peter', 'mary'
    );
  });

  it('should match enterprise to filters', async () => {
    spyOn(enterprises, 'matchFiltersAndNotify');
    const one = {} as any;
    await facade.matchEnterpriseToFilters(one);
    expect(enterprises.matchFiltersAndNotify).toHaveBeenCalledWith(one);
  });
});
