

export function shortText(text: string, maxLength: number) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  const re = new RegExp(`^.{1,${maxLength}}\\S+`, 's');
  const match = text.match(re);
  let short = match ? match[0] : "";
  if (short.length < text.length) {
    short += '...';
  }
  return short;
}