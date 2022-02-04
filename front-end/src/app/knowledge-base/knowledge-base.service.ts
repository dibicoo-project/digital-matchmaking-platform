import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeBaseService {

  constructor(private http: HttpClient) { }

  getArticle(name: string): Observable<any> {
    return this.http.get<any>(`/api/knowledge-base/${name}`);
  }

  getArticles(): Observable<any> {
    return this.http.get<any>('/api/knowledge-base');
  }
}
