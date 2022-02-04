import { injectable } from 'inversify';
import { plainId } from '../utils/transform-datastore-id';
import moment from 'moment';
import { CountriesService } from '../countries/countries.service';
import { NotificationService } from '../notifications/notification.service';
import { Notification } from '../notifications/notification.domain';
import { companyMatched } from '../notifications/notification.templates';
import { EnterpriseFiltersRepository } from '../matchmaking/matchmaking.repository';
import { Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';
import { PublicEnterpriseRepository } from '../enterprises/enterprise.repository';
import { Enterprise } from '../enterprises/enterprise.domain';
import { MatchmakingService } from './matchmaking.service';


@injectable()
export class EnterpriseMatchmakingService extends MatchmakingService<Enterprise> {

  constructor(filtersRepository: EnterpriseFiltersRepository,
    enterpriseRepository: PublicEnterpriseRepository,
    countriesService: CountriesService,
    notifications: NotificationService) {
    super(filtersRepository, enterpriseRepository, countriesService, notifications)
  }

  createNotification(filter: FiltersEntity, obj: Enterprise): Notification {
    return companyMatched(plainId(obj), obj.companyName, filter.label);
  }

  isMatched(filters: Filters, ent: Enterprise) {
    const businessFields = filters['business-field']?.map(f => f.value as string) || [];
    const companyCountries = filters['company-region']?.flatMap(f => this.toCountries(f)) || [];
    const projectCountries = filters['project-region']?.flatMap(f => this.toCountries(f)) || [];
    const profileUpdatedAgo = filters['profile-updates']?.[0]?.value || 0;

    if (businessFields.length == 0 && companyCountries.length == 0 && projectCountries.length == 0 && profileUpdatedAgo == 0) {
      console.warn('Trying to apply empty filters', filters);
      return false;
    }

    let match = true;

    if (match && businessFields.length > 0) {
      match = businessFields.some(id => ent.categoryIds?.includes(id));
    }

    if (match && companyCountries.length > 0) {
      match = companyCountries.some(country => ent.location?.country === country);
    }

    if (match && projectCountries.length > 0) {
      match = projectCountries.some(country => ent.keyProjects?.some(p => p.location?.country === country));
    }

    if (match && profileUpdatedAgo) {
      match = moment().subtract(profileUpdatedAgo, 'days').startOf('day').isSameOrBefore(ent.changedTs);
    }

    return match;
  }
}