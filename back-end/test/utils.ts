import { Datastore } from '@google-cloud/datastore';

export function createMock<T>(type: new (...args: any) => T): T {
  let proto = type.prototype;
  const result = {} as any;
  do {
    const descriptors = Object.getOwnPropertyDescriptors(proto);
    Object.entries(descriptors)
      .forEach(([key, descr]) => {
        if (typeof descr.value === 'function') {
          result[key] = (): any => null;
        } else if (typeof descr.get === 'function') {
          result[key] = null;
        } else {
          console.error('Unrecognized descriptor for mocking', descr);
        }
      });
    proto = Object.getPrototypeOf(proto);
  } while (proto.constructor.name !== 'Object');

  return result;
}

export function mockKey(obj: any, id: string) {
  const res = { ...obj, };
  res[Datastore.KEY] = { id };
  return res;
}
