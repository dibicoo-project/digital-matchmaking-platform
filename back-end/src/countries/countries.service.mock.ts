import { CountriesService } from "./countries.service";

export class CountriesServiceMock extends CountriesService {
  constructor() {
    super(null as any, null as any);
  }

  public async getCountries() {
    return Promise.resolve([
      { name: 'c1', subregion: 'sub1a', region: 'reg1' },
      { name: 'c2', subregion: 'sub1b', region: 'reg1' },
      { name: 'c3', subregion: 'sub1b', region: 'reg1' },
      { name: 'c4', subregion: 'sub2a', region: 'reg2' },
      { name: 'c5', subregion: 'sub2b', region: 'reg2' },
      { name: 'c6', subregion: 'sub3a', region: 'reg3' },
      { name: 'c7', subregion: 'sub4a', region: 'reg4' }
    ])
  }
}
