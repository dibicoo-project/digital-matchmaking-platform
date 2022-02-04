import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Repository } from '../repository';
import { EnterpriseStatistics } from './analytics.domain';
import moment from 'moment';


@injectable()
export class AnalyticsRepository extends Repository<EnterpriseStatistics> {
  constructor(datastore: Datastore) {
    super(datastore, 'analytics');
    this.setDefaultQuery(q => q.filter('updatedTs', '>', moment().subtract(1, 'day').toISOString()))
  }

  public async upsert(id: string, data: EnterpriseStatistics) {
    const key = this.getKey(id);
    await this.datastore.upsert({ key, data });
  }  
}
