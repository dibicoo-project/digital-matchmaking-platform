export function required<T>(obj: T, ...keys: Array<keyof T>) {
  if (!keys.length) {
    throw new Error('Validation keys are not provided!');
  }
  return keys.every(key =>
    obj[key] instanceof Array ? (obj[key] as any).length > 0 : !!obj[key]
  );
}
