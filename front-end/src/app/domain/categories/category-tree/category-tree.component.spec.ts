import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Category } from '../category-domain';
import { CategoryService } from '../category.service';

import { CategoryTreeComponent } from './category-tree.component';

describe('CategoryTreeComponent', () => {
  let component: CategoryTreeComponent;
  let fixture: ComponentFixture<CategoryTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoryTreeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            tree$: of([
              {
                id: '1', childrenCategories: [
                  { id: '11' },
                  {
                    id: '12', childrenCategories: [
                      { id: '121' },
                      { id: '122' }
                    ]
                  },
                  { id: '13' }
                ]
              },
              {
                id: '2', childrenCategories: [
                  { id: '21' },
                  {
                    id: '22', childrenCategories: [
                      { id: '221' },
                      { id: '222' }
                    ]
                  }
                ]
              }
            ] as Category[])
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display only selected categories', () => {
    expect(component.dataSource.data).toEqual([]);
    component.selectedIds = ['121', '12', '1', '22', '2'];

    expect(component.dataSource.data[0].id).toEqual('1');
    expect(component.dataSource.data[0].childrenCategories[0].id).toEqual('12');
    expect(component.dataSource.data[0].childrenCategories[0].childrenCategories[0].id).toEqual('121');
    expect(component.dataSource.data[1].id).toEqual('2');
    expect(component.dataSource.data[1].childrenCategories[0].id).toEqual('22');
  });
});
