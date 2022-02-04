import express from 'express';

import {
  controller, httpGet, requestParam, httpPost, httpPut, httpDelete,
  requestBody, principal, response, httpPatch
} from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { ApplicationService } from './application.service';
import { ApplicationBean, ApplicationChangeBean } from './application.domain';
import { ApplicationFiltersService } from '../matchmaking/filters.service';
import { FiltersBean } from '../matchmaking/matchmaking.domain';

@controller('/user/applications', AuthGuard.isAuthenticated())
export class UserApplicationController {

  constructor(private service: ApplicationService, private filtersService: ApplicationFiltersService) { }

  @httpPost('/matchmaking')
  public async saveMatchmaking(@requestBody() bean: FiltersBean, @principal() user: DiBiCooPrincipal) {
    return await this.filtersService.saveFilters(bean, user);
  }

  @httpGet('/matchmaking')
  public async getSavedMatchmaking(@principal() user: DiBiCooPrincipal) {
    return await this.filtersService.listFilters(user);
  }

  @httpDelete('/matchmaking/:id')
  public async deleteMatchmaking(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.filtersService.deleteFilters(id, user);
    return res.sendStatus(204);
  }

  @httpGet('')
  public async listUserApplications(@principal() user: DiBiCooPrincipal) {
    return await this.service.getUserApplications(user);
  }

  @httpGet('/:id')
  public async getApplicationDetails(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.service.getUserApplicationDetails(id, user);
  }

  @httpPost('')
  public async createApplication(@requestBody() bean: ApplicationBean, @principal() user: DiBiCooPrincipal) {
    return await this.service.addApplication(bean, user);
  }

  @httpPut('/:id')
  public async editApplication(
    @requestParam('id') id: string,
    @requestBody() bean: ApplicationBean,
    @principal() user: DiBiCooPrincipal
  ) {
    return await this.service.editApplication(id, bean, user);
  }

  @httpPatch('/:id')
  public async changeApplicationStatus(
    @requestParam('id') id: string,
    @requestBody() bean: ApplicationChangeBean,
    @principal() user: DiBiCooPrincipal,
    @response() res: express.Response
  ) {
    await this.service.changeApplicationStatus(id, bean, user);
    return res.sendStatus(204);
  }

  @httpDelete('/:id')
  public async deleteApplication(
    @requestParam('id') id: string,
    @principal() user: DiBiCooPrincipal,
    @response() res: express.Response
  ) {
    await this.service.deleteApplication(id, user);
    return res.sendStatus(204);
  }
}
