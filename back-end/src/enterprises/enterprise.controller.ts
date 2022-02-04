import { EnterpriseService } from './enterprise.service';
import { controller, httpGet, requestParam, queryParam, httpPost, requestBody, response } from 'inversify-express-utils';
import { EnterpriseShareService } from './enterprise-share.service';
import express from 'express';

@controller('/enterprises')
export class EnterpriseController {

  constructor(private service: EnterpriseService, private shareService: EnterpriseShareService) { }

  @httpGet('')
  public async listEnterprises() {
    return await this.service.getPublicEnterprises();
  }

  @httpGet('/:id')
  public async getEnterpriseDetails(@requestParam('id') id: string) {
    return await this.service.getEnterpriseDetails(id);
  }

  @httpGet('/invite/:id')
  public async getEnterpriseInvitation(@requestParam('id') id: string) {
    return await this.shareService.getInvitation(id);
  }

  @httpPost('/:id/report')
  public async reportEnterprise(@requestParam('id') id: string,
                                 @requestBody() body: any,
                                 @response() res: express.Response) {
    await this.service.reportEnterprise(id, body.message);
    return res.sendStatus(204);
  }
}
