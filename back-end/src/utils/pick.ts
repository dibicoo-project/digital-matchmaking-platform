export function pick<T>(obj: T | undefined, ...keys: Array<keyof T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj || {} as T).filter(([key]) => keys.includes(key as any))
  ) as Partial<T>;
}
