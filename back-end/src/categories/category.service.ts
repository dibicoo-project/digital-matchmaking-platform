import { injectable } from 'inversify';

import { Category, CategoryBean } from './category.domain';
import { StorageService } from '../common/storage.service';
import { plainId } from '../utils/transform-datastore-id';
import { CategoryRepository } from './category.repository';
import { notFound, badRequest } from '../utils/common-responses';
import { DiBiCooPrincipal } from '../security/principal';
import { Query } from '@google-cloud/datastore';

@injectable()
export class CategoryService {

  constructor(private repository: CategoryRepository, private storage: StorageService) { }

  private toBean(item: Category): CategoryBean {
    const id: string = plainId(item);
    return {
      id,
      title: item.title,
      description: item.description,
      parentId: item.parentId,
      ancestors: item.ancestors,
      order: item.order,
      imageUrl: item.imageHash ? this.storage.getCategoryImageUrl(id) + `?hash=${item.imageHash}` : undefined
    };
  }

  private toEntity(bean: CategoryBean): Category {
    return {
      title: bean.title,
      description: bean.description,
      parentId: bean.parentId,
      ancestors: bean.ancestors,
      order: bean.order
    } as Category;
  }

  private async getById(id: string): Promise<Category> {
    const one = await this.repository.findOne(id);
    return one || Promise.reject(notFound);
  }

  public async getAllCategories() {
    const all = await this.repository.find(q => q);
    return all.map(one => this.toBean(one));
  }

  public async getCategoryById(id: string) {
    const one = await this.repository.findOne(id);
    return one ? this.toBean(one) : Promise.reject(notFound);
  }

  public async getChildCategories(parentId: string) {
    const children = await this.repository.find(q => q.filter('parentId', parentId));
    return children.map(one => this.toBean(one));
  }

  public async addCategory(bean: CategoryBean, user: DiBiCooPrincipal) {
    const entity = this.toEntity(bean);

    if (!entity.title) {
      return Promise.reject(badRequest);
    }

    entity.changedBy = user.userName;
    entity.changedTs = new Date();

    const id = await this.repository.save(entity);

    return { ...this.toBean(entity), id };
  }

  public async editCategory(id: string, bean: CategoryBean, user: DiBiCooPrincipal) {
    const entity = { ...(await this.getById(id)), ...this.toEntity(bean) };
    if (!entity.title) {
      return Promise.reject(badRequest);
    }

    entity.changedBy = user.userName;
    entity.changedTs = new Date();

    await this.repository.save(entity, id);

    return this.toBean(entity);
  }

  public async uploadImage(id: string, file: Express.Multer.File, user: DiBiCooPrincipal) {
    const entity = await this.getById(id);
    const metadata = await this.storage.uploadCategoryImage(id, file.buffer);

    entity.imageHash = metadata.md5Hash;
    entity.changedBy = user.userName;
    entity.changedTs = new Date();

    await this.repository.save(entity, id);
  }

  public async deleteCategory(id: string) {
    const entity = await this.getById(id);
    const children = await this.repository.find(q => q.filter('ancestors', id));

    const keysToDelete = [plainId(entity), ...children.map(c => plainId(c))];

    [entity, ...children]
      .filter(e => !!e.imageHash)
      .forEach(async e => await this.storage.deleteCategoryImage(plainId(e)));

    await this.repository.delete(keysToDelete);
  }
}
