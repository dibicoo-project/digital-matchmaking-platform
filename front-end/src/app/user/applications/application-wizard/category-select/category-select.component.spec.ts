import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryService } from '@domain/categories/category.service';
import { BehaviorSubject, EMPTY, of } from 'rxjs';

import { CategorySelectComponent } from './category-select.component';

describe('CategorySelectComponent', () => {
  let component: CategorySelectComponent;
  let fixture: ComponentFixture<CategorySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategorySelectComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            tree$: EMPTY,
            treeById$: () => EMPTY
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should write full value', () => {
    component.writeValue({ mainCategoryId: '111', categoryId: '222', random: '999' });
    expect(component.value).toEqual({ mainCategoryId: '111', categoryId: '222' });
  });

  it('should write partial value', () => {
    component.writeValue({ mainCategoryId: '111', random: '999' });
    expect(component.value).toEqual({ mainCategoryId: '111', categoryId: undefined });
  });

  it('should fetch main category when value written', () => {
    const service = TestBed.inject(CategoryService);
    spyOn(service, 'treeById$').and.returnValue(of({ id: '987' }));
    component.writeValue({ mainCategoryId: '111', random: '999' });
    expect(component.value).toEqual({ mainCategoryId: '111', categoryId: undefined });
    expect(service.treeById$).toHaveBeenCalledWith('111');
    expect(component.mainCategory).toEqual({ id: '987' });
  });

  it('should set main category', () => {
    const spy = jasmine.createSpy();
    component.registerOnChange(spy);
    component.value = { categoryId: 'test' } as any;
    component.setMainCategory({ id: '123' });
    expect(spy).toHaveBeenCalled();
    expect(component.value).toEqual({ mainCategoryId: '123', categoryId: null });
  });

  it('should set category', () => {
    const spy = jasmine.createSpy();
    component.registerOnChange(spy);
    component.value = { mainCategoryId: 'test' } as any;
    component.setCategory({ id: '123' });
    expect(spy).toHaveBeenCalled();
    expect(component.value).toEqual({ mainCategoryId: 'test', categoryId: '123' });
  });
});
