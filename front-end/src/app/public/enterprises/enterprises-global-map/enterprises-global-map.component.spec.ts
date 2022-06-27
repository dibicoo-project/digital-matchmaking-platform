import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { CategoryService } from '@domain/categories/category.service';
import { EMPTY } from 'rxjs';

import { EnterprisesGlobalMapComponent } from './enterprises-global-map.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';
import { Loader } from '@googlemaps/js-api-loader';

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
          provide: DiBiCooCookieService,
          useValue: {
            checkMedia: () => null
          }
        },
        {
          provide: Loader,
          useValue: {
            load: () => new Promise(null)
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
});
