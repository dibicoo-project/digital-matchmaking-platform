import { createMock, mockKey } from './../../test/utils';
import { ApplicationService } from './application.service';
import { DiBiCooPrincipal } from '../security/principal';
import { ApplicationRepository, PublicApplicationRepository } from './application.repository';
import { Application, ApplicationBean, PublicApplication } from './application.domain';
import moment from 'moment';
import { NotificationService } from '../notifications/notification.service';
import { MatchmakingFacade } from '../matchmaking/matchmaking.facade';

describe('ApplicationService', () => {
  let repository: ApplicationRepository;
  let publicRepository: PublicApplicationRepository;
  let notifications: NotificationService;
  let matchmaking: MatchmakingFacade;
  let service: ApplicationService;

  let data: Application;
  let bean: ApplicationBean;
  let user: DiBiCooPrincipal;

  beforeEach(() => {
    user = {
      userName: 'john',
      isResourceOwner: () => Promise.resolve(true),
      isInRole: () => Promise.resolve(false),
      checkAdmin: () => Promise.reject()
    } as any;

    bean = {
      mainCategoryId: '123',
      categoryId: '234',
      description: 'Lorem ipsum',
      dueDate: moment().toISOString(),
      location: { country: 'target' },
      contacts: [{
        name: 'Peter',
        elements: [{ type: 'a', value: 'v' }]
      }],
      contactLocation: { country: 'contact' }
    };

    data = {
      ...bean,
      owners: ['peter', 'ann'],
      changedBy: 'user',
      changedTs: new Date()
    } as Application;

    repository = createMock(ApplicationRepository);
    publicRepository = createMock(PublicApplicationRepository);
    notifications = { add: jasmine.createSpy("notifications.add") } as any;
    matchmaking = createMock(MatchmakingFacade);
    service = new ApplicationService(repository, publicRepository, notifications, matchmaking);
  });

  describe('user', () => {

    it('should get applications', async () => {
      spyOn(repository, 'findByOwner').and.returnValue(Promise.resolve(
        [
          { description: 'A', changedTs: moment().toDate() },
          { description: 'B', changedTs: moment().add(1, 'day').toDate() },
          
        ] as Application[]
      ));

      spyOn(publicRepository, 'findByOwner').and.returnValue(Promise.resolve(
        [
          { description: 'X', dueDate: moment().add(1, 'day').toDate() },
          { description: 'Y', dueDate: moment().subtract(1, 'second').toDate() },
        ] as PublicApplication[]
      ));

      const data = await service.getUserApplications(user);

      expect(data.drafts.length).toBe(2);
      expect(data.published.length).toBe(1);
      // orderding
      expect(data.drafts[0].description).toEqual('B');
      expect(data.drafts[1].description).toEqual('A');
      // calls
      expect(repository.findByOwner).toHaveBeenCalledWith('john');
      expect(publicRepository.findByOwner).toHaveBeenCalledWith('john');
    });

    it('should get application details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));

      const res = await service.getUserApplicationDetails('123', user);

      expect(res.description).toEqual(data.description);
      expect((res as any).randomField).toBeUndefined();
      expect(repository.findOne).toHaveBeenCalledWith('123');
    });

    it('should deny other user application details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ owners: ['other'] } as any));

      user.isResourceOwner = () => Promise.resolve(false);
      await expectAsync(service.getUserApplicationDetails('123', user)).toBeRejected();
      expect(repository.findOne).toHaveBeenCalledWith('123');
    });

    it('should add application', async () => {
      spyOn(repository, 'insert').and.returnValue(Promise.resolve('987'));
      const res = await service.addApplication(bean, user);

      expect(repository.insert).toHaveBeenCalledWith(
        jasmine.objectContaining({ description: 'Lorem ipsum', owners: ['john'] })
      );
      expect(res.id).toBe('987');
    });

    it('should edit application', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(
        { ...data, description: 'old', unpublishReason: 'wrong', status: 'draft' })
      );
      spyOn(repository, 'update').and.returnValue(Promise.resolve('987'));

      const res = await service.editApplication('987', { ...bean, description: 'new' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ description: 'new' }), '987');
      expect(res.description).toEqual('new');
    });

    it('should delete application', async () => {
      const obj = mockKey({ ...data }, '987');
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(obj));
      spyOn(repository, 'delete');
      spyOn(publicRepository, 'delete');

      await service.deleteApplication('987', user);

      expect(repository.findOne).toHaveBeenCalledWith('987');
      expect(repository.delete).toHaveBeenCalledWith('987');
      expect(publicRepository.delete).toHaveBeenCalledWith('987');
    });

    it('should submit the application for publishing', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');

      await service.changeApplicationStatus('123', { action: 'publish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ pendingReview: true }), '123');
    });

    it('should reject incomplete application from publishing', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ description: 'test' } as any));
      spyOn(repository, 'update');

      await expectAsync(service.changeApplicationStatus('123', { action: 'publish' }, user)).toBeRejected();

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should unpublish the application', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'delete');

      await service.changeApplicationStatus('123', { action: 'unpublish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ pendingReview: false }), '123');
      expect(publicRepository.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('public', () => {
    it('should get public applications', async () => {
      spyOn(publicRepository, 'findAll').and.returnValue(
        Promise.resolve([
          { description: 'A', changedTs: moment().toDate() } as Application,
          { description: 'B', changedTs: moment().add(1, 'day').toDate() } as Application
        ])
      );

      const list = await service.getPublicApplications();
      expect(list.length).toBe(2);
      expect(list[0].description).toEqual('B');
      expect(list[1].description).toEqual('A');
      expect(publicRepository.findAll).toHaveBeenCalled();
    });

    it('should get public application details', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(
        Promise.resolve({
          ...data,
          dueDate: moment().add(1, 'M').toDate()
        }));
      const res = await service.getPublicApplicationDetails('123');

      expect(res.description).toEqual(data.description);
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
    });

    it('should reject expired application details', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(
        Promise.resolve({
          dueDate: moment().subtract(1, 'M').toDate()
        } as Application));

      await expectAsync(service.getPublicApplicationDetails('123')).toBeRejected();
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
    });

    it('should report application', async () => {
      spyOn(publicRepository, 'findOne').and.returnValue(
        Promise.resolve({
          ...data,
          dueDate: moment().add(1, 'M').toDate()
        }));
      spyOn(publicRepository, 'update');

      await service.reportApplication('123', 'misuse');
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
      expect(publicRepository.update).toHaveBeenCalledWith(
        jasmine.objectContaining({
          reports: [
            jasmine.objectContaining({ message: 'misuse' })
          ]
        }), '123');
    });
  });

  describe('admin', () => {

    beforeEach(() => {
      user.checkAdmin = () => Promise.resolve();
      user.isInRole = () => Promise.resolve(true);
    });

    it('should allow private application details', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ owners: ['other'] } as any));

      user.isResourceOwner = () => Promise.resolve(false);
      await service.getUserApplicationDetails('123', user);
      expect(repository.findOne).toHaveBeenCalledWith('123');
    });

    it('should get applications', async () => {
      spyOn(repository, 'findPending').and.returnValue(
        Promise.resolve([
          { description: 'A', changedTs: moment().toDate() } as Application,
          { description: 'B', changedTs: moment().add(1, 'day').toDate() } as Application
        ])
      );

      spyOn(publicRepository, 'findAll').and.returnValue(
        Promise.resolve([
          { description: 'X', changedTs: moment().toDate(), reports: [{}, {}, {}] } as PublicApplication
        ])
      );

      const data = await service.getAdminApplications(user);

      expect(data.pending.length).toBe(2);
      expect(data.pending[0].description).toEqual('B');
      expect(data.pending[1].description).toEqual('A');
      expect(data.published[0].reports?.length).toBe(3);
      expect(repository.findPending).toHaveBeenCalled();
      expect(publicRepository.findAll).toHaveBeenCalled();
    });

    it('should get application details', async () => {
      spyOn(repository, 'findOne').and.returnValue(
        Promise.resolve({ description: 'A' } as Application)
      );

      spyOn(publicRepository, 'findOne').and.returnValue(Promise.resolve(undefined));

      const data = await service.getAdminApplication('123', user);

      expect(data.pending.description).toBe('A');
      expect(data.published).toBeUndefined()
      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(publicRepository.findOne).toHaveBeenCalledWith('123');
    });

    it('should publish the application', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'upsert');
      spyOn(matchmaking, 'matchApplicationToFilters');
      spyOn(matchmaking, 'matchApplicationToEnterprises');

      await service.changeAdminApplicationStatus('123', { action: 'publish' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ pendingReview: false, rejectReason: undefined }), '123');
      expect(publicRepository.upsert).toHaveBeenCalledWith(jasmine.objectContaining({ reports: [] }), '123');
      expect(notifications.add).toHaveBeenCalled();
      expect(matchmaking.matchApplicationToFilters).toHaveBeenCalled();
      expect(matchmaking.matchApplicationToEnterprises).toHaveBeenCalled();
    });

    it('should reject incomplete application from publishing', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve({ mainCategoryId: 'abc' } as any));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'upsert');

      await expectAsync(service.changeAdminApplicationStatus('123', { action: 'publish' }, user)).toBeRejected();

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).not.toHaveBeenCalled();
      expect(publicRepository.upsert).not.toHaveBeenCalled();
      expect(notifications.add).not.toHaveBeenCalled();
    });

    it('should reject the application', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');

      await service.changeAdminApplicationStatus('123', { action: 'reject', message: 'lorem' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ pendingReview: false, rejectReason: 'lorem' }), '123');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should unpublish the application', async () => {
      spyOn(repository, 'findOne').and.returnValue(Promise.resolve(data));
      spyOn(repository, 'update');
      spyOn(publicRepository, 'delete');

      await service.changeAdminApplicationStatus('123', { action: 'unpublish', message: 'lorem' }, user);

      expect(repository.findOne).toHaveBeenCalledWith('123');
      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ pendingReview: false, rejectReason: 'lorem' }), '123');
      expect(publicRepository.delete).toHaveBeenCalledWith('123');
      expect(notifications.add).toHaveBeenCalled();
    });

  });

});
