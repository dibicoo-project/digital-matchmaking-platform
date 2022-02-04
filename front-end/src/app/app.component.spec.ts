import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { EMPTY } from 'rxjs';
import { NotificationService } from '@domain/notifications/notification.service';
import { TrackingService } from '@domain/tracking.service';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('AppComponent', () => {

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatSidenavModule,
        MatToolbarModule,
        MatListModule,
        MatMenuModule,
        MatCheckboxModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            userHasRoles$: () => EMPTY,
            userProfile$: EMPTY
          }
        },
        {
          provide: NotificationService,
          useValue: {
            fetch: () => null,
            unread$: EMPTY
          }
        },
        {
          provide: TrackingService,
          useValue: {
            enable: () => null
          }
        },
        {
          provide: DiBiCooCookieService,
          useValue: {
            save: () => null,
            isSaved: () => null,
            reset: () => null,
            checkTracking: () => null
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should save cookie preferences', () => {
    const service = TestBed.inject(DiBiCooCookieService);
    spyOn(service, 'save');
    const tracking = TestBed.inject(TrackingService);
    spyOn(tracking, 'enable');
    component.consents.setValue({ media: true, tracking: true });
    component.saveCookiePreferences();

    expect(service.save as any).toHaveBeenCalledWith({ media: true, tracking: true });
    expect(tracking.enable).toHaveBeenCalled();
  });

  it('should check is tracking enabled', () => {
    const service = TestBed.inject(DiBiCooCookieService);
    spyOn(service, 'isSaved').and.returnValue(true);
    spyOn(service, 'checkTracking').and.returnValue(true);

    const tracking = TestBed.inject(TrackingService);
    spyOn(tracking, 'enable');

    component.ngOnInit();

    expect(service.checkTracking).toHaveBeenCalled();
    expect(component.cookiesSaved).toBeTruthy();
    expect(tracking.enable).toHaveBeenCalled();
  });

  it('should reset cookie preferences', () => {
    const service = TestBed.inject(DiBiCooCookieService);
    spyOn(service, 'reset');

    component.resetCookiePreferences();
    expect(service.reset).toHaveBeenCalled();
  });
});
