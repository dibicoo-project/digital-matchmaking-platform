import { interfaces } from 'inversify-express-utils';
import { Enterprise } from '../enterprises/enterprise.domain';
import { Application } from '../applications/application.domain';
import { forbidden } from '../utils/common-responses';
import { FiltersEntity } from '../matchmaking/matchmaking.domain';

export class DiBiCooPrincipal implements interfaces.Principal {
  public readonly details: any;
  public readonly roles: string[];

  public constructor(details: any) {
    this.details = details || {};
    this.roles = this.details.scope ? this.details.scope.split(' ') : [];
  }

  get userName() {
    return this.details.sub;
  }

  public async isAuthenticated(): Promise<boolean> {
    return !!this.userName;
  }

  public async isResourceOwner(...[type, data, _]: any): Promise<boolean> {
    switch (type) {
      case 'enterprise':
        return (data as Enterprise).owners?.includes(this.userName);
      case 'enterprise_filters':
        return (data as FiltersEntity).owner === this.userName;
      case 'application':
        return (data as Application).owners?.includes(this.userName);
      case 'application_filters':
          return (data as FiltersEntity).owner === this.userName;
      default:
        throw new Error(`Resource type ${type} is not supported!`);
    }
  }

  public async isInRole(role: string): Promise<boolean> {
    return this.roles.includes(role);
  }

  public async checkAdmin() {
    const isAdmin = await this.isInRole('admin');
    if (!isAdmin) {
      await Promise.reject(forbidden);
    }    
  }
}
