import { DiBiCooAuthProvider } from './auth-provider';

describe('AuthProvider', () => {
  const next = jasmine.createSpy('nextSpy');

  beforeEach(() => {
    next.calls.reset();
  });

  it('should return user if check pass', async () => {
    const provider = new DiBiCooAuthProvider();
    provider.check = (req, _, n) => {
      (req as any).user = { sub: 'john', scope: 'tester' };
      n();
    };

    const user = await provider.getUser({} as any, null as any, next);

    expect(user.userName).toEqual('john');
    expect(await user.isAuthenticated()).toBeTrue();
    expect(await user.isInRole('tester')).toBeTrue();
    expect(await user.isInRole('admin')).toBeFalse();
    expect(next).toHaveBeenCalledTimes(0);
  });

  it('should return error if check fail', () => {
    const provider = new DiBiCooAuthProvider();
    provider.check = (_1, _2, n) => {
      n({ error: 'testing' });
    };
    provider.getUser(null as any, null as any, next);
    expect(next).toHaveBeenCalledWith({ error: 'testing'});
  });
});
