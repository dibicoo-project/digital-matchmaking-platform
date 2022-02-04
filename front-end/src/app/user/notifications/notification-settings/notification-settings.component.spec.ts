import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '@domain/notifications/notification.service';
import { AuthService } from '@root/app/auth/auth.service';
import { EMPTY, of, ReplaySubject, Subject } from 'rxjs';

import { NotificationSettingsComponent } from './notification-settings.component';

describe('NotificationSettingsComponent', () => {
  let component: NotificationSettingsComponent;
  let fixture: ComponentFixture<NotificationSettingsComponent>;

  const subj = new ReplaySubject(1);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationSettingsComponent],
      imports: [ReactiveFormsModule, RouterTestingModule, MatCheckboxModule],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            getSettings: () => subj.asObservable()
          }
        },
        {
          provide: AuthService,
          useValue: {
            userProfile$: new ReplaySubject(1)
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load settings on init', () => {
    const auth = TestBed.inject(AuthService);
    (auth.userProfile$ as any).next({ email: 'test@test' });

    subj.next({});

    expect(component.settingsForm.value.enabled).toBeFalsy();
    expect(component.settingsForm.get('email').value).toEqual('test@test');
  });
});
