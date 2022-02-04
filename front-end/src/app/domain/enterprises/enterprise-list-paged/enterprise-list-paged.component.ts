import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilObjChanged } from '@domain/rxjs-utils';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Enterprise } from '../enterprise-domain';

type SortType = 'ts' | 'cn' | 'cnr';

interface State {
  page: number;
  sort: SortType;
}

@Component({
  selector: 'app-enterprise-list-paged',
  templateUrl: './enterprise-list-paged.component.html',
  styleUrls: ['./enterprise-list-paged.component.scss'],
})
export class EnterpriseListPagedComponent implements OnInit {

  private pageSize = 12;

  constructor(private router: Router, private route: ActivatedRoute) { }

  @Input()
  list$: Observable<Enterprise[]>;
  pagedList$: Observable<Enterprise[]>;

  stateSubject = new BehaviorSubject({ page: 0, sort: 'ts' } as State);

  get currentSort() {
    return this.stateSubject.getValue().sort;
  }

  set currentSort(sort: SortType) {
    this.stateSubject.next({ sort, page: 0 });
  }

  get currentPage() {
    return this.stateSubject.getValue().page;
  }

  set currentPage(page: number) {
    this.stateSubject.next({ ...this.stateSubject.getValue(), page });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const sort = params.get('s') as SortType;
      const page = parseInt(params.get('p'), 10);

      this.stateSubject.next({ sort: sort || 'ts', page: page || 0 });
    });

    this.pagedList$ = combineLatest([
      this.list$,
      this.stateSubject.pipe(distinctUntilObjChanged())
    ]).pipe(
      map(([all, { sort, page }]) => {
        const list = [...all];
        list.sort((a, b) => {
          switch (sort) {
            case 'ts':
              return a.changedTs > b.changedTs ? -1 : 1;
            case 'cn':
              return a.companyName.localeCompare(b.companyName);
            case 'cnr':
              return -a.companyName.localeCompare(b.companyName);
          }
          return 0;
        });

        return list.slice(page * this.pageSize, (page + 1) * this.pageSize);
      }),
      shareReplay(1)
    );

    this.stateSubject.pipe(distinctUntilObjChanged()).subscribe(({ sort, page }) => {
      this.router.navigate([], {
        queryParams: {
          s: sort !== 'ts' ? sort : null,
          p: page > 0 ? page : null
        },
        queryParamsHandling: 'merge',
        state: { noScroll: true }
      });
    });
  }

}
