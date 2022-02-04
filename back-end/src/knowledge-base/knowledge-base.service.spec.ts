import { createMock } from './../../test/utils';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseRepoistory } from './knowledge-base.repository';
import { Article } from './knowledge-base.domain';
import { Query } from '@google-cloud/datastore';

describe('KnowledgeBaseService', () => {

  let service: KnowledgeBaseService;
  let repository: KnowledgeBaseRepoistory;

  beforeEach(() => {
    repository = createMock(KnowledgeBaseRepoistory);
    service = new KnowledgeBaseService(repository);
  });

  it('should return article list', async () => {
    const query = createMock(Query);
    spyOn(query, 'select');

    spyOn(repository, 'find').and.callFake((cb) => {
      cb!(query);
      return Promise.resolve([{} as Article, {} as Article]);
    });

    const list = await service.getArticleList();

    expect(list.length).toBe(2);
    expect(query.select).toHaveBeenCalledWith(['name', 'kind']);
  });

  it('should get article content', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({} as Article));
    await service.getArticle('test-article');
    expect(repository.findOne).toHaveBeenCalledWith('test-article');
  });
});
