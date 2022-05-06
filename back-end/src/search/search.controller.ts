
import { controller, httpGet, queryParam, requestParam } from 'inversify-express-utils';
import { SearchService } from './search.service';

@controller('/search')
export class SearchController {

  constructor(private service: SearchService) { }

  @httpGet('/:kind')
  public async search(@requestParam('kind') kind: string, @queryParam('q') query: string) {
    return await this.service.search(kind, query);
  }
}
