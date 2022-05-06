import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { map, timeInterval } from 'rxjs/operators';
import { AdminNotification, NotificationSettings, UserNotification } from './notification.domain';

@Injectable()
export class NotificationService {

  private stateSubject = new BehaviorSubject<UserNotification[]>([]);

  private get state() { return this.stateSubject.getValue(); }
  private set state(val: UserNotification[]) { this.stateSubject.next(val); }

  public all$ = this.stateSubject.asObservable().pipe(
    // [...list] spread is needed because `sort` mutates the array!
    map(list => [...list].sort((a, b) => {
      if (a.isRead === b.isRead) {
        return a.ts < b.ts ? 1 : -1;
      } else {
        return a.isRead > b.isRead ? 1 : -1;
      }
    }))
  );

  public unread$ = this.all$.pipe(
    map(list => list.filter(n => !n.isRead).slice(0, 5))
  );

  constructor(private http: HttpClient) { }

  delete(id: string) {
    const item = this.state.find(i => i.id === id);
    if (item) {
      this.state = [...this.state.filter(i => i.id !== id)];

      this.http.delete<void>(`/api/user/notifications/${id}`)
        .subscribe(
          _ok => null,
          _err => {
            this.state = [...this.state, item];
          }
        );
    }
  }

  markAsRead(id: string) {
    const item = this.state.find(i => i.id === id);
    if (item) {
      const idx = this.state.indexOf(item);
      this.state[idx] = { ...item, isRead: true };
      this.state = [...this.state];

      this.http.patch<UserNotification>(`/api/user/notifications/${id}`, { isRead: true })
        .subscribe(
          _ok => null,
          _err => {
            this.state[idx] = { ...item, isRead: false };
            this.state = [...this.state];
          }
        );
    }
  }

  markAllAsRead() {
    const oldState = this.state;
    this.state = this.state.map(item => ({ ...item, isRead: true }));

    this.http.patch('/api/user/notifications', { isRead: true })
      .subscribe(
        _ok => null,
        _err => this.state = oldState
      );
  }

  fetch() {
    this.http.get<UserNotification[]>('/api/user/notifications').subscribe(v => this.state = v);
  }

  getSettings() {
    return this.http.get<NotificationSettings>('/api/user/notifications/settings');
  }

  saveSettings(bean: NotificationSettings) {
    return this.http.put<void>('/api/user/notifications/settings', bean);
  }

  sendAdminNotification(bean: AdminNotification) {
    return this.http.post<void>('/api/admin/notifications', bean);
  }
}
