import { createMock } from './../../test/utils';

import { UserEnterpriseController } from './user-enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { DiBiCooPrincipal } from '../security/principal';
import { EnterpriseShareService } from './enterprise-share.service';
import { EnterpriseWatchlistService } from './enterprise-watchlist.service';
import { EnterpriseFiltersService } from '../matchmaking/filters.service';

describe('UserEnterpriseController', () => {

  let controller: UserEnterpriseController;
  let service: EnterpriseService;
  let shareService: EnterpriseShareService;
  let filtersService: EnterpriseFiltersService;
  let watchlistService: EnterpriseWatchlistService;

  const user = { userName: 'john' } as DiBiCooPrincipal;

  beforeEach(() => {
    service = createMock(EnterpriseService);
    shareService = createMock(EnterpriseShareService);
    filtersService = createMock(EnterpriseFiltersService);
    watchlistService = createMock(EnterpriseWatchlistService);
    controller = new UserEnterpriseController(service, shareService, filtersService, watchlistService);
  });

  it('should return enterprise list', async () => {
    spyOn(service, 'getUserEnterprises').and.returnValue(Promise.resolve({ drafts: [{}, {}], published: [{}] } as any));

    const res = await controller.listUserEnterprises(user);

    expect(res.drafts.length).toBe(2);
    expect(res.published.length).toBe(1);
    expect(service.getUserEnterprises).toHaveBeenCalledWith(user);
  });

  it('should create enterprise', async () => {
    spyOn(service, 'addEnterprise').and.returnValue(Promise.resolve({ errors: [] } as any));
    const bean = { companyName: 'test' };

    await controller.createEnterprice(bean, user);

    expect(service.addEnterprise).toHaveBeenCalledWith(bean, user);
  });

  it('should edit enterprise', async () => {
    spyOn(service, 'editEnterprise').and.returnValue(Promise.resolve({ errors: [] } as any));
    const bean = { companyName: 'test' };

    await controller.editEnterprice('123', bean, user);

    expect(service.editEnterprise).toHaveBeenCalledWith('123', bean, user);
  });

  it('should get enterprise details', async () => {
    spyOn(service, 'getUserEnterpriseDetails').and.returnValue(Promise.resolve({} as any));
    await controller.getEnterpriseDetails('123', user);

    expect(service.getUserEnterpriseDetails).toHaveBeenCalledWith('123', user);
  });

  it('should change enterprise status', async () => {
    spyOn(service, 'changeEnterpriseStatus');
    const res = jasmine.createSpy();
    await controller.changeEnterpriseStatus('123', { action: 'publish' }, user, { sendStatus: res } as any);
    expect(service.changeEnterpriseStatus).toHaveBeenCalledWith('123', { action: 'publish' }, user);
    expect(res).toHaveBeenCalledWith(204);
  });

  it('should delete enterprise', async () => {
    spyOn(service, 'deleteEnterprise').and.returnValue(Promise.resolve());
    const spy = jasmine.createSpy();

    await controller.deteleEnterprice('123', user, { sendStatus: spy } as any);

    expect(spy).toHaveBeenCalledWith(204);
    expect(service.deleteEnterprise).toHaveBeenCalledWith('123', user);
  });

  it('should upload enterprise logo', async () => {
    spyOn(service, 'uploadImage').and.returnValue(Promise.resolve({ imageUrl: 'test' }));
    const file = { data: 'abcdef' };
    await controller.saveLogo('123', { file } as any, user);

    expect(service.uploadImage).toHaveBeenCalledWith('123', file as any, user);
  });

  it('should delete enterprise logo', async () => {
    spyOn(service, 'deleteEnterpriseLogo');
    const res = jasmine.createSpy();
    await controller.deteleLogo('123', user, { sendStatus: res } as any);
    expect(service.deleteEnterpriseLogo).toHaveBeenCalledWith('123', user);
    expect(res).toHaveBeenCalledWith(204);
  });

  it('should get enterprse shares', async () => {
    spyOn(shareService, 'getSharingDetails').and.returnValue(Promise.resolve({} as any));
    await controller.getSharingDetails('123', user);
    expect(shareService.getSharingDetails).toHaveBeenCalledWith('123', user);
  });

  it('should add enterprse share', async () => {
    spyOn(shareService, 'addShare').and.returnValue(Promise.resolve({} as any));
    await controller.addShare('123', { name: 'John' }, user);
    expect(shareService.addShare).toHaveBeenCalledWith('123', 'John', user);
  });

  it('should delete enterprse share', async () => {
    spyOn(shareService, 'removeShare');
    const res = jasmine.createSpy();
    await controller.removeShare('123', {} as any, user, { sendStatus: res } as any);
    expect(shareService.removeShare).toHaveBeenCalledWith('123', {}, user);
    expect(res).toHaveBeenCalledWith(204);
  });

  it('should accept invitation', async () => {
    spyOn(shareService, 'acceptInvitation').and.returnValue(Promise.resolve({} as any));
    await controller.acceptInvitation('123-456', user);

    expect(shareService.acceptInvitation).toHaveBeenCalledWith('123-456', user);
  });

  it('should save matchmaking', async () => {
    spyOn(filtersService, 'saveFilters');
    await controller.saveMatchmaking({ label: 'testing' } as any, user);
    expect(filtersService.saveFilters).toHaveBeenCalledWith({ label: 'testing' } as any, user);
  });

  it('should get saved matchmaking list', async () => {
    spyOn(filtersService, 'listFilters');
    await controller.getSavedMatchmaking(user);
    expect(filtersService.listFilters).toHaveBeenCalled();
  });

  it('should delete matchmaking', async () => {
    spyOn(filtersService, 'deleteFilters');
    const res = jasmine.createSpy();
    await controller.deleteMatchmaking('123', user, { sendStatus: res } as any);
    expect(filtersService.deleteFilters).toHaveBeenCalledWith('123', user);
    expect(res).toHaveBeenCalledWith(204);
  });

  it('should get enterprse statistics', async () => {
    spyOn(service, 'getEnterpriseStatistics').and.returnValue(Promise.resolve({} as any));
    await controller.getEnterpriseStatistics('123', user);
    expect(service.getEnterpriseStatistics).toHaveBeenCalledWith('123', user);
  });

  it('should send message', async () => {
    spyOn(service, 'sendMessage');
    const res = jasmine.createSpy();
    await controller.sendMessage('123', {} as any, user, { sendStatus: res } as any);
    expect(service.sendMessage).toHaveBeenCalledWith('123', {} as any, user);
    expect(res).toHaveBeenCalledWith(204);
  });

  it('should get watchlist', async () => {
    spyOn(watchlistService, 'getList');
    const res = await controller.getWatchlist(user);
    expect(watchlistService.getList).toHaveBeenCalledWith(user);
  });

  it('should set watchlist', async () => {
    spyOn(watchlistService, 'setList');
    const res = jasmine.createSpy();
    const bean = ['1', '2'];
    await controller.updateWatchlist(bean, user, { sendStatus: res } as any);
    expect(watchlistService.setList).toHaveBeenCalledWith(bean, user);
    expect(res).toHaveBeenCalledWith(204);
  });
});
