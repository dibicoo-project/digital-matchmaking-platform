import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Application, PublicApplication } from './application.domain';
import moment from 'moment';
import { RepositoryV2 } from '../repository-v2';
import { FiltersEntity } from '../matchmaking/matchmaking.domain';

@injectable()
export class ApplicationRepository extends RepositoryV2<Application> {

  constructor(datastore: Datastore) {
    super(datastore, 'application');
    this.excludeFromIndexes = ['description', 'details.*'];
  }

  public async findPending() {
    const query = this.query.filter('pendingReview', true);
    return this.find(query);
  }

  public async findByOwner(userName: string) {
    const query = this.query.filter('owners', userName);
    return this.find(query);
  }
}

@injectable()
export class PublicApplicationRepository extends RepositoryV2<PublicApplication> {

  constructor(datastore: Datastore) {
    super(datastore, 'public_application');
    this.excludeFromIndexes = ['description', 'details.*'];
  }

  public async findAll() {
    const query = this.query.filter('dueDate', '>=', moment().toISOString());
    return this.find(query);
  }

  public async findByOwner(userName: any) {
    const query = this.query.filter('owners', userName);
    return this.find(query);
  }
}
