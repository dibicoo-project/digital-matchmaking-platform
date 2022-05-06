import { createMock, mockKey } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { NotificationRepository, NotificationSettingsRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { Notification, NotificationSettings } from './notification.domain';
import { EmailService } from '../emails/email.service';
import { Auth0UsersService } from '../auth0-users/auth0-users.service';
import moment from 'moment';

describe('EnterpriseService', () => {

  let repository: NotificationRepository;
  let settingsRepository: NotificationSettingsRepository;
  let emailService: EmailService;
  let service: NotificationService;
  let auth0: Auth0UsersService;

  let user: DiBiCooPrincipal;
  let data: Notification;

  beforeEach(() => {
    data = {
      title: 'Testing',
      body: 'Lorem ipsum'
    } as any;

    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true),
      isInRole: () => Promise.resolve(false)
    } as any;

    repository = createMock(NotificationRepository);
    settingsRepository = createMock(NotificationSettingsRepository);
    emailService = createMock(EmailService);
    auth0 = createMock(Auth0UsersService);
    service = new NotificationService(repository, settingsRepository, emailService, auth0);
  });

  it('should add notification', async () => {
    spyOn(repository, 'save').and.returnValue(Promise.resolve('123'));
    await service.add(data, 'john', 'peter', 'ann');

    expect(repository.save).toHaveBeenCalledTimes(3);
  });

  it('should get user notifications', async () => {
    spyOn(repository, 'findByUser').and.returnValue(Promise.resolve([data, data]));
    const list = await service.getList(user);

    expect(list.length).toBe(2);
    expect(list[0].title).toEqual('Testing');
    expect(repository.findByUser).toHaveBeenCalledWith('john');
  });

  it('should create first login notification', async () => {
    spyOn(repository, 'findByUser').and.returnValue(Promise.resolve([]));
    spyOn(repository, 'save').and.returnValue(Promise.resolve('123'));
    const list = await service.getList(user);

    expect(list.length).toBe(1);
    expect(list[0].title).toMatch(/^Welcome to/);
    expect(list[0].id).toEqual('123');
    expect(repository.findByUser).toHaveBeenCalledWith('john');
    expect(repository.save).toHaveBeenCalledWith(jasmine.anything(), 'john');
  });

  it('should mark notification as read', async () => {
    spyOn(repository, 'findOneByUser').and.returnValue(Promise.resolve({ ...data }));
    spyOn(repository, 'save').and.returnValue(Promise.resolve('123'));

    const res = await service.markAsRead(user, '123', true);

    expect(res.isRead).toBeTrue();
    expect(repository.findOneByUser).toHaveBeenCalledWith('john', '123');
    expect(repository.save).toHaveBeenCalledWith({ ...data, isRead: true }, 'john', '123');
  });

  it('should mark all notifications as read', async () => {
    spyOn(repository, 'findByUser').and.returnValue(
      Promise.resolve([
        { ...data, title: 'one', isRead: true },
        { ...data, title: 'two' }
      ])
    );
    spyOn(repository, 'saveMulti').and.returnValue(Promise.resolve());

    await service.markAllAsRead(user, true);

    expect(repository.findByUser).toHaveBeenCalledWith('john');
    expect(repository.saveMulti).toHaveBeenCalledWith([{ ...data, title: 'two', isRead: true }]);
  });

  it('should delete notification', async () => {
    spyOn(repository, 'findOneByUser').and.returnValue(Promise.resolve({ ...data }));
    spyOn(repository, 'delete').and.returnValue(Promise.resolve());

    await service.delete(user, '123');

    expect(repository.findOneByUser).toHaveBeenCalledWith('john', '123');
    expect(repository.delete).toHaveBeenCalledWith('john', '123');
  });

  it('should save settings', async () => {
    spyOn(settingsRepository, 'findOne').and.returnValue(Promise.resolve(undefined));
    spyOn(settingsRepository, 'upsert');

    await service.saveSettings({ enabled: true, email: 'test@test' } as any, user);

    expect(settingsRepository.findOne).toHaveBeenCalledWith('john');
    expect(settingsRepository.upsert).toHaveBeenCalledWith(jasmine.anything(), 'john');
  });

  it('should get settings', async () => {
    spyOn(settingsRepository, 'findOne').and.returnValue(Promise.resolve(undefined));

    const res = await service.getSettings(user);

    expect(settingsRepository.findOne).toHaveBeenCalledWith('john');
    expect(res).toEqual({ enabled: undefined, email: undefined });
  });

  it('should send admin notification to all users', async () => {
    spyOn(repository, 'save');
    spyOn(auth0, 'getUsers').and.returnValue(
      Promise.resolve([{ user_id: 'u1' }, { user_id: 'u2' }] as any)
    );
    const bean = {
      title: 'test',
      body: 'lorem ipsum',
      links: [{ label: 'one', url: 'http://example.com' }]
    };
    await service.sendAdminNotification(bean, user);
    expect(auth0.getUsers).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(repository.save).toHaveBeenCalledWith(jasmine.anything(), 'u1');
    expect(repository.save).toHaveBeenCalledWith(jasmine.anything(), 'u2');
  })

  describe('email notifications', () => {
    it('should send to enabled users', async () => {
      spyOn(settingsRepository, 'findEnabled').and.returnValue(
        Promise.resolve([
          mockKey({ email: 'a@test', lastEmailTs: moment().subtract(15, 'days') }, 'userA'),
          mockKey({ email: 'b@test', lastEmailTs: moment().subtract(2, 'days') }, 'userB'),
          mockKey({ email: 'c@test', lastEmailTs: moment().subtract(8, 'days') }, 'userC'),
          mockKey({ email: 'd@test', lastEmailTs: moment().subtract(9, 'days') }, 'userD'),
        ])
      );

      spyOn(settingsRepository, 'update');

      spyOn(repository, 'countUnreadByUser').and.returnValues(
        Promise.resolve(3),
        Promise.resolve(0),
        Promise.resolve(5),
      );

      spyOn(emailService, 'sendMany').and.returnValue(Promise.resolve(['userA']));

      const result = await service.sendEmails();

      expect(settingsRepository.findEnabled).toHaveBeenCalled();
      expect(repository.countUnreadByUser).toHaveBeenCalledWith('userA');
      expect(repository.countUnreadByUser).toHaveBeenCalledWith('userC');
      expect(repository.countUnreadByUser).toHaveBeenCalledWith('userD');
      expect(emailService.sendMany).toHaveBeenCalledWith([
        { id: 'userA', email: 'a@test', count: 3 },
        { id: 'userD', email: 'd@test', count: 5 }
      ]);
      expect(settingsRepository.update).toHaveBeenCalledWith(jasmine.anything(), 'userA');
      expect(result).toEqual({ sent: 1 });
    });

    it('should ignore if none of users enabled', async () => {
      spyOn(settingsRepository, 'findEnabled').and.returnValue(
        Promise.resolve([])
      );
      spyOn(emailService, 'sendMany');

      await service.sendEmails();

      expect(emailService.sendMany).not.toHaveBeenCalled();
    });

    it('should ignore if none of users have unread notifications', async () => {
      spyOn(settingsRepository, 'findEnabled').and.returnValue(
        Promise.resolve([
          mockKey({ email: 'a@test', lastEmailTs: moment().subtract(15, 'days') }, 'userA')
        ])
      );
      spyOn(repository, 'countUnreadByUser').and.returnValue(Promise.resolve(0));
      spyOn(emailService, 'sendMany');

      await service.sendEmails();

      expect(emailService.sendMany).not.toHaveBeenCalled();
    });
  });
});
