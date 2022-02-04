import express from 'express';
import { controller, httpGet, requestParam, httpPost, requestBody, response } from 'inversify-express-utils';
import { ApplicationService } from './application.service';

@controller('/applications')
export class ApplicationController {

  constructor(private service: ApplicationService) { }

  @httpGet('')
  public async listApplications() {
    return await this.service.getPublicApplications();
  }

  @httpGet('/:id')
  public async getApplicationDetails(@requestParam('id') id: string) {
    return await this.service.getPublicApplicationDetails(id);
  }

  @httpPost('/:id/report')
  public async reportApplication(@requestParam('id') id: string,
                                 @requestBody() body: any,
                                 @response() res: express.Response) {
    await this.service.reportApplication(id, body.message);
    return res.sendStatus(204);
  }
}
