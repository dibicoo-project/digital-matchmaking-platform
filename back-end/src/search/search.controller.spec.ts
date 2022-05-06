import { createMock } from './../../test/utils';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('AttachmentController', () => {
  let controller: SearchController;
  let service: SearchService;

  beforeEach(() => {
    service = createMock(SearchService);
    controller = new SearchController(service);
  });

  it('should perfrom search', () => {
    spyOn(service, 'search');
    controller.search('all', 'test');
    expect(service.search).toHaveBeenCalledWith('all', 'test');
  });
  
});
