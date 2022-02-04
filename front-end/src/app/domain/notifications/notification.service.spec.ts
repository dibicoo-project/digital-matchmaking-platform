import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(NotificationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch notifications', () => {
    service.fetch();
    http.expectOne({ method: 'GET', url: '/api/user/notifications' }).flush([
      { title: 'A', ts: '10', isRead: true },
      { title: 'B', ts: '11', isRead: false },
      { title: 'C', ts: '12', isRead: true },
      { title: 'D', ts: '13', isRead: false }
    ]);

    service.all$.subscribe(v => {
      expect(v.length).toBe(4);
      expect(v[0].title).toEqual('D');
      expect(v[1].title).toEqual('B');
      expect(v[2].title).toEqual('C');
      expect(v[3].title).toEqual('A');
    });

    service.unread$.subscribe(v => {
      expect(v.length).toBe(2);
      expect(v[0].title).toEqual('D');
      expect(v[1].title).toEqual('B');
    });
  });

  it('should mark one as read', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['state'] = [{ id: '1', title: 'A' }, { id: '2', title: 'B' }] as any[];

    service.markAsRead('2');
    service.unread$.pipe(take(1)).subscribe(v => expect(v.length).toBe(1));
    http.expectOne({ method: 'PATCH', url: '/api/user/notifications/2' }).error({} as any);
    service.unread$.pipe(take(1)).subscribe(v => expect(v.length).toBe(2));
  });

  it('should mark all as read', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['state'] = [{ id: '1', title: 'A' }, { id: '2', title: 'B' }] as any[];

    service.markAllAsRead();

    service.unread$.pipe(take(1)).subscribe(v => expect(v.length).toBe(0));
    http.expectOne({ method: 'PATCH', url: '/api/user/notifications' }).error({} as any);
    service.unread$.pipe(take(1)).subscribe(v => expect(v.length).toBe(2));
  });

  it('should get settings', () => {
    service.getSettings().subscribe();
    expect(
      () => http.expectOne({ method: 'GET', url: '/api/user/notifications/settings' })
    ).not.toThrow();
  });

  it('should save settings', () => {
    service.saveSettings({ enabled: false }).subscribe();
    expect(
      () => http.expectOne({ method: 'PUT', url: '/api/user/notifications/settings' })
    ).not.toThrow();
  });

  it('should send admin notification', () => {
    service.sendAdminNotification({ title: 'test' } as any).subscribe();
    expect(
      () => http.expectOne({ method: 'POST', url: '/api/admin/notifications' })
    ).not.toThrow();
  });

});
