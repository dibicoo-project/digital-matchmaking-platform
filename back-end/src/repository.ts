import { injectable, unmanaged } from 'inversify';
import { Datastore, Query } from '@google-cloud/datastore';

@injectable()
export abstract class Repository<T> {

  constructor(protected datastore: Datastore, @unmanaged() protected kindName: string) { }

  private defaultQuery = (q: Query) => q;
  protected excluded: Array<keyof T | string> = [];

  protected excludeFromIndexes(...excl: Array<keyof T | string>) {
    this.excluded = excl;
  }

  protected setDefaultQuery(cb: (q: Query) => Query) {
    this.defaultQuery = cb;
  }

  private getQuery() {
    return this.defaultQuery(this.datastore.createQuery(this.kindName));
  }

  protected getKey(id?: string) {
    const params: any[] = [this.kindName];
    if (!!id) {
      const key = this.datastore.int(id);
      if (key.toString() !== 'NaN') { // regular integer ID
        params.push(key);
      } else { // named (string) ID
        params.push(id);
      }
    }
    return this.datastore.key(params);
  }

  /**
   * @deprecated refactor to use dedicated methods for each query (to avoid exposing Datastore internals) 
   */
  public async find(filter = (q: Query) => q): Promise<T[]> {
    const query = filter(this.getQuery());
    const [data] = await this.datastore.runQuery(query);
    return data;
  }

  public async findAll(): Promise<T[]> {
    const query = this.getQuery();
    const [data] = await this.datastore.runQuery(query);
    return data;
  }

  public async findOne(id: string): Promise<T | undefined> {
    const [one] = await this.datastore.get(this.getKey(id));
    return one;
  }

  public async findMany(ids: string[]): Promise<T[] | undefined> {    
    const [list] = await this.datastore.get(ids.map(i => this.getKey(i)));
    return list;
  }

  // TODO: save object with KEY
  public async save(data: T, id?: string): Promise<string> {
    const method = !!id ? 'update' : 'insert';
    const key = this.getKey(id);
    await this.datastore.save({ key, data, method, excludeFromIndexes: this.excluded });
    return key.id!;
  }

  // TODO: delete object with key
  public async delete(id: string | string[]): Promise<void> {
    const ids = (id instanceof Array) ? id : [id];
    await this.datastore.delete(ids.map((i) => this.getKey(i)));
  }
}
