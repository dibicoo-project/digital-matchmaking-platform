import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationListComponent } from './application-list.component';
import { ApplicationService } from '@domain/application.service';
import { EMPTY, of } from 'rxjs';
import { MatBadgeModule } from '@angular/material/badge';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationListComponent],
      imports: [
        MatBadgeModule
      ],
      providers: [
        {
          provide: ApplicationService,
          useValue: { getApplications: () => EMPTY }
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

  it('should load applications', () => {
    const service = TestBed.get(ApplicationService);
    spyOn(service, 'getApplications').and.returnValue(of([{}, {}]));
    component.ngOnInit();
    expect(service.getApplications).toHaveBeenCalled();
  });

});
