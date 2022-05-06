import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '@domain/applications/application.service';
import { CategoryService } from '@domain/categories/category.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { combineLatest, EMPTY, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { SearchResults } from '../search-domain';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  results: SearchResults = {};
  kind: string;

  constructor(private service: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    public companies: EnterpriseService,
    public applications: ApplicationService,
    public categories: CategoryService) { }

  searchControl: FormControl = new FormControl('');

  get emptyResults() {
    return this.results.companies?.length === 0 &&
      this.results.applications?.length === 0;
  }

  get kindLabel() {
    switch (this.kind) {
      case 'enterprises':
        return 'Search in company profiles';
      case 'applications':
        return 'Search in business opportunities';
      default:
        return 'Search everywhere';
    }
  }

  ngOnInit(): void {
    this.companies.fetchPublic();
    this.applications.fetchPublic();

    this.searchControl.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(q => {
      this.router.navigate([], { queryParams: { q } });
    });

    combineLatest([
      this.route.paramMap.pipe(
        map(params => params.get('kind')),
        tap(kind => this.kind = kind)
      ),
      this.route.queryParamMap.pipe(
        map(params => params.get('q')),
        tap(q => this.searchControl.setValue(q, { emitEvent: false })),
        filter(q => !!q)
      )
    ])
      .pipe(
        switchMap(([kind, query]) =>
          this.service.getResults(kind, query).pipe(
            catchError(err => {
              console.error(err);
              return of({});
            })
          )
        )
      )
      .subscribe(results => {
        this.results = results;
        this.results.companies?.forEach(item => {
          item.flatTerms = Object.keys(item.terms).join(', ');
        });
        this.results.applications?.forEach(item => {
          item.flatTerms = Object.keys(item.terms).join(', ');
        });
      });
  }

}
