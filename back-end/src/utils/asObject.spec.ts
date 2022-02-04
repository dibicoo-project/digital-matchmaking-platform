import { asObject } from './asObject';

describe('asObject', () => {

  it('should convert regular object', () => {
    const obj: any = { a: 1, b: 'bbb', c: { c1: 1, c2: 2 } };
    expect(asObject(obj)).toEqual(obj);
  });

  it('should convert Error object', () => {
    const err = new TypeError('testing');
    const obj = asObject(err);
    expect(obj.name).toEqual('TypeError');
    expect(obj.message).toEqual('testing');
    expect(obj.stack.length).toBeGreaterThan(0);
  });
});
