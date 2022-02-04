import { createMock } from './../../test/utils';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';

describe('KnowledgeBaseController', () => {

  let controller: KnowledgeBaseController;
  let service: KnowledgeBaseService;

  beforeEach(() => {
    service = createMock(KnowledgeBaseService);
    controller = new KnowledgeBaseController(service);
  });

  it('should return article list', async () => {
    spyOn(service, 'getArticleList').and.returnValue(Promise.resolve([{}, {}]));

    const list = await controller.listArticles();

    expect(list.length).toBe(2);
    expect(service.getArticleList).toHaveBeenCalled();
  });

  it('should get article content', async () => {
    spyOn(service, 'getArticle').and.returnValue(Promise.resolve({} as any));
    await controller.getArticle('test-article');

    expect(service.getArticle).toHaveBeenCalledWith('test-article');
  });
});
