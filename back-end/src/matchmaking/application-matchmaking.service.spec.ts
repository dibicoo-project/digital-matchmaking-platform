import { createMock, mockKey } from './../../test/utils';

import { CountriesServiceMock } from '../countries/countries.service.mock';
import { NotificationService } from '../notifications/notification.service';
import { ApplicationFiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';
import { PublicApplicationRepository } from '../applications/application.repository';
import { ApplicationMatchmakingService } from './application-matchmaking.service';
import { Application } from '../applications/application.domain';

describe('ApplicationMatchmakingService', () => {

  let repository: ApplicationFiltersRepository;
  let applicationRepository: PublicApplicationRepository;
  let notifications: NotificationService;
  let service: ApplicationMatchmakingService;

  beforeEach(async () => {
    repository = createMock(ApplicationFiltersRepository);
    applicationRepository = createMock(PublicApplicationRepository);
    notifications = createMock(NotificationService);
    service = new ApplicationMatchmakingService(repository, applicationRepository, new CountriesServiceMock(), notifications);

    await service["maybeFetchCountries"]();
  });

  it('should match by main category', () => {
    const filters = { "business-field": [{ value: 'catA' }, { value: 'catB' }] } as Filters;
    expect(service.isMatched(filters, { mainCategoryId: 'catA' } as Application)).toBeTrue();
    expect(service.isMatched(filters, { mainCategoryId: 'catX' } as Application)).toBeFalse();
  });

  it('should match by category', () => {
    const filters = { "business-field": [{ value: 'catA' }, { value: 'catB' }] } as Filters;
    expect(service.isMatched(filters, { categoryId: 'catB' } as Application)).toBeTrue();
    expect(service.isMatched(filters, { categoryId: 'catX' } as Application)).toBeFalse();
  });

  it('should match by target country', () => {
    const filters = { "project-region": [{ type: 'country', value: 'c1' }] } as Filters;
    expect(service.isMatched(filters, { location: { country: 'c1' } } as Application)).toBeTrue();
    expect(service.isMatched(filters, { location: { country: 'cX' } } as Application)).toBeFalse();
  });

  it('should match by target subregion', () => {
    const filters = { "project-region": [{ type: 'subregion', value: 'sub1a' }] } as Filters;
    expect(service.isMatched(filters, { location: { country: 'c1' } } as Application)).toBeTrue();
    expect(service.isMatched(filters, { location: { country: 'cX' } } as Application)).toBeFalse();
  });

  it('should match by target region', () => {
    const filters = { "project-region": [{ type: 'region', value: 'reg1' }] } as Filters;
    expect(service.isMatched(filters, { location: { country: 'c1' } } as Application)).toBeTrue();
    expect(service.isMatched(filters, { location: { country: 'cX' } } as Application)).toBeFalse();
  });

  it('should match complex filters', () => {
    const filters = {
      "business-field": [{ value: 'catA' }, { value: 'catB' }],
      "project-region": [{ type: 'country', value: 'c6' }, { type: 'subregion', value: 'sub2a' }, { type: 'region', value: 'reg1' }]
    } as Filters;

    const app = { location: { country: 'c1' }, mainCategoryId: 'catA', categoryId: 'cat1' } as Application;

    expect(service.isMatched(filters, app)).toBeTrue();
    expect(service.isMatched(filters, { ...app, location: { country: 'c7' } })).toBeFalse();
  });

  it('should warn about empty filters', () => {
    spyOn(console, 'warn');

    expect(service.isMatched({} as any, {} as any)).toBeFalse();
    expect(console.warn).toHaveBeenCalled();
  });
});
