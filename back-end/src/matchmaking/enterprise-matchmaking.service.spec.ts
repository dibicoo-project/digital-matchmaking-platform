import { createMock, mockKey } from './../../test/utils';

import { EnterpriseMatchmakingService } from './enterprise-matchmaking.service';
import { PublicEnterpriseRepository } from '../enterprises/enterprise.repository';
import { CountriesServiceMock } from '../countries/countries.service.mock';
import { Enterprise } from '../enterprises/enterprise.domain';
import { NotificationService } from '../notifications/notification.service';
import moment from 'moment';
import 'moment-timezone';
import { EnterpriseFiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';

describe('EnterpriseMatchmakingService', () => {

  let repository: EnterpriseFiltersRepository;
  let enterpriseRepository: PublicEnterpriseRepository;
  let notifications: NotificationService;
  let service: EnterpriseMatchmakingService;

  beforeEach(() => {

    repository = createMock(EnterpriseFiltersRepository);
    enterpriseRepository = createMock(PublicEnterpriseRepository);
    notifications = createMock(NotificationService);
    service = new EnterpriseMatchmakingService(repository, enterpriseRepository, new CountriesServiceMock(), notifications);
  });

  describe('apply filters', () => {
    beforeEach(() => {
      jasmine.clock().mockDate(new Date('2021-06-07T10:00:00Z'));
      spyOn(console, 'warn');
    });
    afterEach(() => jasmine.clock().uninstall());

    const companies: Partial<Enterprise>[] = [
      mockKey({
        companyName: 'A',
        changedTs: '2021-06-05T00:00:00Z',
        location: { country: 'c1' },
        keyProjects: [{ location: { country: 'cX' } }]
      }, '1'),
      mockKey({
        companyName: 'B',
        changedTs: '2021-06-04T23:59:59Z',
        location: { country: 'c3' },
        keyProjects: [{ location: { country: 'c1' } }],
        categoryIds: ['cat1', 'cat2']
      }, '2'),
      mockKey({
        companyName: 'C',
        changedTs: '2021-06-07T10:00:00Z',
        location: { location: { country: 'c4' } },
      }, '3'),
      mockKey({
        companyName: 'D',
        changedTs: '2021-06-04T00:00:00Z',
        location: { country: 'c5' },
        keyProjects: [{ location: { country: 'c6' } }, { location: { country: 'cX' } }],
        categoryIds: ['cat1', 'cat3']
      }, '4'),
      mockKey({
        companyName: 'E',
        changedTs: '2021-05-01T00:00:00Z',
        location: { country: 'c7' },
        keyProjects: [],
        categoryIds: ['cat3']
      }, '5'),
    ];

    beforeEach(() => {
      spyOn(enterpriseRepository, 'findAll').and.returnValue(
        Promise.resolve(companies as Enterprise[])
      );
    });

    it('should warn for empty fiters', async () => {
      const filters: Filters = {};
      const res = await service.filterObjects(filters);
      expect(res).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should warn for fiters with wrong values', async () => {
      const filters: Filters = {
        "business-field": [],
        "company-region": [{ type: "region", value: "lorem" }],
        "project-region": [{ type: "subregion", value: "ipsum" }],
        "profile-updates": [{ type: "updatedAgo", value: 0 }],
      };

      const res = await service.filterObjects(filters);
      expect(res).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should work for business fields', async () => {
      const filters: Filters = {
        "business-field": [{ value: 'cat1', type: 'categoryId' }]
      };

      const res = await service.filterObjects(filters);
      expect(res.map(c => c.companyName)).toEqual(['B', 'D'])
    });

    it('should work for company regions', async () => {
      const filters: Filters = {
        "company-region": [
          { type: 'region', value: 'reg1' },
          { type: 'subregion', value: 'sub2b' },
          { type: 'country', value: 'c7' }
        ]
      };

      const res = await service.filterObjects(filters);
      expect(res.map(c => c.companyName)).toEqual(['A', 'B', 'D', 'E']);
    });

    it('should work for project regions', async () => {
      const filters: Filters = {
        "project-region": [
          { type: 'region', value: 'reg2' },
          { type: 'subregion', value: 'sub1a' },
          { type: 'country', value: 'c6' }
        ]
      };

      const res = await service.filterObjects(filters);
      expect(res.map(c => c.companyName)).toEqual(['B', 'D'])
    });

    it('should work for profile updates', async () => {
      const filters: Filters = {
        "profile-updates": [{ value: 2, type: 'updatedAgo' }]
      };

      const res = await service.filterObjects(filters);
      expect(res.map(c => c.companyName)).toEqual(['A', 'C'])
    });

    it('should work for complex filters', async () => {
      const filters: Filters = {
        "business-field": [{ value: 'cat1', type: 'categoryId' }, { value: 'cat3', type: 'categoryId' }],
        "company-region": [{ value: 'reg2', type: 'region' }, { value: 'c1', type: 'country' }],
        "project-region": [{ value: 'c6', type: 'country' }]
      };

      const res = await service.filterObjects(filters);
      expect(res.map(c => c.companyName)).toEqual(['D'])
    });
  });

  describe('match enterprise', () => {
    let base: Enterprise;

    beforeEach(() => {
      jasmine.clock().mockDate(new Date('2021-06-07T10:00:00Z'));
      spyOn(console, 'warn');

      base = mockKey({
        changedTs: moment().subtract(10, 'days').toDate()
      }, '123');
    });
    afterEach(() => jasmine.clock().uninstall());

    beforeEach(() => {
      spyOn(notifications, 'add');
      spyOn(repository, 'update');
      spyOn(repository, 'findAll').and.returnValue(
        Promise.resolve([
          mockKey({ filters: { "business-field": [{ type: 'categoryId', value: 'catA' }] } }, 'business-field'),
          mockKey({ filters: { "company-region": [{ type: 'region', value: 'reg1' }] } }, 'company-region'),
          mockKey({ filters: { "company-region": [{ type: 'subregion', value: 'sub2a' }] } }, 'company-subregion'),
          mockKey({ filters: { "company-region": [{ type: 'country', value: 'c7' }] } }, 'company-country'),
          mockKey({ filters: { "project-region": [{ type: 'region', value: 'reg1' }] } }, 'project-region'),
          mockKey({ filters: { "project-region": [{ type: 'subregion', value: 'sub2a' }] } }, 'project-subregion'),
          mockKey({ filters: { "project-region": [{ type: 'country', value: 'c7' }] } }, 'project-country'),
          mockKey({ filters: { "profile-updates": [{ type: 'updatedAgo', value: '5' }] } }, 'profile-updates'),
          mockKey({
            filters: {
              "business-field": [{ type: 'categoryId', value: 'catB' }, { type: 'categoryId', value: 'catC' }],
              "company-region": [{ type: 'region', value: 'reg1' }, { type: 'subregion', value: 'sub3a' }],
              "project-region": [{ type: 'country', value: 'c4' }, { type: 'country', value: 'c5' }],
              "profile-updates": [{ type: 'updatedAgo', value: '10' }]
            }
          }, 'complex'),
          mockKey({
            filters: { "business-field": [{ type: 'categoryId', value: 'catC' }] },
            objectIds: ['123']
          }, 'already-matched'),
        ] as FiltersEntity[])
      );
    });

    it('should work by business field', async () => {
      const item = { ...base, categoryIds: ['catB', 'catA'] };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'business-field');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by company region', async () => {
      const item = { ...base, location: { country: 'c3' } };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'company-region');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by company subregion', async () => {
      const item = { ...base, location: { country: 'c4' } };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'company-subregion');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by company country', async () => {
      const item = { ...base, location: { country: 'c7' } };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'company-country');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by project region', async () => {
      const item = { ...base, keyProjects: [{ location: { country: 'c2' } }, { location: { country: 'cX' } }] as any[] };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'project-region');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by project subregion', async () => {
      const item = { ...base, keyProjects: [{ location: { country: 'cX' } }, { location: { country: 'c4' } }] as any[] };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'project-subregion');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by project country', async () => {
      const item = { ...base, keyProjects: [{ location: { country: 'c7' } }, { location: { country: 'c6' } }] as any[] };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'project-country');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work by profile updates', async () => {
      const item = { ...base, changedTs: new Date() };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'profile-updates');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should work for complex filters', async () => {
      const item = {
        ...base, categoryIds: ['catB'],
        location: { country: 'c6' },
        keyProjects: [{ location: { country: 'c4' } }] as any[]
      };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).toHaveBeenCalledWith(jasmine.objectContaining({ objectIds: ['123'] }), 'complex');
      expect(notifications.add).toHaveBeenCalled();
    });

    it('should skip if already matched', async () => {
      const item = {
        ...base, categoryIds: ['catC']
      };
      await service.matchFiltersAndNotify(item);

      expect(repository.update).not.toHaveBeenCalled();
      expect(notifications.add).not.toHaveBeenCalled();
    });
  });
});
