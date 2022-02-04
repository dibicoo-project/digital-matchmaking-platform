import { ComponentFixture, TestBed, tick, fakeAsync, waitForAsync } from '@angular/core/testing';
import { CategoryService } from '@domain/categories/category.service';
import { EMPTY, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { CategoriesEditComponent } from './categories-edit.component';
import { LocalStateService } from '@root/app/local-state.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CategoriesEditComponent', () => {
  let component: CategoriesEditComponent;
  let fixture: ComponentFixture<CategoriesEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CategoriesEditComponent],
      imports: [
        RouterTestingModule        
      ],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            getCategories: () => EMPTY,
            addCategory: () => EMPTY,
            editCategory: () => EMPTY,
            deleteCategory: () => EMPTY
          }
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get category list during onInit', () => {
    const localState = TestBed.get(LocalStateService);
    spyOn(localState, 'get').and.returnValue({ testing: true, 123: true });
    spyOn(localState, 'put');

    const service = TestBed.get(CategoryService);
    spyOn(service, 'getCategories').and.returnValue(
      of([
        {title: 'Test1', parentId: null, ancestors: [], id: '123'},
        {title: 'Test2', parentId: null, ancestors: [], id: '234'}
      ]));

    spyOn(component.treeControl, 'expand');

    component.ngOnInit();

    expect(service.getCategories).toHaveBeenCalled();
    expect(component.categories.length).toEqual(2);
    expect(localState.get).toHaveBeenCalledWith('openCategories', {});
    expect(localState.put).toHaveBeenCalledWith('openCategories', { 123: true });
    expect(component.treeControl.expand).toHaveBeenCalledWith(jasmine.objectContaining({ id: '123' }));
  });

  it('should toggle node', fakeAsync(() => {
    const service = TestBed.get(CategoryService);
    spyOn(service, 'getCategories').and.returnValue(
      of([
        {title: 'Test1', parentId: null, ancestors: [], id: '1'},
        {title: 'Test1-sub1', parentId: '1', ancestors: [], id: '11'},
        {title: 'Test1-sub2', parentId: '1', ancestors: [], id: '12'},
        {title: 'Test2', parentId: null, ancestors: [], id: '2'}
      ]));
    component.ngOnInit();
    tick(1); // wait until tree control populates the tree with nodes

    const node = component.treeControl.dataNodes[0];

    const localState = TestBed.get(LocalStateService);
    spyOn(localState, 'get').and.returnValue({ testing: true });
    spyOn(localState, 'put');

    spyOn(component.treeControl, 'expand').and.callThrough();
    spyOn(component.treeControl, 'collapse').and.callThrough();

    component.toggleNode(node);
    expect(localState.get).toHaveBeenCalledWith('openCategories', {});
    expect(component.treeControl.expand).toHaveBeenCalledWith(jasmine.objectContaining({ id: '1' }));
    expect(localState.put).toHaveBeenCalledWith('openCategories', { 1: true, testing: true });

    component.toggleNode(node);
    expect(localState.get).toHaveBeenCalledWith('openCategories', {});
    expect(component.treeControl.collapse).toHaveBeenCalledWith(jasmine.objectContaining({ id: '1' }));
    expect(localState.put).toHaveBeenCalledWith('openCategories', { 1: undefined, testing: true });
  }));
});
