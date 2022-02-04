import { EnvService } from '../common/environment.service';
import { createMock } from './../../test/utils';
import { EmailService } from './email.service';

describe('EmailService', () => {

  let service: EmailService;
  let jet: any;

  beforeEach(() => {
    const env: EnvService = { get: () => ({ apiKey: 'key', secret: 'secret', template: 123 }) } as any;
    jet = {
      body: {
        "Messages": [
          { "Status": "success", "CustomID": 'x' },
          { "Status": "other", "CustomID": 'y' }
        ]
      }
    }

    jet.connect = jasmine.createSpy('connect').and.returnValue(jet);
    jet.post = jasmine.createSpy('post').and.returnValue(jet);
    jet.request = jasmine.createSpy('request').and.returnValue(jet);

    service = new EmailService(env, jet);
  });

  it('should send many emails', async () => {
    const result = await service.sendMany([
      { id: 'a', email: 'a@test', count: 100 },
      { id: 'b', email: 'b@test', count: 200 },
    ]);

    expect(jet.connect).toHaveBeenCalledWith('key', 'secret');
    expect(jet.request).toHaveBeenCalledWith({
      "Messages": [
        jasmine.objectContaining({ "To": [{ "Email": 'a@test' }], "Variables": { count: 100 } }),
        jasmine.objectContaining({ "To": [{ "Email": 'b@test' }], "Variables": { count: 200 } })
      ]
    });

    expect(result).toEqual(['x']);
  });
});
