import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CacheService } from '@domain/cache.service';

import { CountriesService } from './countries.service';

describe('CountriesService', () => {
  let service: CountriesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService, CountriesService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CountriesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    expect(1).toBe(1);
  });

  it('should load country list', fakeAsync(() => {
    tick(1);
    http.expectOne('/api/countries');
  }));

  it('should get regions', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['subject'].next([
      { name: 'c1', region: 'A', subregion: 'A1'},
      { name: 'c2', region: 'A', subregion: 'A1'},
      { name: 'c3', region: 'A', subregion: 'A2'},
      { name: 'c4', region: 'B', subregion: 'B1'},
      { name: 'c5', region: 'C', subregion: 'C1'}
    ] as any);

    service.regions$.subscribe(regs => {
      expect(regs[0]).toEqual({ region: 'A', sub: ['A1', 'A2']});
      expect(regs[1]).toEqual({ region: 'B', sub: ['B1']});
      expect(regs[2]).toEqual({ region: 'C', sub: ['C1']});
    });

    http.expectOne('/api/countries');
  });
});
