
import {
  controller, httpGet, principal} from 'inversify-express-utils';
import { DiBiCooPrincipal } from '../security/principal';
import { AuthGuard } from '../security/auth-guard';
import { ContactsService } from './contacts.service';

@controller('/user/contacts', AuthGuard.isAuthenticated())
export class UserContactsController {

  constructor(private service: ContactsService) { }

  @httpGet('')
  public async getAll(@principal() user: DiBiCooPrincipal) {
    return await this.service.getAllContacts(user);
  }

}
