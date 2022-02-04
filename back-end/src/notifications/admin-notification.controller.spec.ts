import { DiBiCooPrincipal } from '../security/principal';
import { createMock } from './../../test/utils';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationService } from './notification.service';

describe('AdminNotificationController', () => {

  let controller: AdminNotificationController;
  let service: NotificationService;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john'
    } as DiBiCooPrincipal;
    service = createMock(NotificationService);
    controller = new AdminNotificationController(service);
  });

  it('should send admin notification', async () => {
    spyOn(service, 'sendAdminNotification');
    const bean = {} as any;
    const spy = jasmine.createSpy();
    await controller.sendAdminNotifications(bean, user, { sendStatus: spy } as any);
    expect(service.sendAdminNotification).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(204);
  });
});
