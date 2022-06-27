import { injectable } from 'inversify';
import moment from 'moment';
import { companyProfileOutdated } from '../notifications/notification.templates';
import { NotificationService } from '../notifications/notification.service';
import { PublicEnterpriseRepository } from './enterprise.repository';
import { plainId } from '../utils/transform-datastore-id';

@injectable()
export class EnterpriseCronService {

  constructor(private repository: PublicEnterpriseRepository, private notifications: NotificationService) { }

  public async nofityOutdated() {
    const ts = moment().subtract(1, 'year').toDate();
    const list = await this.repository.findChangedBefore(ts);

    const tasks = list.filter(c => c.outdatedNotificationTs == undefined)
      .map(async (c) => {
        const id = plainId(c);
        await this.notifications.add(
          companyProfileOutdated(id, c.companyName),
          ...c.owners
        );
        c.outdatedNotificationTs = new Date();
        await this.repository.update(c, id);
      });

    await Promise.all(tasks);

    console.log(`Notified ${tasks.length} outdated companies`);
    return { status: 'ok', notified: tasks.length };
  }
}
