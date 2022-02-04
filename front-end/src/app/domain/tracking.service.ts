/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

declare let gtag: (...args: any[]) => void;

@Injectable()
export class TrackingService {

  constructor() {}

  enable() {
    // it is disabled by default in index.html
    window['ga-disable-G-TLMBHEFTTN'] = undefined;
  }

  pageView(url: string) {
    const match = /^\/(enterprises|applications)\/(\d+)/.exec(url);
    let eventName = 'page_view';
    let params = {};

    if (match) {
      if (match[1] === 'enterprises') {
        eventName = 'company_profile_view';
        params = {
          page_title: 'Company profile',
          company_id: match[2]
        };
      } else if (match[1] === 'applications') {
        eventName = 'application_view';
        params = {
          page_title: 'Application',
          application_id: match[2]
        };
      }
    }

    gtag('event', eventName, { ...params, page_path: url });
  }
}
