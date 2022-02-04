import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Invitation } from './enterprise.domain';
import { Repository } from '../repository';
import { v4 as uuid } from 'uuid';

@injectable()
export class InvitationRepository extends Repository<Invitation> {
  constructor(datastore: Datastore) {
    super(datastore, 'invitation');
    this.setDefaultQuery(q => q.order('createdTs'));
  }

  public async insert(data: Invitation) {
    const key = this.getKey(uuid());
    await this.datastore.insert({ key, data });
    return key.name;
  }
}
