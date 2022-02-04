import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationListComponent } from './application-list.component';
import { ApplicationService } from '@domain/application.service';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@domain/dialog.service';
import { EMPTY, of } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Application } from '@domain/application-domain';
import { MatBadgeModule } from '@angular/material/badge';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationListComponent],
      imports: [RouterTestingModule, MatTabsModule, NoopAnimationsModule, MatBadgeModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            getAdminApplications: () => EMPTY,
            changeAdminApplicationStatus: () => EMPTY
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: () => EMPTY
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load applications', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'getAdminApplications').and.returnValue(of({ published: [{}, {}], pending: [{}]} as any));
    component.ngOnInit();
    expect(service.getAdminApplications).toHaveBeenCalled();
  });

  it('should show reports', () => {
    const dialog = TestBed.get(MatDialog);
    spyOn(dialog, 'open');
    component.reportsClicked(null, {} as Application);
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should unpublish application', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'changeAdminApplicationStatus').and.returnValue(of(null));
    spyOn(service, 'getAdminApplications').and.returnValue(of({ pending: [], published: []}));

    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'inputDialog').and.returnValue(of([true, 'message']));
    component.unpublish('123');
    expect(service.changeAdminApplicationStatus).toHaveBeenCalledWith('123', 'unpublish', 'message');
    expect(service.getAdminApplications).toHaveBeenCalled();
  });
});
