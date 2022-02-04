import { createMock } from './../../test/utils';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

describe('ApplicationController', () => {

  let controller: ApplicationController;
  let service: ApplicationService;

  beforeEach(() => {
    service = createMock(ApplicationService);
    controller = new ApplicationController(service);
  });

  it('should get application list', async () => {
    spyOn(service, 'getPublicApplications').and.returnValue(
      Promise.resolve([{} as any, {} as any])
    );
    const list = await controller.listApplications();

    expect(list.length).toBe(2);
    expect(service.getPublicApplications).toHaveBeenCalled();
  });

  it('should get application details', async () => {
    spyOn(service, 'getPublicApplicationDetails').and.returnValue(Promise.resolve({} as any));
    await controller.getApplicationDetails('123');
    expect(service.getPublicApplicationDetails).toHaveBeenCalledWith('123');
  });

  it('should report application', async () => {
    const spy = jasmine.createSpy();
    spyOn(service, 'reportApplication').and.returnValue(Promise.resolve());
    await controller.reportApplication('123', { message: 'text' }, { sendStatus: spy } as any);
    expect(service.reportApplication).toHaveBeenCalledWith('123', 'text');
    expect(spy).toHaveBeenCalledWith(204);
  });
});
