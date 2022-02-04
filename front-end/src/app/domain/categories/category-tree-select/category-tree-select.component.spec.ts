import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY, of } from 'rxjs';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

import { CategoryTreeSelectComponent } from './category-tree-select.component';

describe('CategoryTreeSelectComponent', () => {
  let component: CategoryTreeSelectComponent;
  let fixture: ComponentFixture<CategoryTreeSelectComponent>;
  let categories: Category[];

  beforeEach(waitForAsync(() => {
    categories = [
      { title: 'Root A', id: 'a', parentId: null },
      { title: 'Child A1', id: 'a1', parentId: 'a' },
      { title: 'Child A2', id: 'a2', parentId: 'a' },
      { title: 'Root B', id: 'b', parentId: null },
      { title: 'Child B1', id: 'b1', parentId: 'b' },
      { title: 'Grand child B1a', id: 'b1a', parentId: 'b1' },
      { title: 'Grand child B1b', id: 'b1b', parentId: 'b1' },
      { title: 'Child B2', id: 'b2', parentId: 'b' },
    ] as Category[];

    TestBed.configureTestingModule({
      declarations: [CategoryTreeSelectComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getCategories: () => of(categories)
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTreeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should select node with parent', () => {
    component.nodeClicked(categories.find(c => c.id === 'a1'));
    expect(component.selectedCategories).toEqual(['a', 'a1']);
  });

  it('should select node with children', () => {
    component.nodeClicked(categories.find(c => c.id === 'b1'));
    expect(component.selectedCategories).toEqual(['b', 'b1', 'b1a', 'b1b']);
  });
});
