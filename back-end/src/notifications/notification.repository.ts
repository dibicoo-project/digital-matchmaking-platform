import { Datastore, PathType } from '@google-cloud/datastore';
import { injectable } from 'inversify';
import { RepositoryV2 } from '../repository-v2';
import { Repository } from '../repository';
import { Notification, NotificationSettings } from './notification.domain';

@injectable()
export class NotificationRepository extends RepositoryV2<Notification> {

  constructor(datastore: Datastore) {
    super(datastore, 'notification');
    this.excludeFromIndexes = ['body', 'data', 'links'];
  }

  public async findByUser(userName: string): Promise<Notification[]> {
    const userKey = this.datastore.key(['user', userName]);
    const query = this.query
      .hasAncestor(userKey)
      .order('ts', { descending: true })
      .limit(50);
    return this.find(query);
  }

  public async countUnreadByUser(userName: string): Promise<number> {
    const userKey = this.datastore.key(['user', userName]);
    const query = this.query
      .hasAncestor(userKey)
      .filter('isRead', false)
      .select('__key__');
    const res = await this.find(query);
    return res.length;
  }

  public async findOneByUser(userName: string, id: string): Promise<Notification | undefined> {
    const key = this.datastore.key(['user', userName, this.kindName, this.datastore.int(id)]);
    const [one] = await this.datastore.get(key);
    return one;
  }

  public async save(data: Notification, userName: string, id?: string): Promise<string> {
    const method = !!id ? 'update' : 'insert';
    const path: PathType[] = ['user', userName, this.kindName];
    if (!!id) {
      path.push(this.datastore.int(id));
    }
    const key = this.datastore.key(path);

    await this.datastore.save({ key, data, method, excludeFromIndexes: this.excludeFromIndexes });
    return key.id!;
  }

  public async saveMulti(entities: Notification[]) {
    await this.datastore.save(entities);
  }

  public async delete(userName: string, id: string): Promise<void> {
    const key = this.datastore.key(['user', userName, this.kindName, this.datastore.int(id)]);
    await this.datastore.delete(key)
  }
}

@injectable()
export class NotificationSettingsRepository extends RepositoryV2<NotificationSettings> {
  constructor(datastore: Datastore) {
    super(datastore, 'notification_settings');
  }

  public async findEnabled() {
    const query = this.query.filter('enabled', true);
    return this.find(query);
  }
}