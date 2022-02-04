import { createMock } from './../../test/utils';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';


describe('CountriesController', () => {

  let controller: CountriesController;
  let service: CountriesService;
  
  beforeEach(() => {
    service = createMock(CountriesService);
    controller = new CountriesController(service);    
  });

  it('should get list of countries', async () => {
    spyOn(service, 'getCountries').and.returnValue(
      Promise.resolve([{}, {}])
    );
    const list = await controller.getCountries();

    expect(list.length).toBe(2);
    expect(service.getCountries).toHaveBeenCalled();
  });
});
