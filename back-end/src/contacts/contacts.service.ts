import { injectable } from 'inversify';
import { on } from 'process';
import { ApplicationRepository } from '../applications/application.repository';
import { EnterpriseRepository } from '../enterprises/enterprise.repository';
import { DiBiCooPrincipal } from '../security/principal';

@injectable()
export class ContactsService {

  constructor(
    private enterpriseRepository: EnterpriseRepository,
    private applicationReposiory: ApplicationRepository
  ) { }

  async getAllContacts(user: DiBiCooPrincipal) {
    const companies = await this.enterpriseRepository.findByOwner(user.userName);
    const apps = await this.applicationReposiory.findByOwner(user.userName);

    const all = new Map();

    [
      ...companies.flatMap(c => c.contacts),
      ...apps.flatMap(c => c.contacts)
    ].forEach(one => all.set(JSON.stringify(one), one));

    return Array.from(all.values());
  }

}
