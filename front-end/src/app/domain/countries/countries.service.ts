import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CacheKey, CacheService } from '@domain/cache.service';
import { emptyLast, onlyUnique } from '@domain/utils';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Country, CountryGroup } from './country-domain';

@Injectable()
export class CountriesService {

  private subject = new BehaviorSubject<Country[]>([]);
  all$ = this.subject.asObservable();
  regions$ = this.all$.pipe(
    map(all => all.map(({region, subregion}) => ({region, sub: [subregion].filter(s => !!s)}))
      .filter(one => !!one.region)
      .reduce((acc, obj) => {
        const region = acc.find(one => one.region === obj.region);
        if (!region) {
          acc.push(obj);
        } else {
          region.sub = [...region.sub, ...obj.sub].filter(onlyUnique).sort(emptyLast);
        }
        return acc;
      }, [])
      .sort((a, b) => a.region.localeCompare(b.region))),
    shareReplay(1)
  );

  constructor(private http: HttpClient, private cache: CacheService) { 
    // TODO: better way to load countries?
    this.fetch();
  }

  fetch() {
    this.http.get<Country[]>('/api/countries').subscribe(list => this.subject.next(list));
  }

  /* for later implementation
  getCountriesTree(): Observable<CountryGroup[]> {
    return this.getCountries()
      .pipe(
        map(allCountries => {
          const regions = allCountries.map(one => one.region)
            .filter(onlyUnique)
            .sort(emptyLast)
            .map(regionName => {
              const regionCountries = allCountries.filter(one => one.region === regionName);
              const subregions = regionCountries.map(one => one.subregion)
                .filter(onlyUnique)
                .sort(emptyLast)
                .map(subName => {
                  return { name: subName || 'Other', items: regionCountries.filter(c => c.subregion === subName) }
                });

              return { name: regionName || 'Other', items: subregions }
            });
          return regions;
        })
      );
  }
   */
}
