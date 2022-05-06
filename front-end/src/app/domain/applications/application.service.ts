import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Application} from './application-domain';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheKey, CacheService } from '@domain/cache.service';
import { select } from '@domain/rxjs-utils';
import { filter, map } from 'rxjs/operators';
import { FiltersBean } from './filters-domain';

interface State {
  public: Application[];
  publicById: { [id: string]: Application };
  own: { drafts: Application[]; published: Application[] };
}

@Injectable()
export class ApplicationService {

  private publicByIdCache: { [id: string]: Observable<Application> } = {};
  private stateSubject = new BehaviorSubject<State>({ public: [], publicById: {}, own: { drafts: [], published: [] } });
  private get state() { return this.stateSubject.getValue(); }
  private set state(val: State) { this.stateSubject.next(val); }

  private patchState(val: Partial<State>) {
    this.state = { ...this.state, ...val };
  }

  public$ = this.stateSubject.asObservable().pipe(select(state => state.public));

  public publicById$(id: string) {
    if (!this.publicByIdCache[id]) {
      this.publicByIdCache[id] = this.stateSubject.asObservable().pipe(
        map(state => state.publicById[id]),
        filter(one => one != null)
      );
    }
    return this.publicByIdCache[id];
  }

  own$ = this.stateSubject.asObservable().pipe(select(state => state.own));

  constructor(private http: HttpClient, private cache: CacheService) { }

  fetchPublic() {
    this.getApplications()
      .subscribe(list =>
        this.patchState({
          public: list,
          publicById: Object.fromEntries(list.map(one => [one.id, one]))
        })
      );
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
