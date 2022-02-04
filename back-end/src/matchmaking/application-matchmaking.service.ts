import { injectable } from 'inversify';
import { CountriesService } from '../countries/countries.service';
import { NotificationService } from '../notifications/notification.service';
import { Notification } from '../notifications/notification.domain';
import { ApplicationFiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';
import { MatchmakingService } from './matchmaking.service';
import { Application } from '../applications/application.domain';
import { PublicApplicationRepository } from '../applications/application.repository';
import { applicationMatched } from '../notifications/notification.templates';
import { plainId } from '../utils/transform-datastore-id';


@injectable()
export class ApplicationMatchmakingService extends MatchmakingService<Application> {

  constructor(filtersRepository: ApplicationFiltersRepository,
    applicationRepository: PublicApplicationRepository,
    countriesService: CountriesService,
    notifications: NotificationService) {
    super(filtersRepository, applicationRepository, countriesService, notifications)
  }

  createNotification(filter: FiltersEntity, app: Application): Notification {
    return applicationMatched(plainId(app), filter.label);
  }

  isMatched(filters: Filters, app: Application) {
    const businessFields = filters['business-field']?.map(f => f.value as string) || [];
    const projectCountries = filters['project-region']?.flatMap(f => this.toCountries(f)) || [];

    if (businessFields.length == 0 && projectCountries.length == 0) {
      console.warn('Trying to apply empty filters', filters);
      return false;
    }

    let match = true;

    if (match && businessFields.length > 0) {
      match = businessFields.some(id => app.mainCategoryId === id || app.categoryId === id);
    }

    if (match && projectCountries.length > 0) {
      match = projectCountries.some(country => app.location?.country === country);
    }

    return match;
  }
}