import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { tap, mergeMap, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.auth.isAuthenticated$.pipe(
      tap(loggedIn => {
        if (!loggedIn) {
          // TODO: should we redirrect to our internal page saying that user has to log in?
          this.auth.login(state.url);
        }
      }),
      mergeMap(loggedIn => {
        const roles = next.data && next.data.requiredRoles;
        if (roles) {
          return this.auth.userHasRoles$(roles);
        } else {
          return of(loggedIn);
        }
      }),
      take(1)
    );
  }

}
