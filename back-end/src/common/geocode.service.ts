import { AxiosStatic } from 'axios';
import { inject, injectable } from 'inversify';
import { LatLng, Location } from './common.domain';

import { Client, Status } from '@googlemaps/google-maps-services-js';
import { EnvKey, EnvService } from './environment.service';

@injectable()
export class GeocodeService {

  private client: Client;

  constructor(@inject('axios') axios: AxiosStatic, private env: EnvService) {
    this.client = new Client({ axiosInstance: axios });
  }

  public async getLatLng(loc: Location): Promise<LatLng> {
    const key = await this.env.get(EnvKey.GeocodeKey);
    const { data } = await this.client.geocode({
      params: {
        address: [loc.country, loc.city, loc.address, loc.zipCode].filter(p => !!p).join(' '),
        key: key.value
      }
    });

    console.log('geocoding', loc, data.results[0]?.geometry?.location, data.error_message);

    if (data.status === Status.OK) {
      const coords = data.results[0]?.geometry?.location;
      return [coords.lat, coords.lng];
    } else {
      return undefined;
    }
  }
}
