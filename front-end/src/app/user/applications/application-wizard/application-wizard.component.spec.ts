import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Application } from '@domain/applications/application-domain';
import { CategoryService } from '@domain/categories/category.service';
import { DialogService } from '@domain/dialog.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';

import { ApplicationWizardComponent } from './application-wizard.component';
import { ApplicationWizardService } from './application-wizard.service';

describe('ApplicationWizardComponent', () => {
  let component: ApplicationWizardComponent;
  let fixture: ComponentFixture<ApplicationWizardComponent>;
  let service: ApplicationWizardService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationWizardComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: CategoryService,
          useValue: {
            all$: new BehaviorSubject([])
          }
        },
        {
          provide: EnterpriseService,
          useValue: {
            getUserEnterprises: () => EMPTY,
            getUserEnterprise: () => EMPTY,
          }
        },
        {
          provide: DialogService,
          useValue: {
            open: () => ({ afterClosed: () => EMPTY})
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(
        ApplicationWizardComponent,
        {
          set: {
            providers: [
              {
                provide: ApplicationWizardService,
                useValue: {
                  applicationStatus$: new Subject(),
                  applicationId$: new Subject(),
                  activeStep$: new Subject(),
                  createNew: () => null,
                  fetch: () => EMPTY,
                  publish: () => EMPTY,
                  goToStep: () => null,
                  updateValue: () => null
                }
              }
            ],

          }
        }
      )
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationWizardComponent);
    service = fixture.debugElement.injector.get(ApplicationWizardService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize to new application', () => {
    spyOn(service, 'createNew');
    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ applicationId: 'new' });

    expect(service.createNew).toHaveBeenCalled();
  });

  it('should initialize to existing application', () => {
    spyOn(service, 'fetch').and.returnValue(of({ description: 'testing', mainCategoryId: '111', isPublic: 'true' } as any));
    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ applicationId: '123' });

    expect(service.fetch).toHaveBeenCalledWith('123');
    expect(component.applicationForm.get('field').value).toEqual({ mainCategoryId: '111', categoryId: undefined });
    expect(component.applicationForm.get('description').value).toEqual('testing');
  });

  it('should not initialize when saving new application', () => {
    spyOn(service, 'fetch');
    const router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue({ extras: { state: { savedNew: true } } } as any);

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ applicationId: '123' });

    expect(service.fetch).not.toHaveBeenCalled();
  });

  it('should change active step on fragment change', () => {
    spyOn(service, 'goToStep');
    const route = TestBed.inject(ActivatedRoute);
    (route.fragment as any).next('test');

    expect(service.goToStep).toHaveBeenCalledWith('test');
  });

  it('should change fragment on active step  change', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    (service.activeStep$ as any).next({ code: 'test' });

    expect(router.navigate).toHaveBeenCalledWith([], { fragment: 'test' });
  });

  it('should update value on changes', () => {
    spyOn(service, 'updateValue');
    component.applicationForm.get('description').setValue('testing');
    expect(service.updateValue).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ description: 'testing' } as Application)
    );
  });

  it('should navigate to application URL when saved new', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    (service.applicationId$ as any).next('987');

    expect(router.navigate).toHaveBeenCalledWith(['..', '987'], jasmine.objectContaining({ state: { savedNew: true } }));
  });

  it('should use existing company', () => {
    const dialog = TestBed.inject(DialogService);
    const companyService = TestBed.inject(EnterpriseService);
    const comp = { id: '123'};

    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(comp)} as any);
    spyOn(companyService, 'getUserEnterprise').and.returnValue(of({ companyName: 'test'} as any));

    component.selectCompany(comp);

    expect(companyService.getUserEnterprise).toHaveBeenCalledWith('123');
    expect(component.applicationForm.get('companyName').value).toEqual('test');
  });
});
