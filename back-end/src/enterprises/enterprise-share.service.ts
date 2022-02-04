import { injectable } from 'inversify';
import { EnterpriseService } from './enterprise.service';
import { DiBiCooPrincipal } from '../security/principal';
import { Invitation, InvitationBean } from './enterprise.domain';
import { plainId } from '../utils/transform-datastore-id';
import { InvitationRepository } from './invitation.repository';
import { pick } from '../utils/pick';
import { notFound, badRequest } from '../utils/common-responses';
import { EnterpriseRepository, PublicEnterpriseRepository } from './enterprise.repository';
import { Auth0UsersService } from '../auth0-users/auth0-users.service';

@injectable()
export class EnterpriseShareService {
  constructor(private service: EnterpriseService,
              private enterpriseRepository: EnterpriseRepository,
              private publicEnterpriseRepository: PublicEnterpriseRepository,
              private repository: InvitationRepository,
              private users: Auth0UsersService
  ) { }

  private toBean(item: Invitation): Partial<InvitationBean> {
    return {
      id: plainId(item),
      ...pick(item, 'name', 'createdTs'),
    };
  }

  public async getSharingDetails(id: string, user: DiBiCooPrincipal) {
    const enterprise = await this.service.getOwnEnterprise(id, user);
    const enterpriseId = plainId(enterprise);
    const invites = await this.repository.find(q => q.filter('enterpriseId', enterpriseId));

    const users = await this.users.getUsers();

    const bean = {
      id: enterpriseId,
      companyName: enterprise.companyName,
      owners: enterprise.owners.map(o => ({
        id: o,
        name: users?.find(u => u.user_id === o) ?.name || o,
        self: o === user.userName ? true : undefined
      })),
      invites: invites.map(this.toBean)
    };
    return bean;
  }

  public async addShare(enterpriseId: string, name: any, user: DiBiCooPrincipal) {
    const enterprise = await this.service.getOwnEnterprise(enterpriseId, user);
    const entity: Invitation = {
      name,
      enterpriseId: plainId(enterprise),
      createdBy: user.userName,
      createdTs: new Date()
    };

    const id = await this.repository.insert(entity);
    return { ...this.toBean(entity), id };
  }

  public async removeShare(enterpriseId: string, bean: any, user: DiBiCooPrincipal) {
    const enterprise = await this.service.getOwnEnterprise(enterpriseId, user);

    if (!!bean.invite) {
      const invite = await this.repository.findOne(bean.invite);
      if (!invite || invite.enterpriseId !== enterpriseId) {
        return Promise.reject(notFound);
      }

      await this.repository.delete(bean.invite);
    } else if (!!bean.owner) {
      if (enterprise.owners.length < 2) {
        return Promise.reject(badRequest);
      }

      enterprise.owners = enterprise.owners.filter(o => o !== bean.owner);
      await this.enterpriseRepository.update(enterprise, enterpriseId);

      const pub = await this.publicEnterpriseRepository.findOne(enterpriseId);
      if (pub) {
        pub.owners = enterprise.owners;
        await this.publicEnterpriseRepository.update(pub, enterpriseId);
      }
    } else {
      return Promise.reject(badRequest);
    }
  }

  public async getInvitation(id: string) {
    const invitation = await this.repository.findOne(id);
    if (!invitation) {
      return Promise.reject(notFound);
    }

    const enterprise = await this.enterpriseRepository.findOne(invitation.enterpriseId);
    if (!enterprise) {
      return Promise.reject(notFound);
    }

    const isPublic = await this.publicEnterpriseRepository.exists(invitation.enterpriseId);

    return {
      ...this.toBean(invitation),
      companyName: enterprise.companyName,
      enterpriseId: isPublic ? plainId(enterprise) : undefined
    };
  }

  public async acceptInvitation(id: string, user: DiBiCooPrincipal) {
    const invitation = await this.repository.findOne(id);
    if (!invitation) {
      return Promise.reject(notFound);
    }

    const enterprise = await this.enterpriseRepository.findOne(invitation.enterpriseId);
    if (!enterprise) {
      return Promise.reject(notFound);
    }

    if (!enterprise.owners.includes(user.userName)) {
      enterprise.owners.push(user.userName);
      await this.enterpriseRepository.update(enterprise, invitation.enterpriseId);

      const pub = await this.publicEnterpriseRepository.findOne(invitation.enterpriseId);
      if (pub) {
        pub.owners.push(user.userName);
        await this.publicEnterpriseRepository.update(pub, invitation.enterpriseId);
      }

      await this.repository.delete(plainId(invitation));
    }

    return plainId(enterprise);
  }
}
