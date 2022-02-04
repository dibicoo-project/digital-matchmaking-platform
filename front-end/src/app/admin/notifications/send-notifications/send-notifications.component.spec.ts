import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { DialogService } from '@domain/dialog.service';
import { NotificationService } from '@domain/notifications/notification.service';
import { of } from 'rxjs';

import { SendNotificationsComponent } from './send-notifications.component';

describe('SendNotificationsComponent', () => {
  let component: SendNotificationsComponent;
  let fixture: ComponentFixture<SendNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SendNotificationsComponent],
      providers: [
        {
          provide: DialogService,
          useValue: {
            open: () => null
          }
        },
        {
          provide: NotificationService,
          useValue: {
            sendAdminNotification: () => null
          }
        }
      ],
      imports: [ReactiveFormsModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send notification', () => {
    component.messageForm.setValue({
      title: 'test',
      body: 'lorem ipsum',
      links: [
        { label: 'link 1', url: 'https://example.com/' },
        { label: 'asd', url: '' }
      ]
    });

    const dialog = TestBed.inject(DialogService);
    spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as any);
    const service = TestBed.inject(NotificationService);
    spyOn(service, 'sendAdminNotification').and.returnValue(of());

    component.preview(null);

    expect(dialog.open).toHaveBeenCalled();
    expect(service.sendAdminNotification).toHaveBeenCalled();
  });
});
