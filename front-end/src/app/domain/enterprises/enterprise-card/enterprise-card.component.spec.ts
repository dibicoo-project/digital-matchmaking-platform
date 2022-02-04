import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { EnterpriseWatchlistService } from '../enterprise-watchlist.service';

import { EnterpriseCardComponent } from './enterprise-card.component';

describe('EnterpriseCardComponent', () => {
  let component: EnterpriseCardComponent;
  let fixture: ComponentFixture<EnterpriseCardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EnterpriseCardComponent ],
      providers: [
        {
          provide: EnterpriseWatchlistService,
          useValue: {
            all$: EMPTY
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
