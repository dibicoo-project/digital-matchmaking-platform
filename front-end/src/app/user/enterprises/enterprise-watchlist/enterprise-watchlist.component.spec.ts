import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnterpriseWatchlistService } from '@domain/enterprises/enterprise-watchlist.service';
import { EnterpriseService } from '@domain/enterprises/enterprise.service';
import { Subject } from 'rxjs';

import { EnterpriseWatchlistComponent } from './enterprise-watchlist.component';

describe('EnterpriseWatchlistComponent', () => {
  let component: EnterpriseWatchlistComponent;
  let fixture: ComponentFixture<EnterpriseWatchlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterpriseWatchlistComponent],
      providers: [
        {
          provide: EnterpriseService,
          useValue: {
            fetchPublic: () => { },
            public$: new Subject()
          }
        },
        {
          provide: EnterpriseWatchlistService,
          useValue: {
            all$: new Subject()
          }
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterpriseWatchlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show only watched companies', () => {
    const service = TestBed.inject(EnterpriseService);
    const watchlist = TestBed.inject(EnterpriseWatchlistService);

    component.companies$.subscribe(list => expect(list.length).toEqual(2));

    (service.public$ as Subject<any>).next([
      { id: '1', name: 'a' },
      { id: '2', name: 'b' },
      { id: '3', name: 'c' }
    ]);

    (watchlist.all$ as Subject<any>).next(['1', '2']);
  });
});
