import { createMock, mockKey } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { PublicEnterpriseRepository } from './enterprise.repository';
import { EnterpriseCronService } from './enterprise-cron.service';
import { NotificationService } from '../notifications/notification.service';
import { PublicEnterprise } from './enterprise.domain';

describe('EnterpriseCronService', () => {

  let repository: PublicEnterpriseRepository;
  let notifications: NotificationService;
  let service: EnterpriseCronService;
  let originalLog: () => void;

  beforeAll(() => {
    originalLog = console.log;
    spyOn(console, 'log'); // hide logging
  });

  afterAll(() => {
    console.log = originalLog;
  });

  beforeEach(() => {
    repository = createMock(PublicEnterpriseRepository);
    notifications = createMock(NotificationService);
    service = new EnterpriseCronService(repository, notifications);
  });

  it('should notify outdated', async () => {
    jasmine.clock().mockDate(new Date('2022-06-09'));

    const list = [
      mockKey({ owners: ['john'] }, '1'),
      mockKey({ owners: ['peter'] }, '2'),
      mockKey({ owners: ['mary'], outdatedNotificationTs: new Date('2022-06-01') }, '3'),
      mockKey({ owners: ['john', 'mary'] }, '4')
    ] as PublicEnterprise[];
    spyOn(repository, 'findChangedBefore').and.returnValue(Promise.resolve(list));
    spyOn(repository, 'update').and.returnValue(Promise.resolve(''));
    spyOn(notifications, 'add').and.returnValue(Promise.resolve([]));

    const res = await service.nofityOutdated();

    expect(res.notified).toBe(3);
    expect(repository.findChangedBefore).toHaveBeenCalledWith(new Date('2021-06-09'));

    expect(repository.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ outdatedNotificationTs: new Date('2022-06-09') }), '1');
    expect(notifications.add).toHaveBeenCalledWith(jasmine.anything(), 'john');

    expect(repository.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ outdatedNotificationTs: new Date('2022-06-09') }), '2');
    expect(notifications.add).toHaveBeenCalledWith(jasmine.anything(), 'peter');

    expect(repository.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ outdatedNotificationTs: new Date('2022-06-09') }), '4');
    expect(notifications.add).toHaveBeenCalledWith(jasmine.anything(), 'john', 'mary');

    jasmine.clock().uninstall();
  });

});
