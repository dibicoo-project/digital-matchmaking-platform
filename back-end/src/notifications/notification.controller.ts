import {
  controller, httpGet, requestParam, requestBody, principal, httpPatch, httpPost, httpPut
} from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { NotificationService } from './notification.service';
import { NotificationSettings } from './notification.domain';

@controller('/user/notifications', AuthGuard.isAuthenticated())
export class NotificationController {

  constructor(private service: NotificationService) { }

  @httpGet('')
  public async getNotifications(@principal() user: DiBiCooPrincipal) {
    return await this.service.getList(user);
  }

  @httpPatch('')
  public async markAllAsRead(@principal() user: DiBiCooPrincipal, @requestBody() { isRead }: any) {
    return await this.service.markAllAsRead(user, isRead);
  }

  @httpGet('/settings')
  public async getSettings(@principal() user: DiBiCooPrincipal) {
    return await this.service.getSettings(user);
  }

  @httpPut('/settings')
  public async saveSettings(@requestBody() bean: NotificationSettings, @principal() user: DiBiCooPrincipal) {
    return await this.service.saveSettings(bean, user);
  }

  @httpPatch('/:id')
  public async markAsRead(@principal() user: DiBiCooPrincipal,
                          @requestParam('id') id: string,
                          @requestBody() { isRead }: any) {
    return await this.service.markAsRead(user, id, isRead);
  }

  @httpPost('/testAll', AuthGuard.isInRole('admin'))
  public async testAll(@principal() user: DiBiCooPrincipal) {
    return await this.service.testAll(user);
  }
}
