import { isEqual } from './isEqual';

describe('isEqual', () => {
  it('should check equality', () => {
    // objects
    expect(isEqual({}, {})).toEqual(true);
    expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toEqual(true);
    expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toEqual(false);
    expect(isEqual({ a: 100 }, { a: 200 })).toEqual(false);

    // arrays
    expect(isEqual([], [])).toEqual(true);
    expect(isEqual([1, 2], [1, 2])).toEqual(true);
    expect(isEqual([1, 2], [2, 1])).toEqual(false);
    expect(isEqual([{ a: 1, b: 2 }, { c: 3, d: 4 }], [{ a: 1, b: 2 }, { c: 3, d: 4 }])).toEqual(true);
    expect(isEqual([{ a: 1, b: 2 }, { c: 3, d: 4 }], [{ a: 1, b: 200 }, { c: 3, d: 4 }])).toEqual(false);
  });
});
