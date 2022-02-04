import { Datastore } from '@google-cloud/datastore';

export const plainId = (item: any): string => {
  const key = item[Datastore.KEY];
  return key ? (item[Datastore.KEY].id || item[Datastore.KEY].name) : undefined;
};

const maybeTransformKey = (item: any) => {
  if (!item.id && item instanceof Object) {
    item.id = plainId(item);
  }
  return item;
};

export const transformId = (body: any) => {
  if (body instanceof Array) {
    body.forEach(maybeTransformKey);
  } else {
    maybeTransformKey(body);
  }
  return body;
};
