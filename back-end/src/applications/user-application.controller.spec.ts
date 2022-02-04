import { createMock } from './../../test/utils';

import { UserApplicationController } from './user-application.controller';
import { ApplicationService } from './application.service';
import { DiBiCooPrincipal } from '../security/principal';
import { ApplicationBean } from './application.domain';
import { ApplicationFiltersService } from '../matchmaking/filters.service';

describe('UserApplicationController', () => {

  let controller: UserApplicationController;
  let service: ApplicationService;
  let filtersService: ApplicationFiltersService;
  let user: DiBiCooPrincipal;
  let bean: ApplicationBean;

  beforeEach(() => {
    service = createMock(ApplicationService);
    filtersService = createMock(ApplicationFiltersService);
    controller = new UserApplicationController(service, filtersService);
    user = new DiBiCooPrincipal({ sub: 'tester' });
    bean = {} as ApplicationBean;
  });

  it('should get application list', async () => {
    spyOn(service, 'getUserApplications').and.returnValue(
      Promise.resolve({ drafts: [{} as any, {} as any], published: [{} as any]})
    );
    const data = await controller.listUserApplications(user);

    expect(data.drafts.length).toBe(2);
    expect(data.published.length).toBe(1);
    expect(service.getUserApplications).toHaveBeenCalled();
  });

  it('should get application details', async () => {
    spyOn(service, 'getUserApplicationDetails').and.returnValue(
      Promise.resolve(bean)
    );
    await controller.getApplicationDetails('123', user);
    expect(service.getUserApplicationDetails).toHaveBeenCalled();
  });

  it('should create application', async () => {
    spyOn(service, 'addApplication').and.returnValue(Promise.resolve(bean));
    await controller.createApplication(bean, user);
    expect(service.addApplication).toHaveBeenCalled();
  });

  it('should edit application', async () => {
    spyOn(service, 'editApplication').and.returnValue(Promise.resolve(bean));
    await controller.editApplication('123', bean, user);
    expect(service.editApplication).toHaveBeenCalled();
  });

  it('should delete application', async () => {
    spyOn(service, 'deleteApplication').and.returnValue(Promise.resolve());
    const spy = jasmine.createSpy();
    await controller.deleteApplication('123', user, {sendStatus: spy} as any);
    expect(service.deleteApplication).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(204);
  });

  it('should change application status', async () => {
    spyOn(service, 'changeApplicationStatus').and.returnValue(Promise.resolve(undefined));
    const spy = jasmine.createSpy();
    await controller.changeApplicationStatus('123', { action: 'publish'},  user, {sendStatus: spy} as any);
    expect(service.changeApplicationStatus).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(204);
  });

  it('should save matchmaking', async () => {
    spyOn(filtersService, 'saveFilters');
    await controller.saveMatchmaking({ label: 'testing' } as any, user);
    expect(filtersService.saveFilters).toHaveBeenCalledWith({ label: 'testing' } as any, user);
  });

  it('should get saved matchmaking list', async () => {
    spyOn(filtersService, 'listFilters');
    await controller.getSavedMatchmaking(user);
    expect(filtersService.listFilters).toHaveBeenCalled();
  });

  it('should delete matchmaking', async () => {
    spyOn(filtersService, 'deleteFilters');
    const res = jasmine.createSpy();
    await controller.deleteMatchmaking('123', user, { sendStatus: res } as any);
    expect(filtersService.deleteFilters).toHaveBeenCalledWith('123', user);
    expect(res).toHaveBeenCalledWith(204);
  });
});
