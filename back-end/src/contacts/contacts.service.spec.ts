import { createMock } from './../../test/utils';
import { DiBiCooPrincipal } from '../security/principal';
import { ApplicationRepository } from '../applications/application.repository';
import { Application } from '../applications/application.domain';
import { EnterpriseRepository } from '../enterprises/enterprise.repository';
import { Enterprise } from '../enterprises/enterprise.domain';
import { ContactsService } from './contacts.service';

describe('ContactsService', () => {

  let enterpriseRepository: EnterpriseRepository;
  let applicationRepository: ApplicationRepository;

  let service: ContactsService;

  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john'
    } as any;

    enterpriseRepository = createMock(EnterpriseRepository);
    applicationRepository = createMock(ApplicationRepository);

    service = new ContactsService(enterpriseRepository, applicationRepository);
  });


  it('should get user contacts', async () => {
    spyOn(enterpriseRepository, 'findByOwner').and.returnValue(Promise.resolve(
      [
        { contacts: [{ name: 'A' }, { name: 'B' }] },
        { contacts: [{ name: 'C' }] },
      ] as Enterprise[]
    ));

    spyOn(applicationRepository, 'findByOwner').and.returnValue(Promise.resolve(
      [
        { contacts: [{ name: 'X' }] },
        { contacts: [{ name: 'A' }] },
        { contacts: [{ name: 'C' }] },
      ] as Application[]
    ));

    const res = await service.getAllContacts(user);

    expect(enterpriseRepository.findByOwner).toHaveBeenCalledWith('john');
    expect(applicationRepository.findByOwner).toHaveBeenCalledWith('john');

    expect(res.map(r => r.name)).toEqual(['A', 'B', 'C', 'X']);
    
  });

});
