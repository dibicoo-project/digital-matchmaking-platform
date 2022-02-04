import { injectable, inject } from 'inversify';
import NodeCache from 'node-cache';
import { AxiosStatic } from 'axios';
import { Datastore } from '@google-cloud/datastore';
import moment from 'moment';
import { EnvService, EnvKey } from '../common/environment.service';

interface Auth0Token {
  token_type: string;
  access_token: string;
  expires_in: number;
  expires_at: Date;
}

export interface Auth0User {
  user_id: string;
  name: string;
  email: string;
}

@injectable()
export class Auth0UsersService {

  constructor(@inject('axios') private axios: AxiosStatic,
    private cache: NodeCache,
    private env: EnvService) {
  }

  public async getUsers(): Promise<Auth0User[]> {
    let users: Auth0User[] | undefined = this.cache.get('users');
    if (!users) {
      try {
        users = await this.fetchUsers();
        this.cache.set('users', users, 30 * 60); // 30 minutes
      } catch (e) {
        console.error('Auth0 error:', e.message);
        users = [];
      }
    }

    return users;
  }

  private async fetchUsers(): Promise<Auth0User[]> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Using local Auth0 users...');
      return Promise.resolve([
        { user_id: 'google-oauth2|109503744650507422207', name: 'Vitalijs', email: 'vitalijs@example.com' },
        { user_id: 'google-oauth2|115457889803621453309', name: 'Aleksejs', email: 'aleksejs@example.com' },
      ]);
    }

    console.log('Fetching Auth0 users...');

    let token: Auth0Token | undefined = this.cache.get('token');
    if (!token) {
      token = await this.fetchToken();
      this.cache.set('token', token, token.expires_in);
    }

    const pageSize = 100;
    const result: Auth0User[] = [];
    const lastLogin = moment().subtract(6, 'months').toISOString();

    // Auth0 allows only up to 10 pages of results
    for (let page = 0; page < 10; page++) {
      try {
        const { data } = await this.axios.get(
          `https://dibicoo.eu.auth0.com/api/v2/users`,
          {
            params: {
              fields: 'user_id,name,email,last_login',
              per_page: pageSize,
              page,
              q: `last_login:{${lastLogin} TO *}`,
              sort: 'last_login:-1'
            },
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${token.token_type} ${token.access_token}`
            }
          }
        );

        console.log(`Fetching Auth0 users, page ${page}... Done!`);
        result.push(...data);
        if (!data || !data.length || data.length < pageSize) {
          break;
        }
      } catch (e) {
        console.error(`Users fetch error: ${e.message} ${JSON.stringify(e.response?.data)}`);
        break;
      }
    }

    return result;
  }

  public async fetchToken(): Promise<Auth0Token> {
    const token: Auth0Token = await this.env.get(EnvKey.Auth0Token);

    if (token && token.expires_at && moment().isBefore(token.expires_at)) {
      console.log('Reusing stored Auth0 token.');
      return token;
    }

    console.log('Refreshing Auth0 token...');
    const params = await this.env.get(EnvKey.Auth0);

    const payload = {
      ...params,
      audience: 'https://dibicoo.eu.auth0.com/api/v2/',
      grant_type: 'client_credentials'
    };

    try {
      const { data } = await this.axios.post(
        'https://dibicoo.eu.auth0.com/oauth/token',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      data.expires_at = moment().add(data.expires_in, 's').toDate();
      await this.env.set(EnvKey.Auth0Token, data);

      console.log('Refreshing Auth0 token... Done!');
      return data;
    } catch (e) {
      throw new Error(`Token refresh failed: ${e.message} ${JSON.stringify(e.response?.data)}`);
    }
  }

}
