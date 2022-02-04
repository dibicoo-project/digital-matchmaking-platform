import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStateService {

  constructor() { }

  public put(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  public get(key: string, defaultValue?: any) {
    const str = localStorage.getItem(key);
    try {
      return str ? JSON.parse(str) : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  }
}
