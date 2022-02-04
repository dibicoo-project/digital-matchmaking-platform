import { controller, httpGet, principal, httpPut, requestParam, requestBody, httpPatch, response } from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { ApplicationService } from './application.service';
import { ApplicationAdminChangeBean, ApplicationChangeBean } from './application.domain';
import express from 'express';

@controller('/admin/applications', AuthGuard.isInRole('admin'))
export class AdminApplicationController {

  constructor(private service: ApplicationService) { }

  @httpGet('')
  public async listAdminApplications(@principal() user: DiBiCooPrincipal) {
    return await this.service.getAdminApplications(user);
  }

  @httpGet('/:id')
  public async getAdminApplication(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.service.getAdminApplication(id, user);
  }

  @httpPatch('/:id')
  public async changeApplicationStatus(
    @requestParam('id') id: string,
    @requestBody() bean: ApplicationAdminChangeBean,
    @principal() user: DiBiCooPrincipal,
    @response() res: express.Response
  ) {
    await this.service.changeAdminApplicationStatus(id, bean, user);
    return res.sendStatus(204);
  }
}
