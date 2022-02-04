import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheKey, CacheService } from '@domain/cache.service';
import { ContactItem } from '@domain/common-domain';

@Injectable()
export class ContactsService {

  constructor(private http: HttpClient, private cache: CacheService) { }

  get all$() {
    return this.cache.getOrFetch(CacheKey.contacts, 60, () => this.http.get<ContactItem[]>('/api/user/contacts'));
  }
}
