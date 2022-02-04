import { Inject, Injectable } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';

interface DiBiCooCookie {
  media: boolean;
  tracking: boolean;
}

@Injectable()
export class DiBiCooCookieService {

  private cookieName = 'dibicoo.consent';

  constructor(private cookies: CookieService,
    @Inject('LOCATION') public location: Location) { }

  get cookie(): DiBiCooCookie {
    try {
      return JSON.parse(this.cookies.get(this.cookieName));
    } catch (e) {
      return {} as DiBiCooCookie;
    }
  }

  save(value: DiBiCooCookie) {
    this.cookies.set(this.cookieName, JSON.stringify(value), 30, '/');
  }

  reset() {
    this.cookies.delete(this.cookieName, '/');
    this.location.reload();
  }

  isSaved() {
    return this.cookies.check(this.cookieName);
  }

  checkTracking(): boolean {
    return this.cookie.tracking === true;
  }

  checkMedia(): boolean {
    return this.cookie.media === true;
  }


}
