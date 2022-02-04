import { injectable, inject } from 'inversify';
import NodeCache from 'node-cache';
import { AxiosStatic } from 'axios';
import { pick } from '../utils/pick';
import countries from './countries.json';

@injectable()
export class CountriesService {

  constructor(
    @inject('axios') private axios: AxiosStatic,
    private cache: NodeCache
  ) { }

  public async getCountries(): Promise<any[]> {
    let countries: any[] | undefined = this.cache.get('countries');
    if (!countries) {
      try {
        countries = await this.fetchCountries();
        this.cache.set('countries', countries, 7 * 24 * 60 * 60);
      } catch (e) {
        console.error('Error fetching countries:', e.message);
        countries = [];
      }
    }

    return countries;
  }

  private mapApi(data: any[]) {
    return data
      .filter(c => c.region !== 'Antarctic')
      .map((c: any) => (
        {
          ...pick(c, 'region', 'subregion', 'latlng', 'flag', 'cca2', 'cca3', 'altSpellings'),
          name: c.name.common
        }
      ))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private async fetchCountries(): Promise<any[]> {
    console.log('Fetching countries...');

    try {
      const { data } = await this.axios.get(
        'https://restcountries.com/v3/all',
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Fetching countries... Done!');
      return this.mapApi(data);

    } catch (e) {
      console.error(`${e.message} ${JSON.stringify(e.response?.data)}`);
      return this.mapApi(countries);
    }
  }
}
