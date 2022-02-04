import { Repository } from './repository';
import { Datastore } from '@google-cloud/datastore';
import { createMock } from '../test/utils';

interface TestEntity {
  a: string;
  b: string;
  c: string;
}

class TestRepository extends Repository<TestEntity> {
  constructor(datastore: Datastore) {
    super(datastore, 'testKind');
    this.excludeFromIndexes('c');
    this.setDefaultQuery(q => q.order('a'));
  }
}

describe('Repository', () => {
  let datastore: Datastore;
  let repository: TestRepository;
  beforeEach(() => {
    datastore = createMock(Datastore);
    datastore.int = (v) => v as any; // fake conversion to Int

    repository = new TestRepository(datastore);
  });

  it('should initialize', () => {
    const obj = repository as any;
    expect(obj.excluded).toEqual(['c']);

    const cb = jasmine.createSpy('filter callback');
    obj.defaultQuery({ order: cb });
    expect(cb).toHaveBeenCalledWith('a');
  });

  it('should find entities', async () => {
    const q: any = {
      order: () => q
    };

    spyOn(datastore, 'createQuery').and.returnValue(q);
    spyOn(datastore, 'runQuery').and.returnValue(Promise.resolve([[{ a: '1' }], { response: 'metadata' }]) as any);

    const list = await repository.find();
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
    spyOn(datastore, 'save');

    const data: TestEntity = { a: '111', b: '222', c: '333' };
    await repository.save(data);

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind']);
    expect(datastore.save as any).toHaveBeenCalledWith({ key, data, method: 'insert', excludeFromIndexes: ['c'] });
  });

  it('should update existing record', async () => {
    const key = { key: 'complex' };
    spyOn(datastore, 'key').and.returnValue(key as any);
    spyOn(datastore, 'save');

    const data: TestEntity = { a: '111', b: '222', c: '333' };
    await repository.save(data, 'existing-id');

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind', 'existing-id']);
    expect(datastore.save as any).toHaveBeenCalledWith({ key, data, method: 'update', excludeFromIndexes: ['c'] });
  });

  it('should delete the record', async () => {
    const key = { key: 'complex' };
    spyOn(datastore, 'key').and.returnValue(key as any);
    spyOn(datastore, 'delete');

    await repository.delete('old-id');

    expect(datastore.key as any).toHaveBeenCalledWith(['testKind', 'old-id']);
    expect(datastore.delete as any).toHaveBeenCalledWith([key]);
  });
});
