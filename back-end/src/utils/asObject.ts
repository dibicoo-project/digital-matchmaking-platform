
export const asObject = (value: any): any => {
  if (value instanceof Error) {
    const error: { [key: string]: any } = {};
    error.name = value.name; // inherited from Error
    Object.getOwnPropertyNames(value)
      .forEach((key: string) => {
        error[key] = (value as any)[key];
      });
    return error;
  } else {
    return value;
  }
};
