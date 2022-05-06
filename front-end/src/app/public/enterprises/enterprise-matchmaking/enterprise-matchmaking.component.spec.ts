import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { CategoryService } from '@domain/categories/category.service';
import { CountriesService } from '@domain/countries/countries.service';
import { DialogService } from '@domain/dialog.service';
import { Enterprise } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { emptyFilters } from '@domain/enterprises/filters-domain';
import { AuthService } from '@root/app/auth/auth.service';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';

import { EnterpriseMatchmakingComponent } from './enterprise-matchmaking.component';

describe('EnterpriseMatchmakingComponent', () => {
  let component: EnterpriseMatchmakingComponent;
  let fixture: ComponentFixture<EnterpriseMatchmakingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseMatchmakingComponent],
      imports: [MatMenuModule, RouterTestingModule],
      providers: [
        {
          provide: CountriesService,
          useValue: {
            all$: of([
              { region: 'A', subregion: 'A1', name: 'Lorem' },
              { region: 'A', subregion: 'A2', name: 'Magnam' },
              { region: 'A', subregion: 'A2', name: 'Porro' },
              { region: 'B', subregion: 'B1', name: 'Eratta' },
              { region: 'C', subregion: 'C1', name: 'Illum' }
            ])
          }
        },
        {
          provide: CategoryService,
          useValue: {
            all$: of([])
          }
        },
        {
          provide: EnterpriseService,
          useValue: {
            public$: new BehaviorSubject([]),
            fetchPublic: () => null,
            saveMatchmaking: () => EMPTY
          }
        },
        {
          provide: AuthService,
          useValue: {}
        },
        {
          provide: DialogService,
          useValue: {
            inputDialog: () => EMPTY
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseMatchmakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should filter', () => {
    let public$: Subject<Enterprise[]>;
    beforeEach(() => {
      const service = TestBed.inject(EnterpriseService);
      public$ = (service.public$ as Subject<Enterprise[]>);
    });

    it('by business field', (done) => {
      public$.next([
        { companyName: 'A', categoryIds: ['111', '222'] },
        { companyName: 'B', categoryIds: ['222', '333'] },
        { companyName: 'C', categoryIds: ['444', '555'] },
        { companyName: 'D', categoryIds: ['555'] },
      ] as Enterprise[]);

      component.addFilter('business-field', { value: '111' } as any);
      component.addFilter('business-field', { value: '333' } as any);

      component.filteredCompanies$.subscribe(list => {
        expect(list.map(c => c.companyName)).toEqual(['A', 'B']);
        done();
      });
    });

    it('by profile updates', (done) => {
      public$.next([
        { companyName: 'A', changedTs: new Date('2021-02-20') },
        { companyName: 'B', changedTs: new Date('2021-02-21') },
        { companyName: 'C', changedTs: new Date('2021-02-22T23:59') },
        { companyName: 'D', changedTs: new Date('2021-02-23T00:00') },
      ] as Enterprise[]);

      jasmine.clock().mockDate(new Date('2021-02-25T10:00'));
      component.addFilter('profile-updates', { value: 2 } as any);

      component.filteredCompanies$.subscribe(list => {
        expect(list.map(c => c.companyName)).toEqual(['D']);
        jasmine.clock().uninstall();
        done();
      });
    });


    ['company', 'project'].forEach(item => {
      describe(`by ${item}`, () => {
        beforeEach(() => {
          const list = [
            { companyName: 'A', location: { country: 'Lorem' }, keyProjects: [{ location: { country: 'Lorem' } }] },
            { companyName: 'B', location: { country: 'Magnam' }, keyProjects: [{ location: { country: 'Magnam' } }] },
            { companyName: 'C', location: { country: 'Porro' }, keyProjects: [{ location: { country: 'Porro' } }] },
            { companyName: 'D', location: { country: 'Eratta' }, keyProjects: [{ location: { country: 'Eratta' } }] },
            { companyName: 'E', location: { country: 'Illum' }, keyProjects: [{ location: { country: 'Illum' } }] },
          ] as Enterprise[];

          public$.next(list);
        });

        it('region', (done) => {
          component.addFilter(`${item}-region` as any, { type: 'region', value: 'A' } as any);
          component.filteredCompanies$.subscribe(list => {
            expect(list.map(c => c.companyName)).toEqual(['A', 'B', 'C']);
            done();
          });
        });

        it('subregion', (done) => {
          component.addFilter(`${item}-region` as any, { type: 'subregion', value: 'A2' } as any);
          component.filteredCompanies$.subscribe(list => {
            expect(list.map(c => c.companyName)).toEqual(['B', 'C']);
            done();
          });
        });

        it('country', (done) => {
          component.addFilter(`${item}-region` as any, { type: 'country', value: 'Eratta' } as any);
          component.filteredCompanies$.subscribe(list => {
            expect(list.map(c => c.companyName)).toEqual(['D']);
            done();
          });
        });
      });
    });
  });

  it('should save filters', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'lorem']));
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'saveMatchmaking').and.returnValue(of(null));

    component.filtersSubject.next(emptyFilters());
    component.saveFilters();

    expect(dialog.inputDialog).toHaveBeenCalled();
    expect(service.saveMatchmaking).toHaveBeenCalledWith({ label: 'lorem', filters: {} } as any);
  });
});
