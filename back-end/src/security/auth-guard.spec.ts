import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  const next = jasmine.createSpy('nextSpy');

  beforeEach(() => {
    next.calls.reset();
  });

  afterEach(() => {
    expect(next).toHaveBeenCalledTimes(1);
  });

  describe('isAuthenticated', () => {
    const handler = AuthGuard.isAuthenticated();

    it('should pass valid user', async () => {
      const req: any = {
        user: {
          sub: 'johnTheTester'
        }
      };
      await handler(req, null as any, next);
      expect(next).toHaveBeenCalledWith(null);
    });

    it('should fail for anonymous user', async () => {
      const req: any = {};
      await handler(req, null as any, next);
      expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Unauthorized', status: 401 }));
    });
  });

  describe('isInRole', () => {
    const handler = AuthGuard.isInRole('tester');

    it('should pass if user has role', async () => {
      const req: any = {
        user: {
          scope: 'john the tester'
        }
      };
      await handler(req, null as any, next);
      expect(next).toHaveBeenCalledWith(null);
    });

    it('should fail if user has different roles', async () => {
      const req: any = {
        user: {
          scope: 'peter admin'
        }
      };
      await handler(req, null as any, next);
      expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Forbidden', status: 403 }));
    });

    it('should fail if user has no roles', async () => {
      const req: any = {};
      await handler(req, null as any, next);
      expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Forbidden', status: 403 }));
    });
  });

  describe('or(...) combination', () => {
    const checkPass = (_1: any, _2: any, nextFn: any) => { nextFn(null); };
    const checkFail = (_1: any, _2: any, nextFn: any) => { nextFn({ status: 499 }); };

    it('should pass if at least one check passes', async () => {
      const handler = AuthGuard.or(checkFail, checkFail, checkPass);
      await handler(null as any, null as any, next);
      expect(next).toHaveBeenCalledWith(null);
    });

    it('should fail if all checks failed', async () => {
      const handler = AuthGuard.or(checkFail, checkFail, checkFail);
      await handler(null as any, null as any, next);
      expect(next).toHaveBeenCalledWith(jasmine.objectContaining({ status: 499 }));
    });

  });
});
