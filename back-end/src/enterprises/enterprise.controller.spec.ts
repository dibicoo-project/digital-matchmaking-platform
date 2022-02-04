import { createMock } from './../../test/utils';

import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { EnterpriseShareService } from './enterprise-share.service';

describe('EnterpriseController', () => {

  let controller: EnterpriseController;
  let service: EnterpriseService;
  let shareService: EnterpriseShareService;

  beforeEach(() => {
    service = createMock(EnterpriseService);
    shareService = createMock(EnterpriseShareService);
    controller = new EnterpriseController(service, shareService);
  });

  it('should return public enterprise list', async () => {
    spyOn(service, 'getPublicEnterprises').and.returnValue(Promise.resolve([{}, {}]));

    const list = await controller.listEnterprises();

    expect(list.length).toBe(2);
    expect(service.getPublicEnterprises).toHaveBeenCalled();
  });

  it('should get public enterprise details', async () => {
    spyOn(service, 'getEnterpriseDetails').and.returnValue(Promise.resolve({} as any));
    await controller.getEnterpriseDetails('123');

    expect(service.getEnterpriseDetails).toHaveBeenCalledWith('123');
  });

  it('should get invitation details', async () => {
    spyOn(shareService, 'getInvitation').and.returnValue(Promise.resolve({} as any));
    await controller.getEnterpriseInvitation('123-456');

    expect(shareService.getInvitation).toHaveBeenCalledWith('123-456');
  });

  it('should report enterprise', async () => {
    const spy = jasmine.createSpy();
    spyOn(service, 'reportEnterprise').and.returnValue(Promise.resolve(undefined));
    await controller.reportEnterprise('123', { message: 'text' }, { sendStatus: spy } as any);
    expect(service.reportEnterprise).toHaveBeenCalledWith('123', 'text');
    expect(spy).toHaveBeenCalledWith(204);
  });
});
