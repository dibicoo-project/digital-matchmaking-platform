import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { EMPTY, of } from 'rxjs';

import { EnterpriseListComponent } from './enterprise-list.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogService } from '@domain/dialog.service';

describe('EnterpriseListComponent', () => {
  let component: EnterpriseListComponent;
  let fixture: ComponentFixture<EnterpriseListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            getAdminEnterprises: () => EMPTY,
            changeAdminEnterpriseStatus: () => EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            inputDialog: () => EMPTY
          }
        }
      ],
      declarations: [EnterpriseListComponent],
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

  it('should load enterprise list on init', () => {
    jasmine.clock().mockDate(new Date('2022-06-14'));

    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'getAdminEnterprises').and.returnValue(
      of({
        pending: [{}, {}],
        published: [
          { reports: [] },
          { reports: [{}] },
          {},
          { outdatedNotificationTs: new Date('2021-11-13') },
          { outdatedNotificationTs: new Date('2021-11-15') }
        ]
      } as any));

    component.ngOnInit();
    expect(component.published.length).toBe(5);
    expect(component.outdated.length).toBe(1);
    expect(component.reported.length).toBe(1);
    expect(component.pending.length).toBe(2);

    jasmine.clock().uninstall();
  });

  it('should change enterprise status', () => {
    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'message']));

    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'changeAdminEnterpriseStatus').and.returnValue(of());

    component.unpublish('123');

    expect(service.changeAdminEnterpriseStatus).toHaveBeenCalledWith('123', 'unpublish', 'message');
  });
});
