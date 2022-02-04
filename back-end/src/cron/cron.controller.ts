
import { controller, httpGet } from 'inversify-express-utils';
import { CronGuard } from '../security/cron-guard';
import { AnalyticsService } from '../analytics/analytics.service';
import { NotificationService } from '../notifications/notification.service';

@controller('/cron', CronGuard.isAppEngine())
export class CronController {

  constructor(private analytics: AnalyticsService, private notifications: NotificationService) { }

  @httpGet('/analytics/enterprises')
  public async collectEnterpriseAnalytics() {
    return this.analytics.collectEnterprises();
  }

  @httpGet('/notifications/emails')
  public async sendEmailNotifications() {
    return this.notifications.sendEmails();
  }
}
