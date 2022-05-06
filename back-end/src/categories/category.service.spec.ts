import { createMock } from './../../test/utils';

import { CategoryService } from './category.service';
import { DiBiCooPrincipal } from '../security/principal';
import { CategoryRepository } from './category.repository';
import { StorageService } from '../common/storage.service';
import { Category } from './category.domain';
import { Datastore } from '@google-cloud/datastore';
import NodeCache from 'node-cache';

describe('CategoryService', () => {

  let repository: CategoryRepository;
  let storage: StorageService;
  let cache: NodeCache;
  let service: CategoryService;

  const data = {
    title: 'Testing category'
  } as Category;

  const user = { userName: 'john' } as DiBiCooPrincipal;

  beforeEach(() => {
    repository = createMock(CategoryRepository);
    storage = createMock(StorageService);
    cache = new NodeCache();
    service = new CategoryService(repository, storage, cache);
  });

  it('should get all categories', async () => {
    spyOn(repository, 'find').and.returnValue(Promise.resolve([data, data]));

    const list = await service.getAllCategories();

    expect(list.length).toBe(2);
    expect(list[0].title).toEqual('Testing category');
    expect(repository.find).toHaveBeenCalled();
  });

  it('should get category by Id', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));

    const res = await service.getCategoryById('123');

    expect(res.title).toEqual('Testing category');
    expect((res as any).randomField).toBeUndefined();
    expect(repository.findOne).toHaveBeenCalledWith('123');
  });

  it('should get categories by parent id', async () => {
    const filterCb = jasmine.createSpy('filter callback');
    spyOn(repository, 'find').and.callFake((cb: any) => {
      cb({ filter: filterCb });
      return Promise.resolve([data, data, data]);
    });

    const list = await service.getChildCategories('987');

    expect(list.length).toBe(3);
    expect(list[0].title).toEqual('Testing category');
    expect(repository.find).toHaveBeenCalled();
    expect(filterCb).toHaveBeenCalledWith('parentId', '987');
  });

  it('should add category', async () => {
    spyOn(repository, 'save').and.returnValue(Promise.resolve('123'));
    const bean = { title: 'new category', randomField: true };

    const res = await service.addCategory(bean, user);

    expect(repository.save).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'new category', changedBy: 'john' })
    );
    expect(repository.save).not.toHaveBeenCalledWith(jasmine.objectContaining({ randomField: true }));
    expect(res.id).toBe('123');
  });

  it('should edit category', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ title: 'old' } as any));
    spyOn(repository, 'save').and.returnValue(Promise.resolve('987'));
    const bean = { title: 'new', randomField: true };

    const res = await service.editCategory('987', bean, user);

    expect(repository.findOne).toHaveBeenCalledWith('987');
    expect(repository.save).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: 'new' }),
      '987');
    expect(repository.save).not.toHaveBeenCalledWith(jasmine.objectContaining({ randomField: true }));
    expect(res.title).toEqual('new');
  });

  it('should delete category', async () => {
    const cat = (id: any, obj: any = {}) => {
      obj[Datastore.KEY] = { id };
      return obj;
    };

    spyOn(repository, 'findOne').and.returnValue(Promise.resolve(cat('987', { imageHash: 'asd' })));
    spyOn(repository, 'find').and.returnValue(Promise.resolve([cat('111'), cat('222', { imageHash: 'qwe' })] as any));
    spyOn(repository, 'delete');
    spyOn(storage, 'deleteCategoryImage');

    await service.deleteCategory('987');

    expect(repository.findOne).toHaveBeenCalledWith('987');
    expect(repository.delete).toHaveBeenCalledWith(['987', '111', '222']);
    expect(storage.deleteCategoryImage).toHaveBeenCalledWith('987');
    expect(storage.deleteCategoryImage).toHaveBeenCalledWith('222');
  });

  it('should upload category image', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ imageHash: 'old' } as any));
    spyOn(storage, 'uploadCategoryImage').and.returnValue(Promise.resolve({ md5Hash: 'new' } as any));
    spyOn(repository, 'save');

    await service.uploadImage('987', { buffer: 'binary' } as any, user);

    expect(repository.findOne).toHaveBeenCalledWith('987');
    expect(storage.uploadCategoryImage).toHaveBeenCalledWith('987', 'binary');
    expect(repository.save).toHaveBeenCalledWith(jasmine.objectContaining({ imageHash: 'new' }), '987');
  });

  it('should get and cache all categories', async () => {
    spyOn(repository, 'findAll').and.returnValue(Promise.resolve([{}, {}] as any));
    const list = await service.getAllCached();
    expect(list.length).toBe(2);
    expect(cache.get<any[]>('allCategories')?.length).toBe(2);
  });

  it('should get all categories from cache', async () => {
    spyOn(repository, 'findAll');
    cache.set('allCategories', [{}, {}, {}]);
    const list = await service.getAllCached();
    expect(list.length).toBe(3);
  });

});
