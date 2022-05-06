import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { Application } from '@domain/applications/application-domain';
import { ApplicationService } from '@domain/applications/application.service';
import { emptyFilters, Filters } from '@domain/applications/filters-domain';
import { CategoryService } from '@domain/categories/category.service';
import { CountriesService } from '@domain/countries/countries.service';
import { DialogService } from '@domain/dialog.service';
import { AuthService } from '@root/app/auth/auth.service';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';

import { ApplicationMatchmakingComponent } from './application-matchmaking.component';

describe('ApplicationMatchmakingComponent', () => {
  let component: ApplicationMatchmakingComponent;
  let fixture: ComponentFixture<ApplicationMatchmakingComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [ApplicationMatchmakingComponent],
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
          provide: ApplicationService,
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationMatchmakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should filter', () => {
    let public$: Subject<Application[]>;
    beforeEach(() => {
      const service = TestBed.inject(ApplicationService);
      public$ = (service.public$ as Subject<Application[]>);
    });

    it('by business field', (done) => {
      public$.next([
        { id: 'A', categoryId: '100', mainCategoryId: '200' },
        { id: 'B', categoryId: '300', mainCategoryId: '400' },
        { id: 'C', mainCategoryId: '500' },
        { id: 'D', categoryId: '600' },
      ] as Application[]);

      component.addFilter('business-field', { value: '100' } as any);
      component.addFilter('business-field', { value: '400' } as any);

      component.filteredApplications$.subscribe(list => {
        expect(list.map(c => c.id)).toEqual(['A', 'B']);
        done();
      });
    });

    describe(`by target`, () => {
      beforeEach(() => {
        const list = [
          { id: 'A', location: { country: 'Lorem' } },
          { id: 'B', location: { country: 'Magnam' } },
          { id: 'C', location: { country: 'Porro' } },
          { id: 'D', location: { country: 'Eratta' } },
          { id: 'E', location: { country: 'Illum' } },
        ] as Application[];

        public$.next(list);
      });

      it('region', (done) => {
        component.addFilter(`project-region` as any, { type: 'region', value: 'A' } as any);
        component.filteredApplications$.subscribe(list => {
          expect(list.map(a => a.id)).toEqual(['A', 'B', 'C']);
          done();
        });
      });

      it('subregion', (done) => {
        component.addFilter(`project-region` as any, { type: 'subregion', value: 'A2' } as any);
        component.filteredApplications$.subscribe(list => {
          expect(list.map(a => a.id)).toEqual(['B', 'C']);
          done();
        });
      });

      it('country', (done) => {
        component.addFilter(`project-region` as any, { type: 'country', value: 'Eratta' } as any);
        component.filteredApplications$.subscribe(list => {
          expect(list.map(a => a.id)).toEqual(['D']);
          done();
        });
      });
    });
  });

  it('should save filters', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'lorem']));
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'saveMatchmaking').and.returnValue(of(null));

    component.filtersSubject.next(emptyFilters());
    component.saveFilters();

    expect(dialog.inputDialog).toHaveBeenCalled();
    expect(service.saveMatchmaking).toHaveBeenCalledWith({ label: 'lorem', filters: {} } as any);
  });
});

