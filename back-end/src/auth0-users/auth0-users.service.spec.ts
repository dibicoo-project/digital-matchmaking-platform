import { Auth0UsersService } from './auth0-users.service';
import { AxiosStatic } from 'axios';
import NodeCache from 'node-cache';
import { createMock } from '../../test/utils';
import moment from 'moment';
import 'moment-timezone';
import { EnvService } from '../common/environment.service';

describe('Auth0UsersService', () => {

  let originalLog: () => void;

  let service: Auth0UsersService;
  let axios: AxiosStatic;
  let cache: NodeCache;
  let env: EnvService;

  beforeEach(() => {
    axios = {
      get: (): any => null,
      post: (): any => null
    } as any;

    env = createMock(EnvService);
    cache = new NodeCache();
    service = new Auth0UsersService(axios, cache, env);
  });

  beforeAll(() => {
    originalLog = console.log;
    spyOn(console, 'log'); // hide logging
  });

  afterAll(() => {    
    console.log = originalLog;
  });

  it('should return cached users', async () => {
    cache.set('users', ['cached']);
    expect(await service.getUsers()).toEqual(['cached'] as any);
  });

  it('should return local users', async () => {
    spyOn(axios, 'get');
    const users = await service.getUsers();
    expect(users.length).toEqual(2);
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('should fetch users from Auth0', async () => {
    jasmine.clock().mockDate(new Date('2022-01-26T10:20:30Z'));

    process.env.NODE_ENV = 'production';
    cache.set('token', { access_token: 'fake', token_type: 'test' });

    spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: ['fetched'] }));

    const res = await service.getUsers();
    expect(res).toEqual(['fetched'] as any);
    expect(axios.get).toHaveBeenCalledWith(
      'https://dibicoo.eu.auth0.com/api/v2/users',
      {
        headers: jasmine.objectContaining({ Authorization: 'test fake' }),
        params: {
          fields: 'user_id,name,email,last_login',
          per_page: 100,
          page: 0,
          q: 'last_login:{2021-07-26T10:20:30.000Z TO *}',
          sort: 'last_login:-1'
        },
      }
    );

    jasmine.clock().uninstall();    
  });

  it('should reuse stored token', async () => {
    process.env.NODE_ENV = 'production';

    spyOn(env, 'get').and.returnValue(Promise.resolve(
      { access_token: 'stored', token_type: 'test', expires_at: moment().add(1, 'minute') } as any
    ));

    spyOn(axios, 'get').and.returnValue(Promise.resolve({
      data: ['fetched']
    }));
    spyOn(axios, 'post');

    expect(await service.getUsers()).toEqual(['fetched'] as any);
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalled();

    process.env.NODE_ENV = undefined;
  });

  it('should fetch token from Auth0', async () => {
    process.env.NODE_ENV = 'production';

    spyOn(env, 'get').and.returnValues(
      Promise.resolve({ access_token: 'old' } as any),
      Promise.resolve({ client_id: 'test-id', client_secret: 'test-secret' } as any)
    );
    spyOn(env, 'set');

    spyOn(axios, 'post').and.returnValue(Promise.resolve({
      data: {
        access_token: 'fake',
        token_type: 'test',
        expires_in: 12345
      }
    }));

    spyOn(axios, 'get').and.returnValue(Promise.resolve({
      data: ['fetched']
    }));

    expect(await service.getUsers()).toEqual(['fetched'] as any);

    expect(axios.post).toHaveBeenCalledWith(
      'https://dibicoo.eu.auth0.com/oauth/token',
      jasmine.objectContaining({ client_id: 'test-id', client_secret: 'test-secret' }),
      jasmine.anything()
    );

    expect(axios.get).toHaveBeenCalled();
    expect(env.set).toHaveBeenCalled();

    process.env.NODE_ENV = undefined;
  });

});
