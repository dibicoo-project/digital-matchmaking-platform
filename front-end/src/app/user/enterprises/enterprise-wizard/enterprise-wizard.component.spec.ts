import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService } from '@domain/dialog.service';
import { Enterprise } from '@domain/enterprises/enterprise-domain';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { MockComponentWithValueAccessor } from '@root/test-utils';
import { EMPTY, of, throwError } from 'rxjs';

import { EnterpriseWizardComponent } from './enterprise-wizard.component';

describe('EnterpriseWizardComponent', () => {
  let component: EnterpriseWizardComponent;
  let fixture: ComponentFixture<EnterpriseWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseWizardComponent,
        MockComponentWithValueAccessor({ selector: 'app-location-input' }),
        MockComponentWithValueAccessor({ selector: 'app-contact-list' }),
        MockComponentWithValueAccessor({ selector: 'app-category-tree-select' }),
        MockComponentWithValueAccessor({ selector: 'app-attachment-list' }),
      ],
      imports: [FormsModule, ReactiveFormsModule,
        RouterTestingModule.withRoutes([{ path: '', component: EnterpriseWizardComponent }]),
        MatCheckboxModule, MatListModule],
      providers: [
        {
          provide: DialogService,
          useValue: {
            confirmDialog: () => EMPTY
          }
        },
        {
          provide: EnterpriseService,
          useValue: {
            getUserEnterprise: () => EMPTY,
            addEnterprise: () => EMPTY,
            editEnterprise: () => EMPTY,
            addEnterpriseLogo: () => EMPTY,
            deleteEnterpriseLogo: () => EMPTY,
            changeEnterpriseStatus: () => EMPTY
          }
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('for new company', () => {
    beforeEach(() => {
      const route = TestBed.inject(ActivatedRoute);
      (route.paramMap as any).next({ enterpriseId: 'new' });
    });

    it('should init', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(component['autoSaveSub']).toBeDefined();
      expect(component.company.companyName).toBeUndefined();
    });

    it('should autosave changes', fakeAsync(() => {
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');

      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'addEnterprise').and.returnValue(
        of({ id: 'new-id', companyName: 'saved name' } as Enterprise)
      );

      component.companyForm.get('general').get('companyName').setValue('new name');
      tick(501);
      expect(service.addEnterprise).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['..', 'new-id'], jasmine.objectContaining({ state: { savedNew: true } }));
      expect(component.company.companyName).toBe('saved name');
    }));

  });

  describe('for existing company', () => {

    beforeEach(() => {
      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'getUserEnterprise').and.returnValue(
        of({ id: '12345', companyName: 'test', companyProfile: 'lorem ipsum' } as Enterprise)
      );

      const route = TestBed.inject(ActivatedRoute);
      (route.paramMap as any).next({ enterpriseId: '12345' });
    });

    it('should init to existing company profile', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(component['autoSaveSub']).toBeDefined();
      expect(component.company.companyName).toBe('test');
      expect(component.steps.find(s => s.code === 'general').status).toBe('valid');
      expect(component.steps.find(s => s.code === 'contacts').status).toBe('invalid');
    });

    it('should autosave changes', fakeAsync(() => {
      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'editEnterprise').and.returnValue(
        of({ companyName: 'edited name' } as Enterprise)
      );

      component.companyForm.get('general').get('companyName').setValue('edited name');
      tick(501);
      expect(service.editEnterprise).toHaveBeenCalled();
      expect(component.company.companyName).toBe('edited name');
    }));

    it('should add protocol to web page', fakeAsync(() => {
      const control = component.companyForm.get('contacts').get('webPage');
      control.setValue('example.com');
      tick(501);
      expect(control.value).toEqual('http://example.com');
    }));

    it('should handle autosave error', fakeAsync(() => {
      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'editEnterprise').and.returnValue(throwError({}));

      component.companyForm.get('general').get('companyName').setValue('edited name');
      tick(501);
      expect(service.editEnterprise).toHaveBeenCalled();
      expect(component.autoSaveStatus).toBe('error');
    }));

    it('should publish', () => {
      const service = TestBed.inject(EnterpriseService);
      spyOn(service, 'changeEnterpriseStatus').and.callThrough();

      component.publish();

      expect(service.changeEnterpriseStatus).toHaveBeenCalledWith('12345', 'publish');
    });

    describe('logo', () => {
      it('should change', fakeAsync(() => {
        const service = TestBed.inject(EnterpriseService);
        spyOn(service, 'editEnterprise').and.returnValue(of({ id: '12345' } as Enterprise));
        spyOn(service, 'addEnterpriseLogo').and.returnValue(of({ imageUrl: 'test-url' } as Enterprise));

        const mockFile = new File(['dummy'], 'filename', { type: 'image/png' });
        component.logoChanged({ target: { files: [mockFile] } });

        expect(service.editEnterprise).toHaveBeenCalled();
        expect(service.addEnterpriseLogo).toHaveBeenCalled();
      }));

      it('should delete', fakeAsync(() => {
        const service = TestBed.inject(EnterpriseService);
        spyOn(service, 'deleteEnterpriseLogo').and.returnValue(of());

        const dialog = TestBed.inject(DialogService);
        spyOn(dialog, 'confirmDialog').and.returnValue(of([true]));

        component.company.imageUrl = 'test';
        component.deleteLogoClicked();
        tick(1);

        expect(service.deleteEnterpriseLogo).toHaveBeenCalled();
      }));
    });
  });

  it('should navigate to next section', fakeAsync(() => {
    component.activeStep = component.steps[1];
    component.next();
    tick(1);
    expect(component.activeStep.code).toBe('business');
  }));

  it('should navigate to previous section', fakeAsync(() => {
    component.activeStep = component.steps[1];
    component.back();
    tick(1);
    expect(component.activeStep.code).toBe('general');
  }));


  describe('key projects', () => {
    let control: AbstractControl;
    beforeEach(() => {
      const dialog = TestBed.inject(MatDialog);
      spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of({ title: 'test' }) } as any);
      control = component.companyForm.get('projects').get('keyProjects');
      control.setValue([{ title: 'one' }]);
    });

    it('should add', () => {
      component.addKeyProject(null);
      expect(control.value).toEqual([{ title: 'one' }, { title: 'test' }]);
    });

    it('should edit', () => {
      component.editKeyProject(null, control.value[0]);
      expect(control.value).toEqual([{ title: 'test' }]);
    });

    it('should delete', () => {
      component.removeKeyProject(0);
      expect(control.value).toEqual([]);
    });
  });
});
