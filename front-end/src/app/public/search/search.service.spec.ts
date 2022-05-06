import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchService
      ],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request search results', () => {
    const http = TestBed.inject(HttpTestingController);

    service.getResults('all', '-asd +xyz').subscribe();
    expect(
      () => http.expectOne('/api/search/all?q=-asd%2520%252Bxyz')
    ).not.toThrow();
    http.verify();
  });
});
