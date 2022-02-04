import {
  controller, requestBody, principal, httpPost, response
} from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { NotificationService } from './notification.service';
import express from 'express';
import { NotificationBean } from './notification.domain';

@controller('/admin/notifications', AuthGuard.isInRole('admin'))
export class AdminNotificationController {

  constructor(private service: NotificationService) { }

  @httpPost('')
  public async sendAdminNotifications(@requestBody() bean: NotificationBean, @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.service.sendAdminNotification(bean, user);
    return res.sendStatus(204);
  }
}
