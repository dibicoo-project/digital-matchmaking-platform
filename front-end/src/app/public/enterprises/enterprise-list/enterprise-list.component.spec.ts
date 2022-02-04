import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { EnterpriseListComponent } from './enterprise-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CategoryService } from '@domain/categories/category.service';
import { MatBadgeModule } from '@angular/material/badge';
import { DialogService } from '@domain/dialog.service';

describe('EnterpriseListComponent', () => {
  let component: EnterpriseListComponent;
  let fixture: ComponentFixture<EnterpriseListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseListComponent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatBadgeModule
      ],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            fetchPublic: () => null,
            public$: of([
              { id: '1', companyName: 'Test 1', categoryIds: [] },
              { id: '2', companyName: 'Test 2', categoryIds: ['a1'] },
              { id: '3', companyName: 'Test 3', categoryIds: [] }
            ])
          }
        },
        {
          provide: CategoryService,
          useValue: {
            getCategories: () => of([
              { id: 'a', parentId: null },
              { id: 'a1', parentId: 'a' },
              { id: 'a1x', parentId: 'a1' },
              { id: 'a1y', parentId: 'a1' },
              { id: 'a1z', parentId: 'a1' },
              { id: 'a2', parentId: 'a' }
            ])
          }
        },
        {
          provide: DialogService,
          useValue: {
            open: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get full enterprise list by default', () => {
    component.filteredCompanies$.subscribe(list => {
      expect(list.length).toEqual(3);
      expect(component.currentCategory).toBeUndefined();
      expect(component.subCategories).toEqual([jasmine.objectContaining({ id: 'a' })]);
    });
  });

  it('should get enterprise list when category selected', () => {
    const route: any = TestBed.inject(ActivatedRoute);
    route.queryParamMap.next({ categoryId: 'a1' });

    component.filteredCompanies$.subscribe(list => {
      expect(list.length).toEqual(1);
      expect(component.currentCategory).toEqual(jasmine.objectContaining({ id: 'a1' }));
      expect(component.subCategories.length).toBe(3);
    });
  });

  it('should get enterprise list when query entered', fakeAsync(() => {
    // fake subscriber to "warm up" the startWith('') + shareReplay(1) operator chain
    // shareReplay is not caching if there is no subscribers
    component.filteredCompanies$.subscribe(_ => null);

    component.searchControl.setValue('2');
    tick(250); // debounce input

    component.filteredCompanies$
      .subscribe(list => {
        expect(list.length).toEqual(1);
        expect(list[0].companyName).toEqual('Test 2');
      });
  }));


});
