import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@root/app/auth/auth.service';
import { BehaviorSubject, of, Subject, Subscribable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class EnterpriseWatchlistService {

  private stateSubject = new BehaviorSubject<string[]>([]);
  private get state() { return this.stateSubject.getValue(); }
  private set state(val: string[]) { this.stateSubject.next(val); }

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.isAuthenticated$.pipe(
      switchMap(logged => {
        if (logged) {
          return this.http.get<string[]>('/api/user/enterprises/watchlist');
        } else {
          return of([]);
        }
      })
    ).subscribe(list => this.state = list);
  }

  public readonly all$ = this.stateSubject.asObservable();

  public toggle(id: string) {
    const oldState = this.state;

    if (oldState.includes(id)) {
      this.state = oldState.filter(one => one !== id);
    } else {
      this.state = [...oldState, id];
    }

    this.http.put('/api/user/enterprises/watchlist', this.state)
      .subscribe(
        _ok => null,
        _err => this.state = oldState
      );
  }
}
