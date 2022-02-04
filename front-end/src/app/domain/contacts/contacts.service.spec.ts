import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CacheService } from '@domain/cache.service';

import { ContactsService } from './contacts.service';

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContactsService,
        CacheService
      ],
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ContactsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user contacts', () => {
    const http = TestBed.inject(HttpTestingController);
    service.all$.subscribe();

    http.expectOne({ method: 'GET', url: '/api/user/contacts' });
    expect(() => http.verify()).not.toThrow();
  });
});
