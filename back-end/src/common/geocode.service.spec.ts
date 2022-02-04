import { AxiosStatic } from 'axios';
import { Location } from './common.domain';
import { createMock } from './../../test/utils';
import { EnvService } from './environment.service';
import { GeocodeService } from './geocode.service';

describe('GeocodeService', () => {

  let env: EnvService;
  let axios: AxiosStatic;
  let service: GeocodeService;
  let originalLog: any;

  beforeAll(() => {
    originalLog = console.log;
    spyOn(console, 'log'); // hide logging
  });

  afterAll(() => {
    console.log = originalLog;
  });

  beforeEach(() => {
    env = createMock(EnvService);

    axios = {
      defaults: {}
    } as any;

    service = new GeocodeService(axios, env);
    delete process.env.testKey;
  });

  it('should geocode location', async () => {
    spyOn(env, 'get').and.returnValue({ value: 'key-123' } as any);

    const data = {
      status: 'OK',
      results: [{ geometry: { location: { lat: 123, lng: 234 } } }]
    };
    const spy = jasmine.createSpy('geocode-spy').and.returnValue({ data });
    service['client'] = { geocode: spy } as any;

    const location: Location = {
      country: 'Wonderland',
      city: 'Neverwinter',
      address: 'Nights street 123',
      zipCode: 'XY-1234'
    };

    const res = await service.getLatLng(location);
    expect(spy).toHaveBeenCalledWith({ params: { address: 'Wonderland Neverwinter Nights street 123 XY-1234', key: 'key-123' } });
    expect(res).toEqual([123, 234]);
  });


});
