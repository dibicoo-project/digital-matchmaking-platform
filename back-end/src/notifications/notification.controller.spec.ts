import { DiBiCooPrincipal } from '../security/principal';
import { createMock } from './../../test/utils';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {

  let controller: NotificationController;
  let service: NotificationService;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john'
    } as DiBiCooPrincipal;
    service = createMock(NotificationService);
    controller = new NotificationController(service);
  });

  it('should return notification list', async () => {
    spyOn(service, 'getList').and.returnValue(Promise.resolve([{}, {}]));

    const list = await controller.getNotifications(user);

    expect(list.length).toBe(2);
    expect(service.getList).toHaveBeenCalled();
  });

  it('should mark notification as read', async () => {
    spyOn(service, 'markAsRead').and.returnValue(Promise.resolve({} as any));
    await controller.markAsRead(user, '123', { isRead: true });

    expect(service.markAsRead).toHaveBeenCalledWith(user, '123', true);
  });

  it('should delete notification', async () => {
    spyOn(service, 'delete').and.returnValue(Promise.resolve());
    const spy = jasmine.createSpy();

    await controller.delete(user, '123', { sendStatus: spy } as any);

    expect(service.delete).toHaveBeenCalledWith(user, '123');
    expect(spy).toHaveBeenCalledWith(204);
  });

  it('should mark all notifications as read', async () => {
    spyOn(service, 'markAllAsRead').and.returnValue(Promise.resolve({} as any));
    await controller.markAllAsRead(user, { isRead: true });

    expect(service.markAllAsRead).toHaveBeenCalledWith(user, true);
  });

  it('should get settings', async () => {
    spyOn(service, 'getSettings').and.returnValue(Promise.resolve({} as any));
    await controller.getSettings(user);

    expect(service.getSettings).toHaveBeenCalledWith(user);
  });

  it('should save settings', async () => {
    spyOn(service, 'saveSettings');
    await controller.saveSettings({ enabled: true } as any, user);

    expect(service.saveSettings).toHaveBeenCalledWith(jasmine.anything(), user);
  });
});
