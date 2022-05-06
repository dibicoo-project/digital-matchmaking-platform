import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Enterprise, EnterpriseShare, Invitation } from './enterprise-domain';
import { BehaviorSubject, Observable } from 'rxjs';
import { CacheKey, CacheService } from '@domain/cache.service';
import { filter, map } from 'rxjs/operators';
import { ContactMessage } from '@domain/common-domain';
import { select } from '@domain/rxjs-utils';
import { FiltersBean } from './filters-domain';

interface State {
  public: Enterprise[];
  publicById: { [id: string]: Enterprise };
}

@Injectable()
export class EnterpriseService {

  private publicByIdCache: { [id: string]: Observable<Enterprise> } = {};
  private stateSubject = new BehaviorSubject<State>({ public: null, publicById: {} });
  private get state() { return this.stateSubject.getValue(); }
  private set state(val: State) { this.stateSubject.next(val); }

  public$ = this.stateSubject.asObservable().pipe(
    select(state => state.public),
    filter(all => all != null)
  );

  public publicById$(id: string) {
    if (!this.publicByIdCache[id]) {
      this.publicByIdCache[id] = this.stateSubject.asObservable().pipe(
        map(state => state.publicById[id]),
        filter(one => one != null)
      );
    }
    return this.publicByIdCache[id];
  }

  constructor(private http: HttpClient, private cache: CacheService) { }

  fetchPublic() {
    this.getEnterprises()
      .subscribe(list => this.state = {
        ...this.state,
        public: list,
        publicById: Object.fromEntries(list.map(one => [one.id, one]))
      });
  }

  getEnterprises(): Observable<Enterprise[]> {
    return this.cache.getOrFetch(CacheKey.allCompanies, 60,
      () => this.http.get<Enterprise[]>(`/api/enterprises`)
    );
  }

  getUserEnterprises(): Observable<{ drafts: Enterprise[]; published: Enterprise[] }> {
    return this.cache.getOrFetch(CacheKey.userCompanies, 60,
      () => this.http.get<any>(`/api/user/enterprises`)
    );
  }

  changeEnterpriseStatus(id: string, action: string): Observable<Enterprise> {
    this.cache.delete(CacheKey.userCompanies);
    this.cache.delete(CacheKey.allCompanies);
    return this.http.patch<Enterprise>(`/api/user/enterprises/${id}`, { action });
  }

  getAdminEnterprises(): Observable<{ pending: Enterprise[]; published: Enterprise[] }> {
    return this.http.get<any>(`/api/admin/enterprises`);
  }

  getAdminEnterprise(id: string): Observable<{ pending: Enterprise; published: Enterprise }> {
    return this.http.get<any>(`/api/admin/enterprises/${id}`);
  }

  changeAdminEnterpriseStatus(id: string, action: string, message?: string): Observable<Enterprise> {
    this.cache.delete(CacheKey.userCompanies);
    this.cache.delete(CacheKey.allCompanies);
    return this.http.patch<Enterprise>(`/api/admin/enterprises/${id}`, { action, message });
  }

  getEnterprise(id: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`/api/enterprises/${id}`);
  }

  getUserEnterprise(id: string): Observable<Enterprise> {
    return this.http.get<Enterprise>(`/api/user/enterprises/${id}`);
  }

  addEnterprise(data: Enterprise): Observable<Enterprise> {
    this.cache.delete(CacheKey.userCompanies);
    this.cache.delete(CacheKey.allCompanies);
    return this.http.post<any>(`/api/user/enterprises`, data);
  }

  editEnterprise(id: string, data: Enterprise): Observable<Enterprise> {
    this.cache.delete(CacheKey.userCompanies);
    this.cache.delete(CacheKey.allCompanies);
    return this.http.put<any>(`/api/user/enterprises/${id}`, data);
  }

  deleteEnterprise(id: string) {
    this.cache.delete(CacheKey.userCompanies);
    this.cache.delete(CacheKey.allCompanies);
    return this.http.delete<void>(`/api/user/enterprises/${id}`);
  }

  addEnterpriseLogo(id: string, data: FormData) {
    return this.http.post<Enterprise>(`/api/user/enterprises/${id}/logo`, data);
  }

  deleteEnterpriseLogo(id: string) {
    return this.http.delete<void>(`/api/user/enterprises/${id}/logo`);
  }

  getEnterpriseShares(id: string): Observable<EnterpriseShare> {
    return this.http.get<any>(`/api/user/enterprises/${id}/share`);
  }

  addEnterpriseShare(id: string, share: any): Observable<any> {
    return this.http.post<any>(`/api/user/enterprises/${id}/share`, share);
  }

  revokeEnterpriseShare(id: string, payload: any) {
    return this.http.request<any>('delete', `/api/user/enterprises/${id}/share`, { body: payload });
  }

  getInvitationDetails(id: string): Observable<Invitation> {
    return this.http.get<any>(`/api/enterprises/invite/${id}`);
  }

  acceptInvitation(id: string): any {
    return this.http.post<any>(`/api/user/enterprises/invite/${id}`, null);
  }

  getEnterpriseStatistics(id: string): any {
    return this.http.get<any>(`/api/user/enterprises/${id}/statistics`);
  }

  getSavedMatchmaking(): Observable<FiltersBean[]> {
    return this.http.get<FiltersBean[]>('/api/user/enterprises/matchmaking');
  }

  saveMatchmaking(filters: FiltersBean): Observable<FiltersBean> {
    return this.http.post<FiltersBean>('/api/user/enterprises/matchmaking', filters);
  }

  deleteMatchmaking(id: string) {
    return this.http.delete(`/api/user/enterprises/matchmaking/${id}`);
  }

  sendMessage(id: string, message: ContactMessage) {
    return this.http.post(`/api/user/enterprises/${id}/message`, message);
  }

  reportEnterprise(id: string, message: any) {
    return this.http.post<any>(`/api/enterprises/${id}/report`, { message });
  }

}
