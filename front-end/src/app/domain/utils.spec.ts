import { emptyLast, onlyUnique } from "./utils";

describe('Utils', () => {

  it('should filter only unique items', () => {
    const input = [1, 2, 3, 1, 3, 1, 2, 1];
    expect(input.filter(onlyUnique)).toEqual([1, 2, 3]);
  });

  it('should sort empty last', () => {
    const input = ['b', '', 'c', 'a'];
    expect(input.sort(emptyLast)).toEqual(['a', 'b', 'c', '']);
  });

});