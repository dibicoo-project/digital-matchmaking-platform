import { injectable, unmanaged } from 'inversify';
import { Datastore, Query } from '@google-cloud/datastore';

@injectable()
export abstract class RepositoryV2<T> {

  constructor(protected datastore: Datastore, @unmanaged() protected kindName: string) { }

  protected excludeFromIndexes: Array<keyof T | string> = [];

  protected get query() {
    return this.datastore.createQuery(this.kindName);
  }

  protected getKey(id?: string) {
    const params: any[] = [this.kindName];
    if (!!id) {
      const key = this.datastore.int(id);
      if (key.toString() !== 'NaN') { 
        // regular (integer) ID
        params.push(key);
      } else { 
        // named (string) ID
        params.push(id);
      }
    }
    return this.datastore.key(params);
  }

  protected async find(query: Query): Promise<T[]> {
    const [data] = await this.datastore.runQuery(query);
    return data;
  }

  public async findOne(id: string): Promise<T | undefined> {
    const [one] = await this.datastore.get(this.getKey(id));
    return one;
  }  

  public async insert(data: T): Promise<string> {    
    const key = this.getKey();
    await this.datastore.insert({ key, data, excludeFromIndexes: this.excludeFromIndexes });
    return key.id!;  
  }

  public async update(data: T, id: string): Promise<string> {    
    const key = this.getKey(id);
    await this.datastore.update({ key, data, excludeFromIndexes: this.excludeFromIndexes });
    return key.id!;  
  }

  public async upsert(data: T, id: string): Promise<string> {    
    const key = this.getKey(id);
    await this.datastore.upsert({ key, data, excludeFromIndexes: this.excludeFromIndexes });
    return key.id!;  
  }

  public async delete(...ids: string[]): Promise<void> {
    await this.datastore.delete(ids.map((i) => this.getKey(i)));
  }

  public async exists(id: string) {
    const query = this.query.filter('__key__', this.getKey(id)).select('__key__')
    const res = await this.find(query);
    return !!(res && res[0]);
  }
}
