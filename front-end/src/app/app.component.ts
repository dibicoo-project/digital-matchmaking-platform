import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { Observable, combineLatest, timer } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, shareReplay, filter, switchMap, switchMapTo } from 'rxjs/operators';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { NotificationService } from '@domain/notifications/notification.service';
import { TrackingService } from '@domain/tracking.service';
import { FormBuilder } from '@angular/forms';
import { DiBiCooCookieService } from '@domain/dibicoo-cookie.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  consents = this.fb.group({
    media: false,
    tracking: false
  });

  year = new Date().getFullYear();
  api: any;
  cookiesSaved = false;

  @ViewChild('sidebar', { static: true })
  sidebar: MatSidenav;

  isSmall$: Observable<boolean>;
  showSidebar$: Observable<boolean>;
  fullWidth$: Observable<boolean>;
  showTour$: Observable<boolean>;
  showSearch$: Observable<boolean>;

  private isActive = true;

  constructor(private http: HttpClient,
    private cookies: DiBiCooCookieService,
    private router: Router,
    private route: ActivatedRoute,
    public auth: AuthService,
    private breakpointObserver: BreakpointObserver,
    public notifications: NotificationService,
    private tracking: TrackingService,
    private fb: FormBuilder) {

    this.isSmall$ = this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.XSmall])
      .pipe(
        map(result => result.matches),
        shareReplay(1)
      );

    const navigationEnd$ = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      );

    combineLatest([
      navigationEnd$,
      this.isSmall$
    ]).subscribe(([_, isHandset]) => {
      if (isHandset) {
        this.sidebar.close();
      }
    });

    const data$ = navigationEnd$.pipe(
      map(() => this.route.snapshot),
      map(snap => {
        // find last child
        while (snap.firstChild) {
          snap = snap.firstChild;
        }
        return snap.data;
      }),
      shareReplay(1)
    );

    this.showSidebar$ = data$.pipe(
      map(data => !data.hideSidebar)
    );

    this.fullWidth$ = data$.pipe(
      map(data => data.fullWidth)
    );

    this.showTour$ = data$.pipe(
      map(data => data.tour != null)
    );

    this.showTour$ = data$.pipe(
      map(data => data.tour != null)
    );

    this.showSearch$ = data$.pipe(
      map(data => !data.hideSearch)
    );

    navigationEnd$.subscribe((ev: NavigationEnd) => tracking.pageView(ev.urlAfterRedirects));

    // stop notification fetching after 15 minutes if the user is not active
    navigationEnd$.subscribe(_ => this.isActive = true);
    navigationEnd$.pipe(switchMapTo(timer(15 * 60 * 1000))).subscribe(_ => this.isActive = false);
  }

  ngOnInit() {
    // TODO: move to domain service
    this.http.get('/api/').subscribe(api => {
      this.api = api;
    });

    if (this.cookies.isSaved()) {
      this.cookiesSaved = true;

      if (this.cookies.checkTracking()) {
        this.tracking.enable();
      }
    }

    this.auth.userProfile$.pipe(
      switchMap(_ => timer(2000, 3 * 60 * 1000)),
      filter(_ => this.isActive)
    ).subscribe(_ => this.notifications.fetch());
  }

  saveCookiePreferences() {
    this.cookiesSaved = true;
    this.cookies.save(this.consents.value);
    if (this.consents.value.tracking) {
      this.tracking.enable();
    }
  }

  resetCookiePreferences() {
    this.cookies.reset();
  }

  doSearch(query: string) {
    this.router.navigate(['/search/all'], { queryParams: { q : query}});
  }
}
