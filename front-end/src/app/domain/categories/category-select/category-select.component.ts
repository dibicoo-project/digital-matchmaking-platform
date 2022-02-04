import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { onlyUnique } from '@domain/utils';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

@Component({
  selector: 'app-category-select-multi',
  templateUrl: './category-select.component.html',
  styleUrls: ['./category-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectComponent),
      multi: true
    }
  ]
})
export class CategorySelectComponent implements OnInit, ControlValueAccessor {
  private onChange: any = () => { };
  private onTouched: any = () => { };

  root: Category = { title: 'Main categories' };
  currentCategory: Category;
  allCategories: Category[];
  selectedIds: string[] = [];

  get onlyParentIds() {
    return this.allCategories.flatMap(one => one.ancestors).filter(onlyUnique);
  }

  constructor(public categories: CategoryService) { }

  ngOnInit(): void {
    this.categories.all$.subscribe(all => this.allCategories = all);

    this.categories.tree$.subscribe(tree => {
      this.root.childrenCategories = tree;
      this.currentCategory = this.root;
    });
  }

  toggleSelected(id: string) {
    const idx = this.selectedIds.indexOf(id);
    if (idx >= 0) {
      let newSelectedIds = this.selectedIds.filter(one => one !== id);
      const ancestors = this.getCategoryById(id).ancestors.map(one => this.getCategoryById(one));

      ancestors.reverse().forEach(one => {
        const childrenIds = this.allCategories
          .filter(cat => cat.parentId === one.id)
          .map(cat => cat.id);

        if (!newSelectedIds.some(sel => childrenIds.includes(sel))) {
          newSelectedIds = newSelectedIds.filter(s => s !== one.id);
        }
      });

      this.selectedIds = newSelectedIds;

    } else {
      this.selectedIds = [
        ...this.selectedIds,
        id,
        ...this.allCategories.find(c => c.id === id).ancestors
      ].filter(onlyUnique);
    }
    this.onChange(this.selectedIds);
    this.onTouched();
  }

  isSelected(id: string) {
    return this.selectedIds.includes(id);
  }

  getSelectedCategories() {
    return this.allCategories?.filter(one => this.selectedIds.includes(one.id))
      .filter(one => !this.onlyParentIds.includes(one.id))
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  getCategoryById(id: string) {
    return this.allCategories.find(one => one.id === id);
  }

  writeValue(ids: any): void {
    this.selectedIds = ids;
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
