import express from 'express';

import { EnterpriseService } from './enterprise.service';
import {
  controller, httpGet, requestParam, httpPost, httpPut, httpDelete,
  request, requestBody, principal, response, httpPatch
} from 'inversify-express-utils';
import { EnterpriseBean, EnterpriseChangeBean } from './enterprise.domain';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { multerFile } from '../utils/multer';
import { EnterpriseShareService } from './enterprise-share.service';
import { ContactMessage } from '../common/common.domain';
import { EnterpriseWatchlistService } from './enterprise-watchlist.service';
import { FiltersBean } from '../matchmaking/matchmaking.domain';
import { EnterpriseFiltersService } from '../matchmaking/filters.service';

@controller('/user/enterprises', AuthGuard.isAuthenticated())
export class UserEnterpriseController {

  constructor(private service: EnterpriseService,
    private shareService: EnterpriseShareService,
    private filtersService: EnterpriseFiltersService,    
    private watchlistService: EnterpriseWatchlistService) { }

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

  @httpGet('/watchlist')
  public async getWatchlist(@principal() user: DiBiCooPrincipal) {
    return await this.watchlistService.getList(user);
  }

  @httpPut('/watchlist')
  public async updateWatchlist(@requestBody() list: string[], @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.watchlistService.setList(list, user);
    return res.sendStatus(204);
  }

  @httpGet('')
  public async listUserEnterprises(@principal() user: DiBiCooPrincipal) {
    return await this.service.getUserEnterprises(user);
  }

  @httpGet('/:id')
  public async getEnterpriseDetails(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.service.getUserEnterpriseDetails(id, user);
  }

  @httpPost('')
  public async createEnterprice(@requestBody() bean: EnterpriseBean, @principal() user: DiBiCooPrincipal) {
    return await this.service.addEnterprise(bean, user);
  }

  @httpPut('/:id')
  public async editEnterprice(@requestParam('id') id: string, @requestBody() bean: EnterpriseBean, @principal() user: DiBiCooPrincipal) {
    return await this.service.editEnterprise(id, bean, user);
  }

  @httpPatch('/:id')
  public async changeEnterpriseStatus(@requestParam('id') id: string, @requestBody() bean: EnterpriseChangeBean,
    @principal() user: DiBiCooPrincipal, @response() res: express.Response
  ) {
    await this.service.changeEnterpriseStatus(id, bean, user);
    return res.sendStatus(204);
  }

  @httpDelete('/:id')
  public async deteleEnterprice(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.service.deleteEnterprise(id, user);
    return res.sendStatus(204);
  }

  @httpPost('/:id/logo', multerFile('logo'))
  public async saveLogo(@requestParam('id') id: string, @request() req: express.Request, @principal() user: DiBiCooPrincipal) {
    return await this.service.uploadImage(id, req.file, user);
  }

  @httpDelete('/:id/logo')
  public async deteleLogo(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.service.deleteEnterpriseLogo(id, user);
    return res.sendStatus(204);
  }

  @httpGet('/:id/share')
  public async getSharingDetails(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.shareService.getSharingDetails(id, user);
  }

  @httpPost('/:id/share')
  public async addShare(@requestParam('id') id: string, @requestBody() body: { name: string }, @principal() user: DiBiCooPrincipal) {
    return await this.shareService.addShare(id, body.name, user);
  }

  @httpDelete('/:id/share')
  public async removeShare(@requestParam('id') id: string, @requestBody() bean: unknown,
    @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.shareService.removeShare(id, bean, user);
    return res.sendStatus(204);
  }

  @httpPost('/invite/:id')
  public async acceptInvitation(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.shareService.acceptInvitation(id, user);
  }

  @httpGet('/:id/statistics')
  public async getEnterpriseStatistics(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return this.service.getEnterpriseStatistics(id, user);
  }

  @httpPost('/:id/message')
  public async sendMessage(@requestParam('id') id: string, @requestBody() bean: ContactMessage,
    @principal() user: DiBiCooPrincipal, @response() res: express.Response) {
    await this.service.sendMessage(id, bean, user);
    return res.sendStatus(204);
  }

}
