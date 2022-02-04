import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CategoryService } from '@domain/categories/category.service';
import { DialogService } from '@domain/dialog.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { EMPTY, of } from 'rxjs';

import { EnterpriseDetailsComponent } from './enterprise-details.component';

describe('EnterpriseDetailsComponent', () => {
  let component: EnterpriseDetailsComponent;
  let fixture: ComponentFixture<EnterpriseDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterpriseDetailsComponent],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getAdminEnterprise: () => EMPTY,
            changeAdminEnterpriseStatus: () => EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            inputDialog: () => EMPTY
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load enterprise details', () => {
    const route = TestBed.inject(ActivatedRoute);
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'getAdminEnterprise').and.returnValue(
      of({ published: { companyName: 'old' }, pending: { companyName: 'new' } } as any)
    );

    (route.paramMap as any).next({ enterpriseId: '123' });

    expect(component.published.companyName).toEqual('old');
    expect(component.pending.companyName).toEqual('new');
  });

  it('should publish enterprise', () => {
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'changeAdminEnterpriseStatus').and.returnValue(of());

    component.pending = { id: '123' } as any;
    component.publish();

    expect(service.changeAdminEnterpriseStatus).toHaveBeenCalledWith('123', 'publish');
  });

  it('should reject enterprise', () => {
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'changeAdminEnterpriseStatus').and.returnValue(of());

    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'testing']));

    component.pending = { id: '123' } as any;
    component.reject();

    expect(service.changeAdminEnterpriseStatus).toHaveBeenCalledWith('123', 'reject', 'testing');
  });
});
