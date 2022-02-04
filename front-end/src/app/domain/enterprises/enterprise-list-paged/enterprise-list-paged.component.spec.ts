import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Enterprise } from '../enterprise-domain';

import { EnterpriseListPagedComponent } from './enterprise-list-paged.component';

describe('EnterpriseListPagedComponent', () => {
  let component: EnterpriseListPagedComponent;
  let fixture: ComponentFixture<EnterpriseListPagedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseListPagedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [RouterTestingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseListPagedComponent);

    component = fixture.componentInstance;
    component.list$ = of([
      { companyName: 'A', changedTs: new Date('2021-02-20') },
      { companyName: 'B', changedTs: new Date('2021-02-15') },
      { companyName: 'C', changedTs: new Date('2021-02-23') },
      { companyName: 'D', changedTs: new Date('2021-02-22') },
      { companyName: 'E', changedTs: new Date('2021-02-10') },
    ] as Enterprise[]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should sort', () => {
    it('by profile updates', (done) => {
      component.currentSort = 'ts';
      component.pagedList$.subscribe(list => {
        expect(list.map(c => c.companyName)).toEqual(['C', 'D', 'A', 'B', 'E']);
        done();
      });
    });

    it('by company name', (done) => {
      component.currentSort = 'cn';
      component.pagedList$.subscribe(list => {
        expect(list.map(c => c.companyName)).toEqual(['A', 'B', 'C', 'D', 'E']);
        done();
      });
    });

    it('by company name (reverse)', (done) => {
      component.currentSort = 'cnr';
      component.pagedList$.subscribe(list => {
        expect(list.map(c => c.companyName)).toEqual(['E', 'D', 'C', 'B', 'A']);
        done();
      });
    });
  });

  it('should show companies in pages', (done) => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['pageSize'] = 2;
    component.currentSort = 'cn';
    component.currentPage = 1;

    component.pagedList$.subscribe(list => {
      expect(list.map(c => c.companyName)).toEqual(['C', 'D']);
      done();
    });
  });
});
