import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { CategoryService } from '@domain/categories/category.service';
import { CountriesService } from '@domain/countries/countries.service';
import { CountrySelectComponent } from '@domain/countries/country-select/country-select.component';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { delay, filter, map, shareReplay } from 'rxjs/operators';
import * as moment from 'moment';
import { Country } from '@domain/countries/country-domain';
import { Enterprise, FilterDefinition, FilterGroup, Filters, FilterType } from '@domain/enterprises/enterprise-domain';
import { Router } from '@angular/router';
import { AuthService } from '@root/app/auth/auth.service';
import { DialogService } from '@domain/dialog.service';

const emptyFilters = () => ({
  'business-field': [],
  'company-region': [],
  'profile-updates': [],
  'project-region': [],
}) as Filters;

@Component({
  selector: 'app-enterprise-matchmaking',
  templateUrl: './enterprise-matchmaking.component.html',
  styleUrls: ['./enterprise-matchmaking.component.scss']
})
export class EnterpriseMatchmakingComponent implements OnInit {

  isSaved = false;

  constructor(
    public countriesService: CountriesService,
    public categories: CategoryService,
    public enterpriseService: EnterpriseService,
    private router: Router,
    public auth: AuthService,
    private dialog: DialogService
  ) {
    const filters = this.router.getCurrentNavigation()?.extras?.state?.filters;
    if (filters) {
      this.filtersSubject.next({ ...emptyFilters(), ...filters });
    }
  }

  filtersSubject = new BehaviorSubject<Filters>(emptyFilters());

  get filters() {
    return this.filtersSubject.getValue();
  }

  get anyFilterSelected(): boolean {
    return this.filters['business-field'].length > 0
      || this.filters['company-region'].length > 0
      || this.filters['profile-updates'].length > 0
      || this.filters['project-region'].length > 0;
  }

  getSelectedFilterCount(group: FilterGroup, ...types: FilterType[]) {
    return this.filters[group].filter(f => types.length === 0 || types.includes(f.type)).length;
  }

  filteredCompanies$ = combineLatest([
    this.enterpriseService.public$,
    this.filtersSubject.asObservable(),
    this.countriesService.all$,
  ]).pipe(
    map(([all, filters, countries]: [Enterprise[], Filters, Country[]]) => {
      const companies = all.filter(one => {
        let res = true;

        if (res && filters['business-field'].length > 0) {
          res = filters['business-field']
            .map(f => f.value)
            .some((id: string) => one.categoryIds.includes(id));
        }

        if (res && filters['profile-updates'].length > 0) {
          res = filters['profile-updates']
            .map(f => moment().subtract(f.value, 'days').startOf('day'))
            .some(since => since.isSameOrBefore(one.changedTs));
        }

        if (res && filters['company-region'].length > 0) {
          res = filters['company-region']
            .flatMap(f => {
              if (f.type === 'country') {
                return [f.value];
              } else {
                return countries.filter(c => c[f.type] === f.value).map(c => c.name);
              }
            })
            .some(country => one.location.country === country);
        }

        if (res && filters['project-region'].length > 0) {
          res = filters['project-region']
            .flatMap(f => {
              if (f.type === 'country') {
                return [f.value];
              } else {
                return countries.filter(c => c[f.type] === f.value).map(c => c.name);
              }
            })
            .some(country => one.keyProjects.some(p => p.location.country === country));
        }

        return res;
      });

      return companies;
    }),
    shareReplay(1)
  );

  @ViewChildren(MatMenuTrigger)
  menuTriggers: QueryList<MatMenuTrigger>;

  ngOnInit(): void {
    this.enterpriseService.fetchPublic();

    this.filtersSubject.subscribe(_ => {
      this.router.navigate([], {
        queryParams: { p: null },
        queryParamsHandling: 'merge'
      });
    });
  }

  addFilter(groupKey: FilterGroup, item: FilterDefinition, control?: CountrySelectComponent) {
    const group = this.filters[groupKey];

    if (group.every(one => one.type !== item.type || one.value !== item.value)) {
      if (groupKey === 'profile-updates') {
        group.splice(0, 1);
      }
      group.push(item);
      group.sort((a, b) => String(a.label || a.value).localeCompare(String(b.label || b.value)));
      this.filtersSubject.next({ ...this.filters });
    }

    this.menuTriggers.forEach(one => one.closeMenu());
    if (control) {
      // reset country search input
      control.writeValue('');
    }
  }

  removeFilter(group: FilterGroup, item: FilterDefinition) {
    const idx = this.filters[group].indexOf(item);
    if (idx >= 0) {
      this.filters[group].splice(idx, 1);
      this.filtersSubject.next({ ...this.filters });
    }
  }

  removeAllFilters() {
    this.filtersSubject.next(emptyFilters());
  }

  saveFilters() {
    this.dialog.inputDialog('Save matchmaking filters',
      'For easear overview you can label the selected matchmaking filters, e.g. "Pump producers from Germany"',
      'Label',
      'My matchmaking')
      .subscribe(res => {
        if (res[0]) {
          const entries = Object.entries(this.filters)
            .filter(([_, v]) => v.length > 0);

          this.enterpriseService.saveMatchmaking({
            label: res[1],
            filters: Object.fromEntries(entries)
          }).subscribe(() => {
            this.isSaved = true;
            of(1).pipe(delay(3000)).subscribe(() => this.isSaved = false);
          });
        }
      });
  }
}
