import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Application } from '@domain/application-domain';
import { Category } from '@domain/categories/category-domain';
import { CategoryService } from '@domain/categories/category.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-application-card',
  templateUrl: './application-card.component.html',
  styleUrls: ['./application-card.component.scss']
})
export class ApplicationCardComponent implements OnInit, OnChanges {

  @Input()
  app: Application;

  @Input()
  cardClass: string;

  mainCategory: Category;
  category: Category;

  constructor(private categories: CategoryService) { }

  ngOnChanges(): void {
    this.categories.byId$(this.app.mainCategoryId).subscribe(c => this.mainCategory = c);
    this.categories.byId$(this.app.categoryId).subscribe(c => this.category = c);
  }

  ngOnInit(): void {
  }
}
