import { injectable } from 'inversify';
import { Datastore } from '@google-cloud/datastore';
import { Repository } from '../repository';
import { Category } from './category.domain';

@injectable()
export class CategoryRepository extends Repository<Category> {
  constructor(datastore: Datastore) {
    super(datastore, 'category');
    this.setDefaultQuery(q => q.order('order'));
  }
}
