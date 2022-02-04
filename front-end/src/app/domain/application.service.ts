import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Application, FiltersBean } from './application-domain';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheKey, CacheService } from './cache.service';
import { select } from '@domain/rxjs-utils';

interface State {
  public: Application[];
  own: Application[];
}

@Injectable()
export class ApplicationService {

  private stateSubject = new BehaviorSubject<State>({ public: [], own: [] });
  private get state() { return this.stateSubject.getValue(); }
  private set state(val: State) { this.stateSubject.next(val); }

  private patchState(val: any) {
    this.state = { ...this.state, ...val };
  }

  public$ = this.stateSubject.asObservable().pipe(select(state => state.public));
  own$ = this.stateSubject.asObservable().pipe(select(state => state.own));

  constructor(private http: HttpClient, private cache: CacheService) { }

  fetchPublic() {
    this.getApplications().subscribe(list => this.patchState({ public: list }));
  }

  fetchOwn() {
    this.getUserApplications().subscribe(list => this.patchState({ own: list }));
  }

  getApplications(): Observable<Application[]> {
    return this.cache.getOrFetch(CacheKey.allApplications, 60,
      () => this.http.get<Application[]>(`/api/applications`)
    );
  }

  getApplicationsByCategory(id: string): Observable<Application[]> {
    throw new Error('Not implemented yet');
    return this.http.get<Application[]>(`/api/applications?category=${id}`);
  }

  getUserApplications(): Observable<{ drafts: Application[]; published: Application[] }> {
    return this.cache.getOrFetch(CacheKey.userApplications, 60,
      () => this.http.get<any>(`/api/user/applications`)
    );
  }

  getApplicationsGlobalMap(): Observable<Application[]> {
    throw new Error('Not implemented yet');
  }

  getApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`/api/applications/${id}`);
  }

  getUserApplication(id: string): Observable<Application> {
    return this.http.get<Application>(`/api/user/applications/${id}`);
  }

  addApplication(data: Application): Observable<Application> {
    this.cache.delete(CacheKey.allApplications);
    this.cache.delete(CacheKey.userApplications);
    return this.http.post<Application>(`/api/user/applications`, data);
  }

  editApplication(id: string, data: Application): Observable<Application> {
    this.cache.delete(CacheKey.allApplications);
    this.cache.delete(CacheKey.userApplications);
    return this.http.put<Application>(`/api/user/applications/${id}`, data);
  }

  deleteApplication(id: string): Observable<string> {
    this.cache.delete(CacheKey.allApplications);
    this.cache.delete(CacheKey.userApplications);
    return this.http.delete<string>(`/api/user/applications/${id}`);
  }

  changeApplicationStatus(id: string, action: string): Observable<any> {
    this.cache.delete(CacheKey.allApplications);
    this.cache.delete(CacheKey.userApplications);
    return this.http.patch(`/api/user/applications/${id}`, { action });
  }

  reportApplication(id: string, message: string): Observable<any> {
    return this.http.post<any>(`/api/applications/${id}/report`, { message });
  }

  getAdminApplications(): Observable<{ pending: Application[]; published: Application[] }> {
    return this.http.get<any>(`/api/admin/applications`);
  }

  getAdminApplication(id: string): Observable<{ pending: Application; published?: Application }> {
    return this.http.get<any>(`/api/admin/applications/${id}`);
  }

  changeAdminApplicationStatus(id: string, action: string, message?: string): Observable<any> {
    return this.http.patch(`/api/admin/applications/${id}`, { action, message });
  }

  getSavedMatchmaking(): Observable<FiltersBean[]> {
    return this.http.get<FiltersBean[]>('/api/user/applications/matchmaking');
  }

  saveMatchmaking(filters: FiltersBean): Observable<FiltersBean> {
    return this.http.post<FiltersBean>('/api/user/applications/matchmaking', filters);
  }

  deleteMatchmaking(id: string) {
    return this.http.delete(`/api/user/applications/matchmaking/${id}`);
  }
}
