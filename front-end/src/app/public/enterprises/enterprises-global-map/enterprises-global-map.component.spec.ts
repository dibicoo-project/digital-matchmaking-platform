import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { CategoryService } from '@domain/categories/category.service';
import { EMPTY, of } from 'rxjs';
import { Enterprise } from '@domain/enterprises/enterprise-domain';

import { EnterprisesGlobalMapComponent } from './enterprises-global-map.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CountriesService } from '@domain/countries/countries.service';
import { Country } from '@domain/countries/country-domain';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';

describe('EnterprisesGlobalMapComponent', () => {
  let component: EnterprisesGlobalMapComponent;
  let fixture: ComponentFixture<EnterprisesGlobalMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterprisesGlobalMapComponent],
      imports: [],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getEnterprises: () => EMPTY
          }
        },
        {
          provide: CategoryService,
          useValue: {
            getRootCategories: () => EMPTY
          }
        },
        {
          provide: CountriesService,
          useValue: {
            all$: EMPTY
          }
        },
        {
          provide: DiBiCooCookieService,
          useValue: {
            checkMedia: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterprisesGlobalMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get data on ngOnInit', () => {
    const serviceEnterprises = TestBed.inject(EnterpriseService);
    const serviceCategories = TestBed.inject(CategoryService);
    const globatMapEnterprises: Enterprise[] = [
      { id: '123', companyName: 'Test company 1', categoryIds: ['1', '2'], latlng: [1, 2], displayOnGlobalMap: true },
      { id: '234', companyName: 'Test company 2', categoryIds: ['2', '3'], latlng: [3, 4], displayOnGlobalMap: true },
      { id: '345', companyName: 'Test company 2', categoryIds: ['1', '2'], displayOnGlobalMap: true },
      { id: '456', companyName: 'Test company 3', categoryIds: ['1', '2'], latlng: [3, 4], displayOnGlobalMap: false },
    ] as any;
    const rootCategories = [
      { title: 'Category 1', id: '1', isAD: true },
      { title: 'Category 2', id: '2', isGas: true },
      { title: 'Category 3', id: '3' }
    ];
    spyOn(serviceEnterprises, 'getEnterprises').and.returnValue(of(globatMapEnterprises));
    spyOn(serviceCategories, 'getRootCategories').and.returnValue(of(rootCategories));

    const cookies = TestBed.inject(DiBiCooCookieService);
    spyOn(cookies, 'checkMedia').and.returnValue(true);

    component.ngOnInit();
    expect(serviceEnterprises.getEnterprises).toHaveBeenCalled();
    expect(serviceCategories.getRootCategories).toHaveBeenCalled();
    expect(component.enterprisesVisible.length).toEqual(1);
    expect(component.categories.length).toEqual(rootCategories.length);
    expect(component.selectedCategoryId).toEqual('1');
  });

  it('should open info window on marker click', () => {
    const iw = {};
    component.markerClicked(iw);
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(component['openWindow']).toEqual(iw);
  });

  it('should close info window on map click', () => {
    component.markerClicked();
    // eslint-disable-next-line @typescript-eslint/dot-notation
    expect(component['openWindow']).toBeNull();
  });

  it('should show project markers', () => {
    component.options.push('keyProjects');
    component.enterprisesVisible = [
      { companyName: 'A' } as Enterprise,
      {
        companyName: 'B',
        keyProjects: [
          { title: 'p1', showOnMap: true, latlng: [123, 456] },
          { title: 'p2', showOnMap: true },
        ]
      } as Enterprise,
      {
        companyName: 'C',
        keyProjects: [
          { title: 'p3', showOnMap: true, latlng: [123, 456] },
          { title: 'p4', showOnMap: false, latlng: [123, 456] },
          { title: 'p5', showOnMap: true, latlng: [123, 456] },
          { title: 'wrong', showOnMap: true, latlng: [] },
        ]
      } as Enterprise,
    ];
    component.updateProjectsMarkers();

    expect(component.projectsVisible.length).toBe(3);
    expect(component.projectsVisible[0].title).toBe('p1');
    expect(component.projectsVisible[1].title).toBe('p3');
    expect(component.projectsVisible[2].title).toBe('p5');
  });
});
