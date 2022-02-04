import { controller, httpGet, requestParam } from 'inversify-express-utils';
import { KnowledgeBaseService } from './knowledge-base.service';

@controller('/knowledge-base')
export class KnowledgeBaseController {

  constructor(private service: KnowledgeBaseService) { }

  @httpGet('')
  public async listArticles() {
    return await this.service.getArticleList();
  }

  @httpGet('/:id')
  public async getArticle(@requestParam('id') id: string) {
    return await this.service.getArticle(id);
  }
}
