import { pick } from './pick';

describe('pick', () => {
  it('should pick attributes', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    expect(pick(obj, 'a')).toEqual({ a: 1 });
    expect(pick(obj, 'a', 'c')).toEqual({ a: 1, c: 3 });
    expect(pick(obj, 'x' as any)).toEqual({ });
    expect(pick(undefined as any, 'a')).toEqual({ });
  });
});
