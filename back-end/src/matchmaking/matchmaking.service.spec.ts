import { createMock, mockKey } from './../../test/utils';

import { CountriesServiceMock } from '../countries/countries.service.mock';
import { NotificationService } from '../notifications/notification.service';
import { FiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';
import { MatchmakingService } from './matchmaking.service';
import { Notification } from '../notifications/notification.domain';
import { CountriesService } from '../countries/countries.service';


class TestMatchmakingService extends MatchmakingService<any> {
  isMatched(filters: Filters, obj: any): boolean {
    return true;
  }
  createNotification(filter: FiltersEntity, obj: any): Notification {
    return {} as any;
  }
}

class TestObjectRepository {
  findAll(): Promise<any[]> {
    return Promise.resolve([]);
  }
}

describe('MatchmakingService', () => {
  let repository: FiltersRepository;
  let objectRepository: TestObjectRepository;
  let countries: CountriesService;
  let notifications: NotificationService;
  let service: TestMatchmakingService;

  beforeEach(() => {
    repository = createMock(FiltersRepository);
    objectRepository = createMock(TestObjectRepository);
    notifications = createMock(NotificationService);
    countries = new CountriesServiceMock();

    service = new TestMatchmakingService(repository, objectRepository, countries, notifications);
  });

  it('should fetch countries', async () => {
    spyOn(countries, 'getCountries').and.callThrough();
    await service['maybeFetchCountries']();
    expect(service['countries'].length).toEqual(7);

    await service['maybeFetchCountries']();
    expect(countries.getCountries).toHaveBeenCalledTimes(1);
  });

  it('should convert to countries list', async () => {
    await service['maybeFetchCountries']();
    expect(service['toCountries']({ type: 'country', value: 'abc' })).toEqual(['abc'])
    expect(service['toCountries']({ type: 'subregion', value: 'sub1b' })).toEqual(['c2', 'c3'])
    expect(service['toCountries']({ type: 'region', value: 'reg2' })).toEqual(['c4', 'c5'])
  });

  it('should match the object', async () => {
    const obj = mockKey({}, '123');
    const f1 = mockKey({ filters: {}, owner: 'john' } as FiltersEntity, 'f1');
    const f2 = mockKey({ filters: {}, owner: 'peter', objectIds: ['987'] } as FiltersEntity, 'f2');
    spyOn(repository, 'findAll').and.returnValue(Promise.resolve([f1, f2]));
    spyOn(repository, 'update');
    spyOn(notifications, 'add');

    spyOn(service, 'isMatched').and.returnValue(true);
    spyOn(service, 'createNotification').and.returnValue({} as any);

    await service.matchFiltersAndNotify(obj);

    expect(repository.findAll).toHaveBeenCalled();
    expect(service.isMatched).toHaveBeenCalledWith(f1.filters, obj);
    expect(service.isMatched).toHaveBeenCalledWith(f2.filters, obj);

    expect(repository.update).toHaveBeenCalledWith({ ...f1, objectIds: ['123'] } as any, 'f1');
    expect(service.createNotification).toHaveBeenCalledWith(f1, obj);
    expect(notifications.add).toHaveBeenCalledWith({} as any, 'john');

    expect(repository.update).toHaveBeenCalledWith({ ...f2, objectIds: ['987', '123'] } as any, 'f2');
    expect(service.createNotification).toHaveBeenCalledWith(f1, obj);
    expect(notifications.add).toHaveBeenCalledWith({} as any, 'peter');
  });

  it('should ignore alerady matched object', async () => {
    const obj = mockKey({}, '123');
    const f1 = mockKey({ objectIds: ['123'] } as FiltersEntity, 'f1');
    spyOn(repository, 'findAll').and.returnValue(Promise.resolve([f1]));
    spyOn(repository, 'update');
    spyOn(notifications, 'add');

    await service.matchFiltersAndNotify(obj);

    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(notifications.add).not.toHaveBeenCalled();
  });

  it('should filter objects', async () => {
    const filters: Filters = {};
    spyOn(objectRepository, 'findAll').and.returnValue(Promise.resolve([{}, {}, {}]));
    spyOn(service, 'isMatched').and.returnValues(true, false, true);

    const res = await service.filterObjects(filters);

    expect(res.length).toBe(2);
    expect(service.isMatched).toHaveBeenCalledTimes(3);
  });
});
