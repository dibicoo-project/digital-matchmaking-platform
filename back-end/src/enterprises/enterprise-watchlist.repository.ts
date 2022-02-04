import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { EnterpriseWatchList } from './enterprise.domain';
import { RepositoryV2 } from '../repository-v2';

@injectable()
export class EnterpriseWatchlistRepository extends RepositoryV2<EnterpriseWatchList> {
  constructor(datastore: Datastore) {
    super(datastore, 'enterprise_watchlist');    
  }  
}