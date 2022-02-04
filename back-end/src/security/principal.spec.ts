import { DiBiCooPrincipal } from './principal';

describe('Principal', () => {

  it('should parse user object', async () => {
    const json = { sub: 'johnTheTester', scope: 'admin user tester', other: 'details' };
    const principal = new DiBiCooPrincipal(json);
    expect(principal.userName).toBe('johnTheTester');
    expect(principal.roles).toEqual(['admin', 'user', 'tester']);
    expect(principal.details).toBe(json);
  });

  it('should check is user authenticated', async () => {
    const json = { sub: 'johnTheTester' };
    const principal = new DiBiCooPrincipal(json);
    expect(await principal.isAuthenticated()).toBeTrue();
  });

  it('should check is user has role', async () => {
    const json = { scope: 'user admin tester' };
    const principal = new DiBiCooPrincipal(json);
    expect(await principal.isInRole('admin')).toBeTrue();
    expect(await principal.isInRole('tester')).toBeTrue();
    expect(await principal.isInRole('random')).toBeFalse();
  });

  describe('should check resource owner', () => {
    const json = { sub: 'john' };
    const principal = new DiBiCooPrincipal(json);

    for (let resourceType of ['enterprise', 'application']) {
      it(`for ${resourceType}`, async () => {
        expect(await principal.isResourceOwner(resourceType, { owners: ['john'] })).toBeTrue();
        expect(await principal.isResourceOwner(resourceType, { owners: ['peter'] })).toBeFalse();
      });
    }

    for (let resourceType of ['enterprise_filters', 'application_filters']) {
      it(`for ${resourceType}`, async () => {
        expect(await principal.isResourceOwner(resourceType, { owner: 'john' })).toBeTrue();
        expect(await principal.isResourceOwner(resourceType, { owner: 'peter' })).toBeFalse();
      });
    }

    it(`for unknown resource`, async () => {
      await expectAsync(principal.isResourceOwner('unknown_resource', null)).toBeRejectedWithError();
    });
  });

  it('should check admin', async () => {
    await expectAsync(new DiBiCooPrincipal({ scope: 'user admin tester' }).checkAdmin())
      .toBeResolved();
    await expectAsync(new DiBiCooPrincipal({ scope: 'user tester' }).checkAdmin())
      .toBeRejected();
  });

});
