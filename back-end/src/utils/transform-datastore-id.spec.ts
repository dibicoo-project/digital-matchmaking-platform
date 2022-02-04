import { transformId, plainId } from './transform-datastore-id';
import { Datastore } from '@google-cloud/datastore';

describe('transform-datastore-id', () => {

  it('should add ID field to object', () => {
    const body: any = { name: 'test' };
    body[Datastore.KEY] = { id: 123 };

    const result = transformId(body);

    expect(result).toEqual({ id: 123, name: 'test' });
  });

  it('should add ID fields to array', () => {
    const body: any[] = [{ name: 'one' }, { name: 'two' }];
    body[0][Datastore.KEY] = { id: 111 };
    body[1][Datastore.KEY] = { id: 222 };

    const result = transformId(body);

    expect(result[0]).toEqual({ id: 111, name: 'one' });
    expect(result[1]).toEqual({ id: 222, name: 'two' });
  });

  it('should not add ID field if it already exists', () => {
    const body: any = { id: 999, name: 'test' };
    body[Datastore.KEY] = { id: 123 };

    const result = transformId(body);

    expect(result).toEqual({ id: 999, name: 'test' });
  });

  it('should return plain ID', () => {
    const obj: any = { name: 'test' };
    expect(plainId(obj)).toBeUndefined();

    obj[Datastore.KEY] = { id: '123' };
    expect(plainId(obj)).toEqual('123');
  });
});
