import { Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Category } from '@domain/categories/category-domain';
import { CategoryService } from '@domain/categories/category.service';

@Component({
  selector: 'app-category-select',
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
  mainCategory: Category;
  value: {
    mainCategoryId: string;
    categoryId: string;
  };

  constructor(public categories: CategoryService) { }

  private changed = (val) => null;

  ngOnInit(): void {
  }

  setMainCategory(cat: Category) {
    this.mainCategory = cat;
    this.value = { mainCategoryId: cat?.id || null, categoryId: null };
    this.changed(this.value);
  }

  setCategory(cat: Category) {
    this.value = { ...this.value, categoryId: cat.id };
    this.changed(this.value);
  }

  writeValue(obj: any): void {
    this.value = {
      mainCategoryId: obj?.mainCategoryId || null,
      categoryId: obj?.mainCategoryId ? obj?.categoryId : null
    };
    this.categories.treeById$(obj?.mainCategoryId)
      .subscribe(cat => {
        this.mainCategory = cat;
      });
  }

  registerOnChange(fn: any): void {
    this.changed = fn;
  }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void {
    throw new Error('Method not implemented.');
  }

}
