import {
  controller, httpGet} from 'inversify-express-utils';
import { CountriesService } from './countries.service';

@controller('/countries')
export class CountriesController {

  constructor(private service: CountriesService) { }

  @httpGet('')
  public async getCountries() {
    return await this.service.getCountries();
  }
}
