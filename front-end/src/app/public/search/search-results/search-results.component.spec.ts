import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from '@domain/applications/application.service';
import { CategoryService } from '@domain/categories/category.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { EMPTY, of, throwError } from 'rxjs';
import { SearchService } from '../search.service';

import { SearchResultsComponent } from './search-results.component';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchResultsComponent],
      providers: [
        {
          provide: SearchService,
          useValue: {
            getResults: () => EMPTY
          }
        },
        {
          provide: EnterpriseService,
          useValue: {
            fetchPublic: () => null
          }
        },
        {
          provide: ApplicationService,
          useValue: {
            fetchPublic: () => null
          }
        },
        {
          provide: CategoryService,
          useValue: {

          }
        }
      ],
      imports: [RouterTestingModule, ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change query params', fakeAsync(() => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.searchControl.setValue('test test');

    tick(299);
    expect(router.navigate).not.toHaveBeenCalled();
    tick(1);
    expect(router.navigate).toHaveBeenCalledWith([], { queryParams: { q: 'test test' } });
  }));

  it('should perform search using query params', () => {
    const service = TestBed.inject(SearchService);
    spyOn(service, 'getResults').and.returnValue(of({ companies: [], applications: [] }));

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ kind: 'all' });
    (route.queryParamMap as any).next({ q: 'test test' });

    expect(service.getResults).toHaveBeenCalledWith('all', 'test test');
  });

  it('should handle search errors', () => {
    const service = TestBed.inject(SearchService);
    spyOn(service, 'getResults').and.returnValue(throwError('test'));

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ kind: 'all' });
    (route.queryParamMap as any).next({ q: 'test test' });

    expect(service.getResults).toHaveBeenCalledWith('all', 'test test');
    expect(component.results).toEqual({});
  });
});
