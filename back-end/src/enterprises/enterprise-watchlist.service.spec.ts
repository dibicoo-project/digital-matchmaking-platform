import { createMock } from './../../test/utils';

import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseWatchlistRepository } from './enterprise-watchlist.repository';
import { EnterpriseWatchlistService } from './enterprise-watchlist.service';

describe('EnterpriseWatchlistService', () => {

  let repository: EnterpriseWatchlistRepository;
  let service: EnterpriseWatchlistService;

  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',      
    } as any;

    repository = createMock(EnterpriseWatchlistRepository);
    service = new EnterpriseWatchlistService(repository);
  });

    it('should get watchlist', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ ids: ['1', '2', '3']}));

      const list = await service.getList(user);

      expect(list.length).toBe(3);
      expect(repository.findOne).toHaveBeenCalledWith('john');
    });

    it('should set watchlist', async () => {
      spyOn(repository, 'upsert').and.returnValue(Promise.resolve(''));

      await service.setList(['a', 2, 'b', { val: 'test'}, undefined, 'c'] as any, user);

      expect(repository.upsert).toHaveBeenCalledWith({ ids: ['a', 'b', 'c']}, 'john');
    });    
});
