import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { RepositoryV2 } from '../repository-v2';
import { FiltersEntity } from './matchmaking.domain';

export class FiltersRepository extends RepositoryV2<FiltersEntity> {
  constructor(datastore: Datastore, collection: string) {
    super(datastore, collection);
  }

  public async findOwn(owner: string) {
    return await this.find(this.query.filter('owner', owner));
  }

  public async findAll() {
    return this.find(this.query);
  }
}

@injectable()
export class EnterpriseFiltersRepository extends FiltersRepository {
  constructor(datastore: Datastore) {
    super(datastore, 'enterprise_filters');
  }
}

@injectable()
export class ApplicationFiltersRepository extends FiltersRepository {
  constructor(datastore: Datastore) {
    super(datastore, 'application_filters');
  }
}

