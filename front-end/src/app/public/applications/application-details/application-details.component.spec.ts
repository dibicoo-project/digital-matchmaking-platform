import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationDetailsComponent } from './application-details.component';
import { ApplicationService } from '@domain/applications/application.service';
import { EMPTY, of } from 'rxjs';
import { CategoryService } from '@domain/categories/category.service';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService } from '@domain/dialog.service';
import { LocationTextComponent } from '@domain/location/location-text/location-text.component';
import { Application } from '@domain/applications/application-domain';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FixNewLinesPipe } from '@domain/pipes/fix-new-lines.pipe';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationDetailsComponent, LocationTextComponent, FixNewLinesPipe],
      imports: [RouterTestingModule
      ],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            getApplication: () => EMPTY,
            reportApplication: () => EMPTY
          }
        },
        {
          provide: CategoryService,
          useValue: {
            byId$: (id) => of({ title: id })
          }
        },
        {
          provide: DialogService,
          useValue: { inputDialog: () => EMPTY }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load application details', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'getApplication').and.returnValue(
      of({ mainCategoryId: '111', categoryId: '222' } as Application)
    );

    const categoryService = TestBed.inject(CategoryService);
    component.ngOnInit();
    expect(service.getApplication).toHaveBeenCalled();
    expect(component.mainCategory.title).toEqual('111');
    expect(component.category.title).toEqual('222');
  });

  it('should get details item', () => {
    expect(component.getDetailByCode('randomCode').name).toEqual('randomCode');
    expect(component.getDetailByCode('volumeFlow').name).toEqual('Volume flow');
  });

  it('should report application', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'message']));

    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'reportApplication').and.callThrough();
    component.app = { id: '123' } as any;
    component.reportClicked();
    expect(dialog.inputDialog).toHaveBeenCalled();
    expect(service.reportApplication).toHaveBeenCalledWith('123', 'message');
  });
});
