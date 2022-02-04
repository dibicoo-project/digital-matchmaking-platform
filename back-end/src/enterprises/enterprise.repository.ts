import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Enterprise, PublicEnterprise } from './enterprise.domain';
import { RepositoryV2 } from '../repository-v2';

@injectable()
export class EnterpriseRepository extends RepositoryV2<Enterprise> {
  constructor(datastore: Datastore) {
    super(datastore, 'enterprise');
    this.excludeFromIndexes = ['referenceProjects', 'companyProfile', 'keyProjects[].description'];
  }

  public async findByOwner(userName: string) {
    const query = this.query.filter('owners', userName);
    return this.find(query);
  }

  public async findPending() {
    const query = this.query.filter('pendingReview', true);
    return this.find(query);
  }
}

@injectable()
export class PublicEnterpriseRepository extends RepositoryV2<PublicEnterprise> {
  constructor(datastore: Datastore) {
    super(datastore, 'public_enterprise');
    this.excludeFromIndexes = ['referenceProjects', 'companyProfile', 'keyProjects[].description'];
  }

  public async findAll() {
    return this.find(this.query);
  }

  public async findByOwner(userName: string) {
    const query = this.query.filter('owners', userName);
    return this.find(query);
  }

  public async findChangedAfter(ts: Date) {
    const query = this.query.filter('changedTs', '>=', ts).select('__key__');
    return this.find(query);
  }

  public async findByProjectCountry(country: string) {
    return this.find(this.query.filter('keyProjects.location.country', country).select('__key__'));
  }

  public async findByCountry(country: string) {
    return this.find(this.query.filter('location.country', country).select('__key__'));
  }

  public async findByCategoryId(categoryId: string) {
    return this.find(this.query.filter('categoryIds', categoryId).select('__key__'));
  }
}
