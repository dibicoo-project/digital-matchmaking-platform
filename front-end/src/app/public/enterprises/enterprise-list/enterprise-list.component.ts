import { Component, OnInit } from '@angular/core';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { CategoryService } from '@domain/categories/category.service';
import { Category } from '@domain/categories/category-domain';
import { combineLatest } from 'rxjs';
import { DialogService } from '@domain/dialog.service';

@Component({
  selector: 'app-enterprise-list',
  templateUrl: './enterprise-list.component.html',
  styleUrls: ['./enterprise-list.component.scss']
})
export class EnterpriseListComponent implements OnInit {

  constructor(public service: EnterpriseService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: DialogService) { }

  currentCategory: Category;
  ancCategories: Category[];
  subCategories: Category[];

  categoryId$ = this.route.queryParamMap.pipe(
    map(paramMap => paramMap.get('categoryId')),
    distinctUntilChanged()
  );

  searchControl: FormControl = new FormControl('');
  searchQuery$ = this.searchControl.valueChanges.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    startWith(''),
  );

  filteredCompanies$ = combineLatest([
    this.service.public$,
    this.categoryId$,
    this.searchQuery$,
  ]).pipe(
    map(([all, catId, query]) => {
      const res = all.filter(one =>
        (catId == null || one.categoryIds.includes(catId))
        && new RegExp(query, 'i').test(one.companyName)
      );

      return res;
    }),
    shareReplay(1)
  );

  ngOnInit() {
    this.service.fetchPublic();

    combineLatest([
      this.categoryService.getCategories(),
      this.service.public$,
      this.categoryId$
    ]).subscribe(([catList, entList, id]) => {
      this.subCategories = catList.filter(c => c.parentId === id)
        .map(c => {
          const numCompanies = entList.filter(e => e.categoryIds.includes(c.id)).length;
          const numChildren = catList.filter(s => s.parentId === c.id).length;
          return { ...c, numCompanies, numChildren };
        });

      this.currentCategory = catList.find(c => c.id === id);
      if (this.currentCategory) {
        this.currentCategory.numCompanies = entList.filter(e => e.categoryIds.includes(id)).length;
        this.ancCategories = (this.currentCategory.ancestors || []).map(aid => catList.find(c => c.id === aid));
      } else {
        this.ancCategories = [];
      }
    });
  }

  pageChanged(page) {
    console.log('page', page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { p: page ? page : undefined },
      queryParamsHandling: 'merge',
      state: { noScroll: true }
    });
  }

  sortChanged(sort) {
    console.log(sort);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { s: sort, p: undefined },
      queryParamsHandling: 'merge',
      state: { noScroll: true }
    });
  }

  showTree(ref: any) {
    this.dialog.open(ref, {maxWidth: '95vw', width: '95vw', autoFocus: false});
  }

  categorySelected(id) {
    this.router.navigate([], { queryParams: { categoryId: id } });
  }

}
