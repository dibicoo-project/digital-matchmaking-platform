import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { Application, FilterDefinition, FilterGroup, Filters, FilterType } from '@domain/application-domain';
import { ApplicationService } from '@domain/application.service';
import { CategoryService } from '@domain/categories/category.service';
import { CountriesService } from '@domain/countries/countries.service';
import { Country } from '@domain/countries/country-domain';
import { CountrySelectComponent } from '@domain/countries/country-select/country-select.component';
import { DialogService } from '@domain/dialog.service';
import { AuthService } from '@root/app/auth/auth.service';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { delay, map, shareReplay } from 'rxjs/operators';


const emptyFilters = () => ({
  'business-field': [],
  'project-region': [],
}) as Filters;


@Component({
  selector: 'app-application-matchmaking',
  templateUrl: './application-matchmaking.component.html',
  styleUrls: ['./application-matchmaking.component.scss']
})
export class ApplicationMatchmakingComponent implements OnInit {

  isSaved = false;

  constructor(
    public countriesService: CountriesService,
    public categories: CategoryService,
    public applicationService: ApplicationService,
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
      || this.filters['project-region'].length > 0;
  }

  getSelectedFilterCount(group: FilterGroup, ...types: FilterType[]) {
    return this.filters[group].filter(f => types.length === 0 || types.includes(f.type)).length;
  }

  filteredApplications$ = combineLatest([
    this.applicationService.public$,
    this.filtersSubject.asObservable(),
    this.countriesService.all$,
  ]).pipe(
    map(([all, filters, countries]: [Application[], Filters, Country[]]) => {
      const companies = all.filter(one => {
        let res = true;

        if (res && filters['business-field'].length > 0) {
          res = filters['business-field']
            .map(f => f.value)
            .some((id: string) => one.mainCategoryId === id || one.categoryId === id);
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
            .some(country => one.location.country === country);
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
    this.applicationService.fetchPublic();

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
    const name = [
      this.filters['business-field']?.map(f => f.label)?.join(' or '),
      this.filters['project-region']?.map(f => f.value)?.join(' or ')
    ].filter(f => !!f)
    .join(' in ');

    this.dialog.inputDialog('Save matchmaking filters',
      'For easear overview you can label the selected matchmaking filters',
      'Label',
      name)
      .subscribe(res => {
        if (res[0]) {
          const entries = Object.entries(this.filters)
            .filter(([_, v]) => v.length > 0);

          this.applicationService.saveMatchmaking({
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
