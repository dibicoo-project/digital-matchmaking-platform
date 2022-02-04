import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { combineLatest, Subject } from 'rxjs';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.scss']
})
export class CategoryTreeComponent implements OnInit {

  private selectedIds$ = new Subject<string[]>();

  @Input()
  set selectedIds(val: string[]) {
    this.selectedIds$.next(val);
  }

  dataSource = new MatTreeNestedDataSource<Category>();
  treeControl = new NestedTreeControl<Category>(node => node.childrenCategories);

  constructor(private categories: CategoryService) { }

  ngOnInit(): void {
    combineLatest([
      this.selectedIds$,
      this.categories.tree$
    ]).subscribe(([selectedIds, tree]) => {
      const filterChildren = (roots: Category[]) => {
        const res = (roots || [])
          .filter(one => selectedIds.includes(one.id))
          .map(one => ({
            ...one,
            childrenCategories: filterChildren(one.childrenCategories)
          }));
        return res;
      };

      this.dataSource.data = filterChildren(tree);
    });
  }

  hasChild(_: number, node: Category): boolean {
    return !!node.childrenCategories && node.childrenCategories.length > 0;
  }

}
