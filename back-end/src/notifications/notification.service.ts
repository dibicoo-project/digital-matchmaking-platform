import { injectable } from 'inversify';
import { DiBiCooPrincipal } from '../security/principal';
import { Notification, NotificationBean, NotificationSettings } from './notification.domain';
import { firstLogin } from './notification.templates';
import { NotificationRepository, NotificationSettingsRepository } from './notification.repository';
import { badRequest, badRequestFn, notFound, validationErrorFn } from '../utils/common-responses';
import { plainId } from '../utils/transform-datastore-id';
import * as templates from './notification.templates';
import moment from 'moment';
import { EmailService } from '../emails/email.service';
import { Auth0UsersService } from '../auth0-users/auth0-users.service';

import { isValidNotificationBean as isValid } from '../validation/validators';

@injectable()
export class NotificationService {
  
  constructor(
    private repository: NotificationRepository,
    private settingsRepository: NotificationSettingsRepository,
    private emailService: EmailService,
    private auth0: Auth0UsersService) { }

  private toBean(item: Notification): NotificationBean {
    const id: string = plainId(item);
    return {
      id,
      title: item.title,
      body: item.body,
      icon: item.icon,
      isRead: item.isRead,
      ts: item.ts,
      links: item.links
    };
  }

  public async testAll(user: DiBiCooPrincipal) {
    await Promise.all(
      // [
      //   [() => null, templates.companyProfileRejected],
      //   [() => null, templates.companyProfileUnpublished],
      //   [() => null, templates.applicationRejected],
      //   [() => null, templates.applicationUnpublished]
      // ]
      Object.entries(templates)
        .map(([_, fn]) => {
          const args = Array(fn.length).fill(1).map(_ => (Math.random() * 1000000).toString(36));
          const entity = fn.apply(null, args);
          return this.add(entity, user.userName);
        })
    );
  }

  public async add(entity: Notification, ...users: string[]) {
    return Promise.all(
      users.map(one => {
        this.repository.save(entity, one);
      })
    );
  }

  public async getList(user: DiBiCooPrincipal) {
    const list = await this.repository.findByUser(user.userName);
    if (list.length === 0) {
      const newItem = firstLogin();
      const id = await this.repository.save(newItem, user.userName);

      return [{ ...this.toBean(newItem), id }];
    }

    return list.map(one => this.toBean(one));
  }

  public async markAllAsRead(user: DiBiCooPrincipal, isRead: any) {
    const list = await this.repository.findByUser(user.userName);
    const entities = list.filter(one => one.isRead !== isRead)
      .map(one => ({ ...one, isRead }));

    if (entities.length > 0) {
      await this.repository.saveMulti(entities);
    }

    return Promise.resolve({ updated: true });
  }

  public async markAsRead(user: DiBiCooPrincipal, id: string, isRead: boolean = true) {
    const one = await this.repository.findOneByUser(user.userName, id);

    if (!one) {
      return Promise.reject(notFound);
    }

    one.isRead = isRead;
    this.repository.save(one, user.userName, id);

    return this.toBean(one);
  }

  public async delete(user: DiBiCooPrincipal, id: string): Promise<void> {
    const one = await this.repository.findOneByUser(user.userName, id);
    if (!one) {
      return Promise.reject(notFound);
    }

    await this.repository.delete(user.userName, id);    
  }

  public async saveSettings(bean: NotificationSettings, user: DiBiCooPrincipal) {
    if (bean.enabled && !bean.email) {
      return Promise.reject(badRequest);
    }

    const entity = await this.settingsRepository.findOne(user.userName);

    const newEntity = {
      ...entity,
      enabled: bean.enabled,
      email: bean.email,
      lastEmailTs: new Date()
    }

    await this.settingsRepository.upsert(newEntity, user.userName);
  }

  public async getSettings(user: DiBiCooPrincipal): Promise<Partial<NotificationSettings>> {
    const entity = await this.settingsRepository.findOne(user.userName);
    return { enabled: entity?.enabled, email: entity?.email };
  }

  public async sendEmails(): Promise<any> {
    const allEnabledUsers = await this.settingsRepository.findEnabled();
    const users = allEnabledUsers.filter(one =>
      moment().subtract(1, 'week').isAfter(one.lastEmailTs)
    );

    const allEmails = await Promise.all(
      users.map(async one => {
        const userName = plainId(one);
        const count = await this.repository.countUnreadByUser(userName);

        return { ...one, count };
      })
    );

    const validEmails = allEmails.filter(one => one.count > 0);

    if (validEmails.length === 0) {
      return { status: 'Nothing to sent' };
    }

    const result = await this.emailService.sendMany(
      validEmails.map(one => ({ id: plainId(one), email: one.email!, count: one.count }))
    );

    const lastTsUpdates = result.map(async id => {
      const user = users.find(u => plainId(u) === id);
      if (!user) {
        throw new Error('User not found for update, while previously it was available for sending email');
      }

      user.lastEmailTs = new Date();
      await this.settingsRepository.update(user, id);
    });

    await Promise.all(lastTsUpdates);

    return { sent: result.length };
  }

  public async sendAdminNotification(bean: NotificationBean, user: DiBiCooPrincipal) {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid));
    }

    const allUsers = await this.auth0.getUsers();
    await this.add(
      templates.adminNotification(bean.title!, bean.body!, bean.links || []),
      ...allUsers.map(u => u.user_id)
    );
  }
}
