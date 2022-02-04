import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { createMock } from './../../test/utils';
import { CategoryBean } from './category.domain';
import { DiBiCooPrincipal } from '../security/principal';

describe('CategoryController', () => {

  let controller: CategoryController;
  let service: CategoryService;
  const user = new DiBiCooPrincipal({ sub: 'johnTheTester' });

  beforeEach(() => {
    service = createMock(CategoryService);
    controller = new CategoryController(service);
  });

  it('should return category list', async () => {
    spyOn(service, 'getAllCategories').and.returnValue(Promise.resolve([{}, {}, {}]));

    const list = await controller.listCategories();

    expect(list.length).toBe(3);
    expect(service.getAllCategories).toHaveBeenCalled();
  });

  it('should get category by id', async () => {
    spyOn(service, 'getCategoryById').and.returnValue(Promise.resolve({}));
    await controller.getCategoryById('123');
    expect(service.getCategoryById).toHaveBeenCalledWith('123');
  });

  it('should create category', async () => {
    spyOn(service, 'addCategory').and.returnValue(Promise.resolve({ id: 'new-id' }));
    const bean: CategoryBean = { id: '123' };

    await controller.createCategory(bean, user);

    expect(service.addCategory).toHaveBeenCalledWith(bean, user);
  });

  it('should edit category', async () => {
    spyOn(service, 'editCategory').and.returnValue(Promise.resolve({}));
    const bean: CategoryBean = { id: '123' };

    await controller.editCategory('123', bean, user);

    expect(service.editCategory).toHaveBeenCalledWith('123', bean, user);
  });

  it('should upload image', async () => {
    spyOn(service, 'uploadImage').and.returnValue(Promise.resolve());
    const res = await controller.uploadImage('123', { file: 'binary' } as any, user);

    expect(service.uploadImage).toHaveBeenCalledWith('123', 'binary' as any, user);
    expect(res).toBe(204);
  });

  it('should delete category', async () => {
    spyOn(service, 'deleteCategory').and.returnValue(Promise.resolve());

    await controller.deleteCategory('123');

    expect(service.deleteCategory).toHaveBeenCalledWith('123');
  });
});
