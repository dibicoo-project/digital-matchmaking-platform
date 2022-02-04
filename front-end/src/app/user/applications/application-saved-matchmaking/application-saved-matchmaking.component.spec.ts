import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationService } from '@domain/application.service';
import { EMPTY, of } from 'rxjs';

import { ApplicationSavedMatchmakingComponent } from './application-saved-matchmaking.component';

describe('ApplicationSavedMatchmakingComponent', () => {
  let component: ApplicationSavedMatchmakingComponent;
  let fixture: ComponentFixture<ApplicationSavedMatchmakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationSavedMatchmakingComponent],
      providers: [
        {
          provide: ApplicationService,
          useValue: {
            getSavedMatchmaking: () => EMPTY,
            deleteMatchmaking: () => EMPTY
          }
        }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSavedMatchmakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load list on init', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'getSavedMatchmaking').and.returnValue(of(['fake', 'list'] as any));

    component.ngOnInit();
    expect(component.list).toEqual(['fake', 'list'] as any);
    expect(service.getSavedMatchmaking).toHaveBeenCalled();
  });

  it('should delete one item', () => {
    const service = TestBed.inject(ApplicationService);
    spyOn(service, 'deleteMatchmaking').and.returnValue(of(null));

    component.list = [
      { id: '100' },
      { id: '200' },
      { id: '300' },
      { id: '400' },
    ] as any;

    component.delete('300');
    expect(component.list[2].id).toEqual('400');
    expect(service.deleteMatchmaking).toHaveBeenCalledWith('300');
  });
});
