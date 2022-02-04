import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, Observable, throwError, of, combineLatest, ReplaySubject } from 'rxjs';
import { shareReplay, catchError, concatMap, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';

@Injectable()
export class AuthService {
  // TODO: needs refactoring: inject Auth0Client, window.location

  private auth0Client$: Observable<Auth0Client> = from(
    createAuth0Client({
      domain: 'dibicoo.eu.auth0.com',
      client_id: 'E0A66DU8UsWAnIGoKuAS1tF2p5m2qu34',
      redirect_uri: `${window.location.origin}`,
      audience: 'https://dibicoo-matchmaking-tool.appspot.com/api/',
      scope: 'admin'
    })
  ).pipe(
    shareReplay(1),
    catchError(err => throwError(err))
  );

  // Define observables for SDK methods
  public isAuthenticated$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap(res => this.loggedIn = res)
  );
  private handleRedirectCallback$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
  );
  public getTokenSilently$ = this.auth0Client$.pipe(
    concatMap((client: Auth0Client) => from(client.getTokenSilently())),
    tap(token => this.accessTokenSubject$.next(token))
  );

  private accessTokenSubject$ = new ReplaySubject<string>(1);
  private userRoles$ = this.accessTokenSubject$.asObservable()
    .pipe(
      map(token => {
        // NOTE: decoding `access_token` in front-end is considered as bad practice,
        // but currently in `auth0-spa-js` there is no other way to get granted scopes.
        // Internally `client.getTokenSilently()` does request to https://dibicoo.eu.auth0.com/oauth/token
        // which returns granted scopes, but the result is hidden within internal cache.
        const decoded: any = jwtDecode(token);
        const roles = decoded.scope && decoded.scope.split(' ') || [];
        return roles;
      })
    );

  private userProfileSubject$ = new ReplaySubject<any>(1);
  public userProfile$ = this.userProfileSubject$.asObservable();

  public loggedIn = false;

  constructor(private router: Router) {
    this.localAuthSetup();
    this.handleAuthCallback();
  }

  private getUser$(): Observable<any> {
    return this.auth0Client$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser())),
      tap(user => this.userProfileSubject$.next(user))
    );
  }

  private localAuthSetup() {
    this.isAuthenticated$
      .pipe(
        concatMap(loggedIn => loggedIn ? this.getUser$() : of(loggedIn))
      )
      .subscribe();
  }

  private handleAuthCallback() {
    const params = window.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute: string;

      this.handleRedirectCallback$
        .pipe(
          tap(res => {
            targetRoute = res.appState && res.appState.target ? res.appState.target : '/';
          }),
          concatMap(() => {
            return combineLatest([this.getUser$(), this.isAuthenticated$, this.getTokenSilently$]);
          })
        )
        .subscribe(() => {
          this.router.navigate([targetRoute]);
        });
    }
  }

  public login(target: string = window.location.pathname) {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.loginWithRedirect({
        redirect_uri: `${window.location.origin}`,
        appState: { target }
      });
    });
  }

  public logout() {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.logout({
        client_id: 'E0A66DU8UsWAnIGoKuAS1tF2p5m2qu34',
        returnTo: `${window.location.origin}`
      });
    });
  }

  public userHasRoles$(roles: string[]): Observable<boolean> {
    return this.userRoles$.pipe(
      map(userRoles => roles.every(r => userRoles.includes(r)))
    );
  }

}
