import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Repository } from '../repository';
import { Article } from './knowledge-base.domain';

@injectable()
export class KnowledgeBaseRepoistory extends Repository<Article> {
  constructor(datastore: Datastore) {
    super(datastore, 'article');
    this.excludeFromIndexes('text');
    this.setDefaultQuery(q => q.order('order'));
  }
}
