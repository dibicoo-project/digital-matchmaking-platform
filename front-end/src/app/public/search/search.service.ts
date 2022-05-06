import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SearchResults } from './search-domain';

@Injectable()
export class SearchService {

  constructor(private http: HttpClient) { }

  getResults(kind: string, query: string) {
    return this.http.get<SearchResults>(`/api/search/${kind}`, { params: { q: encodeURIComponent(query) } });
  }
}
