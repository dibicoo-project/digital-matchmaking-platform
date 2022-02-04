import { Datastore } from '@google-cloud/datastore';
import { injectable } from 'inversify';

export enum EnvKey {
  Auth0 = 'AUTH0',
  Auth0Token = 'AUTH0_TOKEN',
  GeocodeKey = 'GEOCODE_KEY',
  MailJet = 'MAIL_JET'
}

@injectable()
export class EnvService {

  constructor(private datastore: Datastore) { }

  public async get(key: EnvKey): Promise<any> {
    const dsKey = this.datastore.key(['ENV_SETTINGS', key]);
    let [data] = await this.datastore.get(dsKey);

    if (typeof data === 'undefined') {
      // try to read single value from ENV variables
      data = { value: process.env[key] };
    }
    return data;
  }

  public async set(key: EnvKey, data: any) {
    const dsKey = this.datastore.key(['ENV_SETTINGS', key]);
    await this.datastore.save({ key: dsKey, data });
  }
}
