import { createMock } from './../../test/utils';

import { AdminApplicationController } from './admin-application.controller';
import { ApplicationService } from './application.service';
import { DiBiCooPrincipal } from '../security/principal';
import { ApplicationAdminChangeBean, ApplicationBean } from './application.domain';

describe('AdminApplicationController', () => {

  let controller: AdminApplicationController;
  let service: ApplicationService;
  let user: DiBiCooPrincipal;
  let bean: ApplicationBean;

  beforeEach(() => {
    service = createMock(ApplicationService);
    controller = new AdminApplicationController(service);
    user = new DiBiCooPrincipal({ sub: 'tester' });
    bean = {} as ApplicationBean;
  });

  it('should get application list', async () => {
    spyOn(service, 'getAdminApplications').and.returnValue(
      Promise.resolve({ pending: [{}, {}], published: [{}, {}, {}] } as any)
    );
    const data = await controller.listAdminApplications(user);

    expect(data.pending.length).toBe(2);
    expect(data.published.length).toBe(3);
    expect(service.getAdminApplications).toHaveBeenCalled();
  });

  it('should get application details', async () => {
    spyOn(service, 'getAdminApplication').and.returnValue(
      Promise.resolve({ pending: { description: 'A'}, published: { description: 'B'} } as any)
    );
    const data = await controller.getAdminApplication('123', user);

    expect(data.pending.description).toBe('A');
    expect(data.published?.description).toBe('B');
    expect(service.getAdminApplication).toHaveBeenCalledWith('123', user);
  });

  it('should change application status', async () => {
    spyOn(service, 'changeAdminApplicationStatus').and.returnValue(Promise.resolve(undefined));
    const spy = jasmine.createSpy();
    const bean: ApplicationAdminChangeBean = { action: 'unpublish', message: 'text' };

    await controller.changeApplicationStatus('123', bean, user, { sendStatus: spy } as any);
    expect(service.changeAdminApplicationStatus).toHaveBeenCalledWith('123', bean, user);
    expect(spy).toHaveBeenCalledWith(204);
  });
});
