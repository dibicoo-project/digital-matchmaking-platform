import { createMock } from './../../test/utils';

import { EnterpriseService } from './enterprise.service';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseRepository, PublicEnterpriseRepository } from './enterprise.repository';
import { StorageService } from '../common/storage.service';
import { Enterprise, PublicEnterprise } from './enterprise.domain';
import { NotificationService } from '../notifications/notification.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { GeocodeService } from '../common/geocode.service';
import { MatchmakingFacade } from '../matchmaking/matchmaking.facade';

describe('EnterpriseService', () => {

  let repository: EnterpriseRepository;
  let publicRepository: PublicEnterpriseRepository;
  let storage: StorageService;
  let notifications: NotificationService;
  let analytics: AnalyticsService;
  let matchmaking: MatchmakingFacade;
  let geocodeService: GeocodeService;
  let service: EnterpriseService;

  let data: Enterprise;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true),
      isInRole: () => Promise.resolve(false),
      checkAdmin: () => Promise.reject()
    } as any;

    data = {
      companyName: 'testing',
      companyProfile: 'test profile',
      contacts: [],
      categoryIds: ['a', 'b'],
      location: {
        zipCode: '123456',
      },
      randomField: 'for testing',
      owners: ['john'],
    } as any;

    repository = createMock(EnterpriseRepository);
    publicRepository = createMock(PublicEnterpriseRepository);
    storage = createMock(StorageService);
    notifications = createMock(NotificationService);
    analytics = createMock(AnalyticsService);
    matchmaking = createMock(MatchmakingFacade);
    geocodeService = createMock(GeocodeService);
    service = new EnterpriseService(repository, publicRepository, storage, geocodeService, notifications, analytics, matchmaking);
  });

  describe('for public ', () => {
    it('should get enterprise list', async () => {
      spyOn(publicRepository, 'findAll').and.returnValue(Promise.resolve([data, data]));

      const list = await service.getPublicEnterprises();

      expect(list.length).toBe(2);
      expect(list[0].companyName).toEqual('testing');
      expect(publicRepository.findAll).toHaveBeenCalled();
    });

    it('should get enterprise details', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(Promise.resolve(data));

      const res = await service.getEnterpriseDetails('123');

      expect(res.companyName).toEqual('testing');
      expect(res.location?.zipCode).toContain('123456');
      expect((res as any).randomField).toBeUndefined();
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
    });

    it('should report enterprise', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(publicRepository, 'update');

      await service.reportEnterprise('123', 'misuse');
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
      expect(publicRepository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reports: [
            jasmine.objectContaining({ message: 'misuse' })
          ]
        }), '123');
    });
  });

  describe('for user', () => {
    it('should get enterprise list', async () => {
      spyOn(repository, 'findByOwner').and.returnValue(Promise.resolve([data, data, data]));
      spyOn(publicRepository, 'findByOwner').and.returnValue(Promise.resolve([data]));

      const res = await service.getUserEnterprises(user);

      expect(res.drafts.length).toBe(3);
      expect(res.published.length).toBe(1);
      expect(repository.findByOwner).toHaveBeenCalledWith('john');
      expect(publicRepository.findByOwner).toHaveBeenCalledWith('john');
    });

    it('should get enterprise details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(publicRepository, 'exists').and.returnValue(Promise.resolve(true));

      const res = await service.getUserEnterpriseDetails('123', user);

      expect(res.companyName).toEqual('testing');
      expect(res.isPublic).toBeTrue();
      expect(res.location?.zipCode).toContain('123456');
      expect((res as any).randomField).toBeUndefined();
      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(publicRepository.exists).toHaveBeenCalledWith('123');
    });

    it('should deny other owner enterprise details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ owners: ['other'] } as any));

      user.isResourceOwner = () => Promise.resolve(false);
      await expectAsync(service.getUserEnterpriseDetails('123', user)).toBeRejected();

      expect(repository.findOne).toHaveBeenCalledWith('123');
    });

    it('should add enterprise', async () => {
      spyOn(repository, 'insert').and.returnValue(Promise.resolve('987'));
      const bean = {
        companyName: 'my',
        location: { country: 'Latvia' },
        companyProfile: 'Lorem ipsum',
        contacts: [
          {
            name: 'u',
            elements: [{ type: 'a', value: 'b' }]
          }
        ],
      };

      const res = await service.addEnterprise(bean, user);

      expect(repository.insert).toHaveBeenCalledWith(jasmine.objectContaining({ companyName: 'my', owners: ['john'] }));
      expect(res.id).toBe('987');
    });

    it('should edit enterprise', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ companyName: 'old' } as any));
      spyOn(repository, 'update').and.returnValue(Promise.resolve('987'));
      const bean = {
        companyName: 'my',
        location: { country: 'Latvia' },
        companyProfile: 'Lorem ipsum',
        contacts: [
          {
            name: 'u',
            elements: [{ type: 'a', value: 'b' }]
          }
        ]
      };

      const res = await service.editEnterprise('987', bean, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ companyName: 'my' }), '987');
      expect(repository.update).not.toHaveBeenCalledWith(jasmine.objectContaining({ randomField: true }), '987');
      expect(res.companyName).toEqual('my');
    });

    it('should submit enterprise for publishing', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update').and.returnValue(Promise.resolve('987'));

      await service.changeEnterpriseStatus('987', { action: 'publish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ pendingReview: true }),
        '987');
    });

    it('should unpublish enterprise ', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ status: 'old', owners: ['john'] } as any));
      spyOn(repository, 'update').and.returnValue(Promise.resolve('987'));
      spyOn(publicRepository, 'delete').and.returnValue(Promise.resolve());

      await service.changeEnterpriseStatus('987', { action: 'unpublish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ pendingReview: false }),
        '987');
      expect(publicRepository.delete).toHaveBeenCalledWith('987');
    });

    it('should delete enterprise', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ logoId: 'xyz123' } as any));
      spyOn(repository, 'delete');
      spyOn(storage, 'deleteLogo');
      spyOn(publicRepository, 'delete');

      await service.deleteEnterprise('987', user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.delete).toHaveBeenCalledWith('987');
      expect(storage.deleteLogo).toHaveBeenCalledWith('xyz123');
      expect(publicRepository.delete).toHaveBeenCalledWith('987');
    });

    it('should upload enterprise logo', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ logoId: 'old' } as any));
      spyOn(storage, 'uploadLogo').and.returnValue(Promise.resolve('new'));
      spyOn(repository, 'update');

      await service.uploadImage('987', { buffer: 'binary' } as any, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(storage.uploadLogo).toHaveBeenCalledWith('binary');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ logoId: 'new' }), '987');
    });

    it('should remove enterprise logo', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ logoId: '123' } as any));
      spyOn(storage, 'deleteLogo').and.returnValue(Promise.resolve());
      spyOn(repository, 'update');

      await service.deleteEnterpriseLogo('987', user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(storage.deleteLogo).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ logoId: undefined }), '987');
    });

    it('should get enterprise statistics', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ companyName: 'Test' } as any));
      spyOn(analytics, 'getEnterpriseStatistics').and.returnValue(Promise.resolve({ items: [] } as any));
      const res = await service.getEnterpriseStatistics('123', user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(analytics.getEnterpriseStatistics).toHaveBeenCalledWith('123');
      expect(res.companyName).toEqual('Test');
    });

    it('should send message', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(
        Promise.resolve({ owners: ['peter', 'mary'] } as PublicEnterprise)
      );
      spyOn(notifications, 'add');

      await service.sendMessage('123', {} as any, user);

      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
      expect(notifications.add).toHaveBeenCalledWith(jasmine.anything(), 'peter', 'mary')
    });
  });


  describe('for admin', () => {

    beforeEach(() => {
      user.checkAdmin = () => Promise.resolve();
    });

    it('should get enterprise list', async () => {
      spyOn(repository, 'findPending').and.returnValue(Promise.resolve([data, data]));
      spyOn(publicRepository, 'findAll').and.returnValue(Promise.resolve([data, data, data]));

      const res = await service.getAdminEnterprises(user);

      expect(res.pending.length).toBe(2);
      expect(res.published.length).toBe(3);
      expect(repository.findPending).toHaveBeenCalled();
      expect(publicRepository.findAll).toHaveBeenCalled();
    });

    it('should get enterprise details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ ...data, companyName: 'draft' }));
      spyOn(publicRepository, 'findOne').and.returnValue(Promise.resolve({ ...data, companyName: 'pub' }));

      const res = await service.getAdminEnterpriseDetails('987', user);

      expect(res.pending.companyName).toEqual('draft');
      expect(res.published?.companyName).toEqual('pub');
      expect(repository.findOne).toHaveBeenCalled();
      expect(publicRepository.findOne).toHaveBeenCalled();
    });

    it('should allow any enterprise details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ owners: ['other'] } as any));

      user.isResourceOwner = () => Promise.resolve(false);
      user.isInRole = () => Promise.resolve(true);
      await service.getUserEnterpriseDetails('123', user);
      expect(repository.findOne).toHaveBeenCalledWith('123');
    });

    it('should publish enterprise', async () => {
      spyOn(repository, 'findOne').and.returnValue(
        Promise.resolve({
          ...data,
          displayOnGlobalMap: true,
          keyProjects: [
            { location: {}, showOnMap: true } as any,
            { location: {} } as any,
          ]
        })
      );
      spyOn(repository, 'update');
      spyOn(publicRepository, 'upsert');
      spyOn(notifications, 'add');
      spyOn(matchmaking, 'matchEnterpriseToFilters');
      spyOn(geocodeService, 'getLatLng');

      await service.changeAdminEnterpriseStatus('987', { action: 'publish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ pendingReview: false, rejectReason: undefined }),
        '987');
      expect(publicRepository.upsert).toHaveBeenCalled();
      expect(notifications.add).toHaveBeenCalled();
      expect(matchmaking.matchEnterpriseToFilters).toHaveBeenCalled();
      expect(geocodeService.getLatLng).toHaveBeenCalledTimes(2);
    });

    it('should reject enterprise changes', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'upsert');
      spyOn(notifications, 'add');

      await service.changeAdminEnterpriseStatus('987', { action: 'reject', message: 'testing' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ pendingReview: false, rejectReason: 'testing' }),
        '987');
      expect(publicRepository.upsert).not.toHaveBeenCalled();
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should unpublish enterprise changes', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'delete');
      spyOn(notifications, 'add');

      await service.changeAdminEnterpriseStatus('987', { action: 'unpublish', message: 'testing' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({ pendingReview: false, rejectReason: 'testing' }),
        '987');
      expect(publicRepository.delete).toHaveBeenCalled();
      expect(notifications.add).toHaveBeenCalled();
    });
  });
});
