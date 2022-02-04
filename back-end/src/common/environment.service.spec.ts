import { Datastore } from '@google-cloud/datastore';
import { createMock } from './../../test/utils';
import { EnvService } from './environment.service';

describe('EnvService', () => {

  let datastore: Datastore;
  let service: EnvService;

  beforeEach(() => {
    datastore = createMock(Datastore);
    service = new EnvService(datastore);
    delete process.env.testKey;
  });

  it('should get variable from process.env', async () => {
    spyOn(datastore, 'get').and.returnValue([] as any);
    process.env.testKey = 'test-value';
    expect(await service.get('testKey' as any)).toEqual({value: 'test-value'});
  });

  it('should get variable from datastore', async () => {
    spyOn(datastore, 'get').and.returnValue([{ dsKey: 'ds-value'}] as any);
    expect(await service.get('testKey' as any)).toEqual({ dsKey: 'ds-value'});
    expect(datastore.get).toHaveBeenCalled();
  });

  it('should set variable into datastore', async() => {
    spyOn(datastore, 'save');
    expect(await service.set('testKey' as any, 'test-value'));
    expect(datastore.save).toHaveBeenCalled();
  });
});
