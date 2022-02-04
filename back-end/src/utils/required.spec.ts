import { required } from './required';

describe('required', () => {
  it('should check required attributes', () => {
    const obj = { a: 1, b: 2, c: [1, 2, 3], d: [] as any[] };
    expect(required(obj, 'a')).toBeTrue();
    expect(required(obj, 'a', 'b')).toBeTrue();
    expect(required(obj, 'c')).toBeTrue();
    expect(required(obj, 'd')).toBeFalse();
    expect(required(obj, 'x' as any)).toBeFalse();
    expect(required(obj, 'a', 'c')).toBeTrue();
    expect(required(obj, 'a', 'd')).toBeFalse();
    expect(required(obj, 'a', 'x' as any)).toBeFalse();
  });

  it('should fail if keys are not provided', ()=> {
    expect( () => { required({}); } ).toThrowError();
  });
});
