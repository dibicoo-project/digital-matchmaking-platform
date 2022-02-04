import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { EMPTY, of } from 'rxjs';

import { EnterpriseStatisticsComponent } from './enterprise-statistics.component';

describe('EnterpriseStatisticsComponent', () => {
  let component: EnterpriseStatisticsComponent;
  let fixture: ComponentFixture<EnterpriseStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterpriseStatisticsComponent],
      providers: [{
        provide: EnterpriseService,
        useValue: {
          getEnterpriseStatistics: () => EMPTY
        }
      }],
      imports: [RouterTestingModule, MatTableModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch statistics', () => {
    const service = TestBed.inject(EnterpriseService);
    spyOn(service, 'getEnterpriseStatistics').and.returnValue(
      of({
        companyName: 'Test company',
        items: [
          { country: 'A', weeklyUsers: 123, weeklyViews: 234 },
          { country: 'B', weeklyUsers: 345, monthlyUsers: 456 }
        ]
      })
    );

    const route = TestBed.inject(ActivatedRoute);
    (route.paramMap as any).next({ enterpriseId: '123' });

    expect(service.getEnterpriseStatistics).toHaveBeenCalledWith('123');
    expect(component.companyName).toEqual('Test company');
    expect(component.totals.weeklyUsers).toBe(468);
    expect(component.totals.weeklyViews).toBe(234);
    expect(component.totals.monthlyUsers).toBe(456);
    expect(component.totals.monthlyViews).toBe(0);
  });
});
