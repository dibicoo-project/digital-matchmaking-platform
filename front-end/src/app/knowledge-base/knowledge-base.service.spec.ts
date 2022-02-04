import { TestBed } from '@angular/core/testing';

import { KnowledgeBaseService } from './knowledge-base.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('KnowledgeBaseService', () => {

  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    http = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should be created', () => {
    const service: KnowledgeBaseService = TestBed.get(KnowledgeBaseService);
    expect(service).toBeTruthy();
  });

  it('should get article list', () => {
    const service = TestBed.get(KnowledgeBaseService);
    service.getArticles().subscribe();
    http.expectOne({ method: 'GET', url: '/api/knowledge-base' });
  });

  it('should get article content', () => {
    const service = TestBed.get(KnowledgeBaseService);
    service.getArticle('test-article').subscribe();
    http.expectOne({ method: 'GET', url: '/api/knowledge-base/test-article' });
  });
});
