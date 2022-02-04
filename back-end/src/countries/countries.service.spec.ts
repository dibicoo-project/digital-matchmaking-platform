import { AxiosStatic } from 'axios';
import NodeCache from 'node-cache';
import { CountriesService } from './countries.service';

describe('CountriesService', () => {

  let originalLog: () => void;

  let service: CountriesService;
  let axios: AxiosStatic;
  let cache: NodeCache;

  beforeEach(() => {
    axios = {
      get: (): any => null,
      post: (): any => null
    } as any;

    cache = new NodeCache();
    service = new CountriesService(axios, cache);
  });

  beforeAll(() => {
    originalLog = console.log;
    spyOn(console, 'log'); // hide logging
  });

  afterAll(() => {
    console.log = originalLog;
  });

  it('should return cached countries', async () => {
    cache.set('countries', ['cached']);
    expect(await service.getCountries()).toEqual(['cached'] as any);
  });

  it('should fetch countries from API', async () => {
    spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: [{ name: { common: 'fetched' } }] }));
    expect(await service.getCountries()).toEqual([{ name: 'fetched' }]);
    expect(axios.get).toHaveBeenCalledWith('https://restcountries.com/v3/all', jasmine.anything());
  });
});
