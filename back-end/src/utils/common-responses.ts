export const badRequest = { name: 'BadRequest', status: 400, message: 'Bad request' };
export const badRequestFn = (message: string, errors: any = undefined) =>
  ({ name: 'BadRequest', status: 400, message, errors });
export const validationErrorFn = (errors: any = undefined) =>
  ({ name: 'BadRequest', status: 400, message: 'Validation error', errors });
export const unauthorized = { name: 'Unauthorized', status: 401, message: 'Access denied for anonymous user' };
export const forbidden = { name: 'Forbidden', status: 403, message: 'Access denied' };
export const notFound = { name: 'NotFound', status: 404, message: 'Resource not found' };
