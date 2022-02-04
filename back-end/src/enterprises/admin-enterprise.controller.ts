import { EnterpriseService } from './enterprise.service';
import { controller, httpGet, requestParam, httpPut, principal, requestBody, httpPatch } from 'inversify-express-utils';
import { AuthGuard } from '../security/auth-guard';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseAdminChangeBean, EnterpriseBean } from './enterprise.domain';

@controller('/admin/enterprises', AuthGuard.isInRole('admin'))
export class AdminEnterpriseController {

  constructor(private service: EnterpriseService) { }

  @httpGet('')
  public async allEnterprises(@principal() user: DiBiCooPrincipal) {
    return await this.service.getAdminEnterprises(user);
  }

  @httpGet('/:id')
  public async getAdminEnterprise(@requestParam('id') id: string, @principal() user: DiBiCooPrincipal) {
    return await this.service.getAdminEnterpriseDetails(id, user);
  }

  @httpPatch('/:id')
  public async changeEnterpriseStatus(@requestParam('id') id: string,
                                      @requestBody() bean: EnterpriseAdminChangeBean,
                                      @principal() user: DiBiCooPrincipal) {
    return await this.service.changeAdminEnterpriseStatus(id, bean, user);
  }
}
