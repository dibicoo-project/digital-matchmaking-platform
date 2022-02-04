import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

import { CategoryChartComponent } from './category-chart.component';

describe('CategoryChartComponent', () => {
  let component: CategoryChartComponent;
  let fixture: ComponentFixture<CategoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryChartComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            all$: new Subject<Category[]>()
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show all categories', () => {
    const service = TestBed.inject(CategoryService);

    component.showAllCategories = true;
    (service.all$ as Subject<any>).next([{}, {}, {}]);

    expect(component.chart.data().length).toBe(4);
  });

  it('should show specified categories', () => {
    const service = TestBed.inject(CategoryService);

    component.categoryIds = ['a', 'c'];
    (service.all$ as Subject<any>).next([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    expect(component.chart.data().map(i => i.id)).toEqual(['root', 'a', 'c']);
  });
});
