import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, mergeMap, map } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.match('^/api/')) {
      return next.handle(req);
    }
    return this.auth.isAuthenticated$.pipe(
      mergeMap(loggedIn => loggedIn ? this.getRequestWithToken(req) : of(req)),
      mergeMap(r => next.handle(r)),
      catchError((err) => throwError(err))
    );
  }

  private getRequestWithToken(req: HttpRequest<any>) {
    return this.auth.getTokenSilently$.pipe(
      map(token => {
        const tokenReq = req.clone({
          setHeaders: { authorization: `Bearer ${token}` }
        });
        return tokenReq;
      }),
    );
  }
}
