import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-tree-select',
  templateUrl: './category-tree-select.component.html',
  styleUrls: ['./category-tree-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoryTreeSelectComponent),
      multi: true
    }
  ]
})
export class CategoryTreeSelectComponent implements OnInit, ControlValueAccessor {

  dataSource = new MatTreeNestedDataSource<Category>();
  treeControl = new NestedTreeControl<Category>(node => node.childrenCategories);

  private categories: Category[];
  private _selectedCategories$ = new BehaviorSubject<string[]>([]);

  get selectedCategories() {
    return this.categories?.filter(one => one.isSelected).map(one => one.id);
  }

  set selectedCategories(val: string | string[]) {
    const ids = (val instanceof Array) ? val : [val];
    this._selectedCategories$.next(ids);
  }

  private onChange: any = () => { };
  private onTouched: any = () => { };

  constructor(private service: CategoryService) { }

  ngOnInit(): void {
    this.service.getCategories().subscribe(list => {
      this.categories = list;

      const fillChildren = (parentId: any): Category[] => {
        const children = list.filter(one => one.parentId === parentId || one.parentId === null && parentId === null);
        children.forEach(one => one.childrenCategories = fillChildren(one.id));
        return children;
      };

      this.dataSource.data = fillChildren(null);

      // open root categories
      this.categories.filter(c => c.parentId == null).forEach(c => this.treeControl.expand(c));

      // process selected categories only when the tree is created
      this._selectedCategories$.subscribe(ids => {
        this.categories.forEach(c => {
          c.isSelected = ids.includes(c.id);
        });
      });

    });
  }

  hasChild(_: number, node: Category): boolean {
    return !!node.childrenCategories && node.childrenCategories.length > 0;
  }

  isExpanded(node: Category): boolean {
    return this.treeControl.isExpanded(node);
  }

  private descendantsAllSelected(node: Category) {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.length > 0 && descendants.every(child => child.isSelected);
    return result;
  }

  private descendantsAnySelected(node: Category) {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.length > 0 && descendants.some(child => child.isSelected);
    return result;
  }

  descendantsPartiallySelected(node: Category) {
    return this.descendantsAnySelected(node) && !this.descendantsAllSelected(node);
  }

  private updateNode(node: Category, value: boolean) {
    node.isSelected = value;
    this.treeControl.getDescendants(node)
      .forEach(one => one.isSelected = value);

    const updateParent = (n: Category) => {
      if (n.parentId === null) {
        return;
      }
      const parent = this.categories.find(c => c.id === n.parentId);
      parent.isSelected = this.descendantsAnySelected(parent);
      updateParent(parent);
    };

    updateParent(node);
  }

  nodeClicked(node: Category) {
    this.updateNode(node, !node.isSelected);
    this.onChange(this.selectedCategories);
    this.onTouched();
  }

  writeValue(ids: string | string[]): void {
    this.selectedCategories = ids;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }
}
