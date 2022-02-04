import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EnterpriseListComponent } from './enterprise-list.component';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogService } from '@domain/dialog.service';

describe('EnterpriseListComponent', () => {
  let component: EnterpriseListComponent;
  let fixture: ComponentFixture<EnterpriseListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnterpriseListComponent],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getUserEnterprises: () => EMPTY,
            deleteEnterprise: () => EMPTY,
            changeEnterpriseStatus: () => EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            confirmDialog: () => EMPTY
          }
        }
      ],
      imports: [RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load enterprises on init', () => {
    const service = TestBed.get(EnterpriseService);
    spyOn(service, 'getUserEnterprises').and.returnValue(of({
      drafts: [{}, {}, {}],
      published: [{}, {}]
    }));

    component.ngOnInit();

    expect(service.getUserEnterprises).toHaveBeenCalled();
    expect(component.draftEnteprises.length).toBe(3);
    expect(component.publishedEnteprises.length).toBe(2);
  });

  it('should unpublish enterprise', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'confirmDialog').and.returnValue(of([true]));

    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'changeEnterpriseStatus').and.callThrough();

    component.unpublish({ id: '123' } as any);

    expect(service.changeEnterpriseStatus).toHaveBeenCalledWith('123', 'unpublish');
  });

  it('should delete enterprise', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'confirmDialog').and.returnValue(of([true]));

    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'deleteEnterprise').and.callThrough();

    component.delete({ id: '123' } as any);

    expect(service.deleteEnterprise).toHaveBeenCalledWith('123');
  });
});
