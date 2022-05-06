import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApplicationService } from '@domain/applications/application.service';
import { CategoryService } from '@domain/categories/category.service';
import { DialogService } from '@domain/dialog.service';
import { EMPTY, of, Subject } from 'rxjs';

import { ApplicationDetailsComponent } from './application-details.component';

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationDetailsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            getAdminApplication: () => EMPTY,
            changeAdminApplicationStatus: () => EMPTY
          }
        },
        {
          provide: CategoryService,
          useValue: {
            byId$: () => EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            inputDialog: () => EMPTY
          }
        },
      ],
      imports: [RouterTestingModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch application details', () => {
    const route = TestBed.inject(ActivatedRoute);
    const service = TestBed.inject(ApplicationService);
    const categories = TestBed.inject(CategoryService);

    spyOn(service, 'getAdminApplication').and.returnValue(
      of({ pending: { mainCategoryId: 'A', categoryId: 'B' }, published: { mainCategoryId: 'X', categoryId: 'Y' } } as any)
    );
    spyOn(categories, 'byId$').and.returnValue(EMPTY);

    (route.paramMap as any).next({ applicationId: '123' });

    expect(service.getAdminApplication).toHaveBeenCalledWith('123');
    expect(categories.byId$).toHaveBeenCalledTimes(4);
  });

  it('should publish the application', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'changeAdminApplicationStatus').and.returnValue(EMPTY);
    component.pending = { id: '123' } as any;

    component.publish();

    expect(service.changeAdminApplicationStatus).toHaveBeenCalledWith('123', 'publish');
  });

  it('should reject the application', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'changeAdminApplicationStatus').and.returnValue(EMPTY);
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'testing']));
    component.pending = { id: '123' } as any;

    component.reject();

    expect(service.changeAdminApplicationStatus).toHaveBeenCalledWith('123', 'reject', 'testing');
  });
});
