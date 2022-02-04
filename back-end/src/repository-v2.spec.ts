import { Repository } from './repository';
import { Datastore, Query } from '@google-cloud/datastore';
import { createMock } from '../test/utils';
import { RepositoryV2 } from './repository-v2';

interface TestEntity {
  a: string;
  b: string;
  c: string;
}

class TestRepository extends RepositoryV2<TestEntity> {
  constructor(datastore: Datastore) {
    super(datastore, 'testKind');
    this.excludeFromIndexes = ['c'];
  }

  public findTest() {
    return this.find(this.query);
  }

  public keyTest(id?: string) {
    return this.getKey(id);
  }
}

describe('Repository V2', () => {
  let datastore: Datastore;
  let repository: TestRepository;
  beforeEach(() => {
    datastore = createMock(Datastore);
    datastore.int = (v) => parseInt(v as any) as any; // fake conversion to Int

    repository = new TestRepository(datastore);
  });

  it('should initialize', () => {
    const obj = repository as any;
    expect(obj.excludeFromIndexes).toEqual(['c']);
  });

  it('should find entities', async () => {
    const q = {} as any;

    spyOn(datastore, 'createQuery').and.returnValue(q);
    spyOn(datastore, 'runQuery').and.returnValue(Promise.resolve([[{ a: '1' }], { response: 'metadata' }]) as any);

    const list = await repository.findTest();
    expect(list[0].a).toBe('1');
    expect(datastore.createQuery as any).toHaveBeenCalledWith('testKind');
    expect(datastore.runQuery).toHaveBeenCalled();
  });

  it('should find one entity', async () => {
    spyOn(datastore, 'key').and.returnValue({ key: 'complex' } as any);
    spyOn(datastore, 'get').and.returnValue(Promise.resolve([{ a: '111' }, { response: 'metadata' }]) as any);

    const res = await repository.findOne('987');
    expect(res?.a).toBe('111');
    expect(datastore.get as any).toHaveBeenCalledWith({ key: 'complex' });
  });

  it('should insert new record', async () => {
    const key = { key: 'complex' };
    spyOn(datastore, 'key').and.returnValue(key as any);
    spyOn(datastore, 'insert');

    const data: TestEntity = { a: '111', b: '222', c: '333' };
    await repository.insert(data);

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind']);
    expect(datastore.insert as any).toHaveBeenCalledWith({ key, data, excludeFromIndexes: ['c'] });
  });

  it('should update existing record', async () => {
    const key = { key: 'complex' };
    spyOn(datastore, 'key').and.returnValue(key as any);
    spyOn(datastore, 'update');

    const data: TestEntity = { a: '111', b: '222', c: '333' };
    await repository.update(data, 'existing-id');

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind', 'existing-id']);
    expect(datastore.update as any).toHaveBeenCalledWith({ key, data, excludeFromIndexes: ['c'] });
  });

  it('should delete the record', async () => {
    const key = { key: 'complex' };
    spyOn(datastore, 'key').and.returnValue(key as any);
    spyOn(datastore, 'delete');

    await repository.delete('old-id');

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind', 'old-id']);
    expect(datastore.delete as any).toHaveBeenCalledWith([key]);
  });

  describe('getKey', () => {

    beforeEach(() => {
      spyOn(datastore, 'key');
    });

    it('should create new key', () => {
      repository.keyTest()
      expect(datastore.key).toHaveBeenCalledWith(['testKind'] as any);
    });

    it('should create existing key', () => {
      repository.keyTest('123')
      expect(datastore.key).toHaveBeenCalledWith(['testKind', 123] as any);
    });

    it('should create named key', () => {
      repository.keyTest('test123')
      expect(datastore.key).toHaveBeenCalledWith(['testKind', 'test123'] as any);
    });
  });
});
