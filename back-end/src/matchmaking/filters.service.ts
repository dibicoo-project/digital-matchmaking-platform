import { injectable, unmanaged } from 'inversify';
import { DiBiCooPrincipal } from '../security/principal';
import { isValidEnterpriseFilterBean as isValid } from '../validation/validators';
import { forbidden, notFound, validationErrorFn } from '../utils/common-responses';
import { plainId } from '../utils/transform-datastore-id';
import { ApplicationFiltersRepository, EnterpriseFiltersRepository, FiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersBean, FiltersEntity } from '../matchmaking/matchmaking.domain';
import { EnterpriseMatchmakingService } from './enterprise-matchmaking.service';
import { ApplicationMatchmakingService } from './application-matchmaking.service';

interface MatchmakingService {
  filterObjects(filters: Filters): Promise<any[]>;
}

@injectable()
class FiltersService {
  constructor(private repository: FiltersRepository,
    private matchmaking: MatchmakingService,
    @unmanaged() private resource: string) { }

  private toBean(entity: FiltersEntity): FiltersBean {
    return {
      id: plainId(entity),
      label: entity.label,
      filters: entity.filters,
    };
  }

  public async listFilters(user: DiBiCooPrincipal) {
    const list = await this.repository.findOwn(user.userName);
    return list.map(e => this.toBean(e));
  }

  public async saveFilters(bean: FiltersBean, user: DiBiCooPrincipal) {
    if (!isValid(bean)) {
      return Promise.reject(validationErrorFn(isValid.errors));
    }

    const objectIds = (await this.matchmaking.filterObjects(bean.filters)).map(c => plainId(c));

    const entity: FiltersEntity = {
      ...bean,
      owner: user.userName,
      changedTs: new Date(),
      objectIds
    }

    const id = await this.repository.insert(entity);
    return { ...this.toBean(entity), id };
  }

  public async deleteFilters(id: string, user: DiBiCooPrincipal) {
    const one = await this.repository.findOne(id);
    if (!one) {
      return Promise.reject(notFound);
    }

    const isOwner = await user.isResourceOwner(this.resource, one);
    if (!isOwner) {
      return Promise.reject(forbidden);
    }

    await this.repository.delete(id);
  }
}

@injectable()
export class EnterpriseFiltersService extends FiltersService {
  constructor(repository: EnterpriseFiltersRepository, matchmaking: EnterpriseMatchmakingService) {
    super(repository, matchmaking, 'enterprise_filters');
  }
}

@injectable()
export class ApplicationFiltersService extends FiltersService {
  constructor(repository: ApplicationFiltersRepository, matchmaking: ApplicationMatchmakingService) {
    super(repository, matchmaking, 'application_filters');
  }
}
