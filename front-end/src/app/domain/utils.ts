
export const onlyUnique = (val, idx, arr) => arr.indexOf(val) === idx;
export const emptyLast = (a: string, b: string) => !a ? 1 : (!b ? -1 : a.localeCompare(b));
