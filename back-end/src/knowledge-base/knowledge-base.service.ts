import { injectable } from 'inversify';
import { plainId } from '../utils/transform-datastore-id';
import { notFound } from '../utils/common-responses';
import { KnowledgeBaseRepoistory } from './knowledge-base.repository';
import { Article, ArticleBean } from './knowledge-base.domain';

@injectable()
export class KnowledgeBaseService {

  constructor(private repository: KnowledgeBaseRepoistory) { }

  private toBean(item: Article): ArticleBean {
    return { ...item, id: plainId(item) };
  }

  public async getArticleList(): Promise<ArticleBean[]> {
    const all = await this.repository.find(q => q.select(['name', 'kind']));
    return all.map(this.toBean);
  }

  public async getArticle(id: string): Promise<ArticleBean> {
    const one = await this.repository.findOne(id);
    return one ? this.toBean(one) : Promise.reject(notFound);
  }
}
