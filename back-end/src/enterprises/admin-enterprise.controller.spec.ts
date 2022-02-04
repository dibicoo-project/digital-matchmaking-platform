import { createMock } from './../../test/utils';

import { AdminEnterpriseController } from './admin-enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseAdminChangeBean } from './enterprise.domain';

describe('AdminEnterpriseController', () => {

  let controller: AdminEnterpriseController;
  let service: EnterpriseService;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    service = createMock(EnterpriseService);
    controller = new AdminEnterpriseController(service);
    user = new DiBiCooPrincipal({ sub: 'tester' });
  });

  it('should return enterprise list', async () => {
    spyOn(service, 'getAdminEnterprises').and.returnValue(Promise.resolve({ pending: [{}, {}], published: [{}] } as any));

    const res = await controller.allEnterprises(user);

    expect(res.pending.length).toBe(2);
    expect(res.published.length).toBe(1);
    expect(service.getAdminEnterprises).toHaveBeenCalled();
  });

  it('should return enterprise details', async () => {
    spyOn(service, 'getAdminEnterpriseDetails').and.returnValue(Promise.resolve({ pending: {}, published: {} } as any));

    const res = await controller.getAdminEnterprise('123', user);

    expect(service.getAdminEnterpriseDetails).toHaveBeenCalled();
  });

  it('should change enterprise status', async () => {
    spyOn(service, 'changeAdminEnterpriseStatus').and.returnValue(Promise.resolve({} as any));
    const bean: EnterpriseAdminChangeBean = { action: 'publish' };
    await controller.changeEnterpriseStatus('123', bean, user);

    expect(service.changeAdminEnterpriseStatus).toHaveBeenCalledWith('123', bean, user);
  });
});
