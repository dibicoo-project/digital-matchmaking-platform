function objectsEqual(a: any, b: any): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (typeof a === 'object') {
    if (aKeys.length === 0 && bKeys.length === 0) {
      return true;
    }

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    return aKeys.every(k => objectsEqual(a[k], b[k]));

  } else {
    return a === b;
  }
}

export function isEqual(obj1: any | any[], obj2: any | any[]): boolean {
  const a = (obj1 instanceof Array) ? obj1 : [obj1];
  const b = (obj2 instanceof Array) ? obj2 : [obj2];

  return a.length === b.length &&
    a.every((o, idx) => objectsEqual(o, b[idx])) &&
    b.every((o, idx) => objectsEqual(o, a[idx]));
}
