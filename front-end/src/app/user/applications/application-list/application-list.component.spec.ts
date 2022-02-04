import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationListComponent } from './application-list.component';
import { ApplicationService } from '@domain/application.service';
import { RouterTestingModule } from '@angular/router/testing';
import { EMPTY, of } from 'rxjs';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogService } from '@domain/dialog.service';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationListComponent],
      imports: [
        RouterTestingModule
      ],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            getUserApplications: () => EMPTY
          }
        },
        {
          provide: DialogService,
          useValue: {
            confirm: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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

  it('should load user applications', () => {
    const service = TestBed.inject(ApplicationService);

    spyOn(service, 'getUserApplications').and.returnValue(of({ drafts: [{}, {}, {}], published: [{}]} as any));
    component.ngOnInit();

    expect(component.published.length).toBe(1);
    expect(component.drafts.length).toBe(3);
  });
});
