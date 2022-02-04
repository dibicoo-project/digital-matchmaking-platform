import { createMock, mockKey } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { FiltersRepository } from '../matchmaking/matchmaking.repository';
import { EnterpriseFiltersService } from './filters.service';
import { MatchmakingService } from './matchmaking.service';
import { Notification } from '../notifications/notification.domain';
import { Filters, FiltersEntity } from './matchmaking.domain';

class TestMatchmakingService extends MatchmakingService<any> {
  isMatched(filters: Filters, obj: any): boolean { return false;  }
  createNotification(filter: FiltersEntity, obj: any): Notification { return null as any; }
}

describe('FiltersService', () => {
  let repository: FiltersRepository;
  let matchmaking: TestMatchmakingService;
  let service: EnterpriseFiltersService;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true)
    } as any;

    repository = createMock(FiltersRepository);
    matchmaking = createMock(TestMatchmakingService);
    service = new EnterpriseFiltersService(repository, matchmaking);
  });

  it('should list filters', async () => {
    spyOn(repository, 'findOwn').and.returnValue(
      Promise.resolve([
        mockKey({ label: 'test', filters: {}, owner: 'john' }, '123')
      ] as any)
    );

    const res = await service.listFilters(user);

    expect(res.length).toBe(1);
    expect(res[0]).toEqual({ label: 'test', id: '123', filters: {} } as any);
  });

  it('should save filters', async () => {
    spyOn(matchmaking, 'filterObjects').and.returnValue(
      Promise.resolve([])
    );
    spyOn(repository, 'insert').and.returnValue(
      Promise.resolve('123')
    );

    const res = await service.saveFilters(
      {
        label: 'test',
        filters: { 'company-region': [{ type: 'region', value: 'reg1' }] }
      },
      user);

    expect(res.id).toEqual('123');
    expect(repository.insert).toHaveBeenCalled();
  });

  it('should delete filters', async () => {
    spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ owner: 'john' } as any));
    spyOn(repository, 'delete').and.returnValue(Promise.resolve());

    await service.deleteFilters('123', user);
    expect(repository.delete).toHaveBeenCalled();
  });
});
