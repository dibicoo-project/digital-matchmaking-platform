import { Injectable } from '@angular/core';
import * as clone from 'clone';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

class CacheItem {
  private expireAt: moment.Moment;
  constructor(
    public value: any,
    ttl: number
  ) {
    this.expireAt = moment().add(ttl, 'seconds');
  }

  isExpired() {
    return this.expireAt.isSameOrBefore(moment());
  }
}

export enum CacheKey {
  allCompanies = 'allCompanies',
  userCompanies = 'userCompanies',

  allApplications = 'allApplications',
  userApplications = 'userApplications',

  categories = 'categories',
  contacts = 'contacts',
  countries = 'countries'
}

@Injectable()
export class CacheService {
  private cache: { [key in keyof CacheKey]: CacheItem } = {} as any;

  constructor() { }

  get(code: CacheKey): any {
    const item = this.cache[code];
    if (item && !item.isExpired()) {
      return item.value;
    }
    return null;
  }

  set(code: CacheKey, value: any, ttl: number) {
    this.cache[code] = new CacheItem(value, ttl);
  }

  getOrFetch<T>(code: CacheKey, ttl: number, fn: () => Observable<T>): Observable<T> {
    let value = this.get(code);

    if (!value) {
      value = fn().pipe(
        shareReplay(1),
        map(it => clone(it)) // deep clone hack to mimic immutable objects
      );
      this.set(code, value, ttl);
    }

    return value;
  }

  has(code: CacheKey): boolean {
    const item = this.cache[code];
    return item && !item.isExpired();
  }

  delete(code: CacheKey) {
    delete this.cache[code];
  }

  clear() {
    this.cache = {} as any;
  }

}
