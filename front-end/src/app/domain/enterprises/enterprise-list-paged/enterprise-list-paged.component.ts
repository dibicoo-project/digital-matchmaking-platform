import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilObjChanged } from '@domain/rxjs-utils';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Enterprise } from '../enterprise-domain';

type SortType = 'ts' | 'cn' | 'cnr';

interface State {
  page: number;
  pageSize: number;
  sort: SortType;
}

@Component({
  selector: 'app-enterprise-list-paged',
  templateUrl: './enterprise-list-paged.component.html',
  styleUrls: ['./enterprise-list-paged.component.scss'],
})
export class EnterpriseListPagedComponent implements OnInit {

  private defaultPageSize = 12;

  constructor(private router: Router, private route: ActivatedRoute) { }

  @Input()
  list$: Observable<Enterprise[]>;
  pagedList$: Observable<Enterprise[]>;

  private stateSubject = new BehaviorSubject<State>({ page: 0, pageSize: this.defaultPageSize, sort: 'ts' });

  get state() {
    return this.stateSubject.getValue();
  }

  get currentSort() {
    return this.state.sort;
  }

  set currentSort(sort: SortType) {
    this.stateSubject.next({ ...this.state, sort, page: 0 });
  }

  get currentPage() {
    return this.state.page;
  }

  get currentPageSize() {
    return this.state.pageSize;
  }

  updatePage(page: number, pageSize: number) {
    if (this.state.pageSize !== pageSize) {
      this.stateSubject.next({ ...this.state, pageSize, page: 0 });
    } else {
      this.stateSubject.next({ ...this.state, page });
    }
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const sort = params.get('s') as SortType;
      const page = parseInt(params.get('p'));
      const pageSize = parseInt(params.get('ipp'));

      this.stateSubject.next({ sort: sort || 'ts', page: page || 0, pageSize: pageSize || this.defaultPageSize });
    });

    this.pagedList$ = combineLatest([
      this.list$,
      this.stateSubject.pipe(distinctUntilObjChanged())
    ]).pipe(
      map(([all, { sort, page, pageSize }]) => {
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

        return list.slice(page * pageSize, (page + 1) * pageSize);
      }),
      shareReplay(1)
    );

    this.stateSubject.pipe(distinctUntilObjChanged())
      .subscribe(({ sort, page, pageSize }) => {
        this.router.navigate([], {
          queryParams: {
            s: sort !== 'ts' ? sort : null,
            p: page > 0 ? page : null,
            ipp: pageSize !== this.defaultPageSize ? pageSize : null
          },
          queryParamsHandling: 'merge',
          state: { noScroll: true }
        });
      });
  }

}
