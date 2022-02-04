import express from 'express';

import { controller, httpDelete, httpGet, httpPost, httpPut, requestBody, request,
  requestParam, principal, queryParam } from 'inversify-express-utils';
import { CategoryService } from './category.service';
import { AuthGuard } from '../security/auth-guard';
import { DiBiCooPrincipal } from '../security/principal';
import { CategoryBean } from './category.domain';
import { multerFile } from '../utils/multer';

@controller('/categories')
export class CategoryController {

  constructor(private service: CategoryService) { }

  @httpGet('')
  public async listCategories() {
    return await this.service.getAllCategories();
  }

  @httpGet('/:id')
  public async getCategoryById(@requestParam('id') id: string) {
    return await this.service.getCategoryById(id);
  }

  @httpPost('', AuthGuard.isInRole('admin'))
  public async createCategory(@requestBody() bean: CategoryBean, @principal() user: DiBiCooPrincipal) {
    return await this.service.addCategory(bean, user);
  }

  @httpPut('/:id', AuthGuard.isInRole('admin'))
  public async editCategory(@requestParam('id') id: string,
                            @requestBody() bean: CategoryBean,
                            @principal() user: DiBiCooPrincipal) {
    return await this.service.editCategory(id, bean, user);
  }

  @httpPost('/:id/imgupload', multerFile('image'), AuthGuard.isInRole('admin'))
  public async uploadImage(@requestParam('id') id: string,
                           @request() req: express.Request,
                           @principal() user: DiBiCooPrincipal) {

    await this.service.uploadImage(id, req.file, user);
    return 204;
  }

  @httpDelete('/:id', AuthGuard.isInRole('admin'))
  public async deleteCategory(@requestParam('id') id: string) {
    await this.service.deleteCategory(id);
    return 204;
  }
}
