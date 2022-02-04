import { createMock, mockKey } from './../../test/utils';

import { EnterpriseShareService } from './enterprise-share.service';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseRepository, PublicEnterpriseRepository } from './enterprise.repository';
import { EnterpriseService } from './enterprise.service';
import { InvitationRepository } from './invitation.repository';
import { Auth0UsersService } from '../auth0-users/auth0-users.service';

describe('EnterpriseShareService', () => {

  let repository: InvitationRepository;
  let enterpriseService: EnterpriseService;
  let enterpriseRepository: EnterpriseRepository;
  let publicEnterpriseRepository: PublicEnterpriseRepository;
  let service: EnterpriseShareService;
  let auth0users: Auth0UsersService;

  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true),
      isInRole: () => Promise.resolve(false)
    } as any;

    const enterprise = mockKey({ companyName: 'Testing', owners: ['john', 'peter'] }, '123');

    repository = createMock(InvitationRepository);
    enterpriseService = createMock(EnterpriseService);
    enterpriseRepository = createMock(EnterpriseRepository);
    publicEnterpriseRepository = createMock(PublicEnterpriseRepository);
    auth0users = createMock(Auth0UsersService);

    spyOn(enterpriseService, 'getOwnEnterprise').and.returnValue(Promise.resolve(enterprise));
    service = new EnterpriseShareService(enterpriseService, enterpriseRepository, publicEnterpriseRepository, repository, auth0users);
  });

  it('should get enterprise sharing details', async () => {
    spyOn(repository, 'find').and.returnValue(Promise.resolve([mockKey({}, '111'), mockKey({}, '222')]));
    spyOn(auth0users, 'getUsers').and.returnValue(Promise.resolve([{ user_id: 'peter', name: 'Peter The Tester', email: 'p@test.com' }]));
    const details = await service.getSharingDetails('123', user);

    expect(enterpriseService.getOwnEnterprise).toHaveBeenCalledWith('123', user);
    expect(details.id).toEqual('123');
    expect(details.owners).toContain(jasmine.objectContaining({ id: 'john', self: true } as any));
    expect(details.owners).toContain(jasmine.objectContaining({ id: 'peter', name: 'Peter The Tester' } as any));
    expect(details.invites).toContain({ id: '111' });
    expect(details.invites).toContain({ id: '222' });
  });

  it('should add enterprise share', async () => {
    spyOn(repository, 'insert').and.returnValue(Promise.resolve('new-id'));
    const invite = await service.addShare('123', 'Mary', user);

    expect(enterpriseService.getOwnEnterprise).toHaveBeenCalledWith('123', user);
    expect(invite.id).toEqual('new-id');
    expect(invite.name).toEqual('Mary');
  });

  it('should remove enterprise invite', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ enterpriseId: '123' } as any));
    spyOn(repository, 'delete').and.returnValue(Promise.resolve());
    await service.removeShare('123', { invite: '123-456' }, user);

    expect(enterpriseService.getOwnEnterprise).toHaveBeenCalledWith('123', user);
    expect(repository.findOne).toHaveBeenCalledWith('123-456');
    expect(repository.delete).toHaveBeenCalled();
  });

  it('should remove enterprise manager', async () => {
    spyOn(enterpriseRepository, 'update');
    spyOn(publicEnterpriseRepository, 'update');
    spyOn(publicEnterpriseRepository, 'findOne').and.returnValue(Promise.resolve({ owners: ['john', 'peter'] } as any));

    await service.removeShare('123', { owner: 'john' }, user);

    expect(enterpriseService.getOwnEnterprise).toHaveBeenCalledWith('123', user);
    expect(enterpriseRepository.update).toHaveBeenCalledWith(jasmine.objectContaining({ owners: ['peter'] }), '123');
    expect(publicEnterpriseRepository.update).toHaveBeenCalledWith(jasmine.objectContaining({ owners: ['peter'] }), '123');
  });

  it('should reject remove invite from other enterprise', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ enterpriseId: 'other' } as any));

    await expectAsync(service.removeShare('123', { invite: '123-456' }, user)).toBeRejected();
  });

  it('should reject remove unknown invite ', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve(undefined));

    await expectAsync(service.removeShare('123', { invite: '123-456' }, user)).toBeRejected();
  });

  it('should reject removing the only owner ', async () => {
    await service.removeShare('123', { owner: 'john' }, user);
    await expectAsync(
      service.removeShare('123', { owner: 'peter' }, user)
    ).toBeRejected();
  });

  it('should get invitation details', async () => {
    spyOn(repository, 'findOne').and.returnValue(
      Promise.resolve(mockKey({ enterpriseId: '123' }, '123-456'))
    );
    spyOn(enterpriseRepository, 'findOne').and.returnValue(
      Promise.resolve({ companyName: 'testing' } as any)
    );

    const inv = await service.getInvitation('123-456');

    expect(repository.findOne).toHaveBeenCalledWith('123-456');
    expect(enterpriseRepository.findOne).toHaveBeenCalledWith('123');
    expect(inv.companyName).toBe('testing');
  });

  it('should accept invitation', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve(mockKey({ enterpriseId: '123' }, '123-456')));
    spyOn(repository, 'delete');

    spyOn(enterpriseRepository, 'findOne').and.returnValue(Promise.resolve({ owners: ['peter'] } as any));
    spyOn(publicEnterpriseRepository, 'findOne').and.returnValue(Promise.resolve({ owners: ['peter'] } as any));
    spyOn(enterpriseRepository, 'update');
    spyOn(publicEnterpriseRepository, 'update');

    await service.acceptInvitation('123-456', user);

    expect(repository.findOne).toHaveBeenCalledWith('123-456');
    expect(enterpriseRepository.findOne).toHaveBeenCalledWith('123');

    expect(enterpriseRepository.update).toHaveBeenCalledWith(jasmine.objectContaining({ owners: ['peter', 'john'] }), '123');
    expect(publicEnterpriseRepository.update).toHaveBeenCalledWith(jasmine.objectContaining({ owners: ['peter', 'john'] }), '123');
    expect(repository.delete).toHaveBeenCalledWith('123-456');
  });

});
