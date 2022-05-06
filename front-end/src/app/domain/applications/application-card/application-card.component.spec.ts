import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { ApplicationCardComponent } from './application-card.component';
import { LocationTextComponent } from '@domain/location/location-text/location-text.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CategoryService } from '@domain/categories/category.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('ApplicationCardComponent', () => {
  let component: ApplicationCardComponent;
  let fixture: ComponentFixture<ApplicationCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatCardModule, MatIconModule],
      declarations: [ApplicationCardComponent, LocationTextComponent],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            byId$: (id) => of({ id, title: `Title for ${id}` })
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render application', () => {
    component.app = { mainCategoryId: '111', categoryId: '222', description: 'Lorem ipsum dolore' } as any;
    component.ngOnChanges();
    expect(component.mainCategory.title).toEqual('Title for 111');
    expect(component.category.title).toEqual('Title for 222');
  });
});
