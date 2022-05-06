import { shortText } from "./shortText";


describe('short text', () => {
  const text = 'Lorem ipsum dolor sit amet. Maecenas justo sem, posuere ac fermentum vitae, molestie eu leo.';

  it('should return short text', () => {
    expect(shortText(text, 20)).toBe('Lorem ipsum dolor sit...');
    expect(shortText(text, 22)).toBe('Lorem ipsum dolor sit amet....')
    expect(shortText(text.slice(0, 11), 20)).toBe('Lorem ipsum')
  });

  it('should handle undefined', () => {
    expect(shortText(undefined as any, 10)).toBeUndefined();
  })
});