import { createMock } from './../../test/utils';
import { AnalyticsService } from '../analytics/analytics.service';
import { CronController } from './cron.controller';
import { NotificationService } from '../notifications/notification.service';
import { EnterpriseCronService } from '../enterprises/enterprise-cron.service';

describe('CronController', () => {

  let controller: CronController;
  let analytics: AnalyticsService;
  let notifications: NotificationService;  
  let companies: EnterpriseCronService;

  beforeEach(() => {
    analytics = createMock(AnalyticsService);
    notifications = createMock(NotificationService);
    companies = createMock(EnterpriseCronService);

    controller = new CronController(analytics, notifications, companies);
  });

  it('should collect enterprise analytics', async () => {
    spyOn(analytics, 'collectEnterprises').and.returnValue(Promise.resolve('Ok'));

    const res = await controller.collectEnterpriseAnalytics();

    expect(res).toBe('Ok');
    expect(analytics.collectEnterprises).toHaveBeenCalled();
  });

  it('should send e-mail notifications', async () => {
    spyOn(notifications, 'sendEmails').and.returnValue(Promise.resolve('Ok'));

    const res = await controller.sendEmailNotifications();

    expect(res).toBe('Ok');
    expect(notifications.sendEmails).toHaveBeenCalled();
  });

  it('should notify outdated companies', async () => {
    spyOn(companies, 'nofityOutdated').and.returnValue(Promise.resolve({} as any));
    await controller.notifyOutdatedCompanies();
    expect(companies.nofityOutdated).toHaveBeenCalled();
  });

});
