import { injectable } from 'inversify';
import NodeCache from 'node-cache';
import { badRequestFn } from '../utils/common-responses';
import { convertItem, SearchResults } from './search.domain';
import { EnterpriseIndex } from './enterprise.index';
import { ApplicationIndex } from './application.index';



@injectable()
export class SearchService {

  constructor(private companyIndex: EnterpriseIndex,
    private applicationIndex: ApplicationIndex
  ) { }

  public async search(kind: string, query: string): Promise<SearchResults> {
    let terms = decodeURIComponent(query).split(/[\s]+/).filter(t => !!t);
    if (terms.length === 0) {
      return Promise.reject(badRequestFn("Empty query string"));
    }

    if (terms.every(t => !/[*^:~+-]/.test(t))) {
      terms = terms.map(t => `${t}*`);
    }

    const compPromise = (limit?: number) => this.companyIndex.get()
      .then(idx => idx.search(terms.join(' ')))
      .catch(_ => [])
      .then(
        comps => ({
          companies: comps.slice(0, limit).map(convertItem),
          totalCompanies: comps.length
        })
      );

    const appPromise = (limit?: number) => this.applicationIndex.get()
      .then(idx => idx.search(terms.join(' ')))
      .catch(_ => [])
      .then(
        apps => ({
          applications: apps.slice(0, limit).map(convertItem),
          totalApplications: apps.length
        })
      );

    if (kind === 'enterprises') {
      return compPromise();
    } else if (kind === 'applications') {
      return appPromise();
    } else {
      const limit = 5;
      return Promise.all([compPromise(limit), appPromise(limit)])
        .then(
          ([comps, apps]) => ({
            ...comps,
            ...apps
          })
        );
    }
  }
}
