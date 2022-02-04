import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function distinctUntilObjChanged<T>() {
  return distinctUntilChanged<T, string>(null, (x) => JSON.stringify(x));
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function select<T,K>(fn: (state: T) => K) {
  return (source: Observable<T>) => source.pipe(map(fn), distinctUntilObjChanged());
}
