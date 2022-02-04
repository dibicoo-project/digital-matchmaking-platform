import { createMock } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { UserContactsController } from './user-contacts.controller';
import { ContactsService } from './contacts.service';

describe('UserContactsController', () => {

  let controller: UserContactsController;
  let service: ContactsService;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    service = createMock(ContactsService);
    controller = new UserContactsController(service);
    user = new DiBiCooPrincipal({ sub: 'tester' });
  });

  it('should get user contacts', async () => {
    spyOn(service, 'getAllContacts').and.returnValue(
      Promise.resolve([])
    );
    await controller.getAll(user);

    expect(service.getAllContacts).toHaveBeenCalled();
  });
});
