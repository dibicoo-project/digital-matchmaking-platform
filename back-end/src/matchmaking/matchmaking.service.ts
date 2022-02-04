import { injectable } from 'inversify';
import { plainId } from '../utils/transform-datastore-id';
import { CountriesService } from '../countries/countries.service';
import { NotificationService } from '../notifications/notification.service';
import { Notification } from '../notifications/notification.domain';
import { FiltersRepository } from '../matchmaking/matchmaking.repository';
import { FilterDefinition, Filters, FiltersEntity } from '../matchmaking/matchmaking.domain';


interface ObjectRepository<T> {
  findAll(): Promise<T[]>;
}

@injectable()
export abstract class MatchmakingService<T> {
  private countries: any[];

  constructor(protected filtersRepository: FiltersRepository,
    protected objectRepository: ObjectRepository<T>,
    private countriesService: CountriesService,
    protected notifications: NotificationService) { }

  protected async maybeFetchCountries() {
    if (!this.countries) {
      this.countries = await this.countriesService.getCountries() || [];
    }
  }

  protected toCountries(filter: FilterDefinition) {
    if (filter.type === 'country') {
      return [filter.value];
    } else {
      return this.countries?.filter(c => c[filter.type] === filter.value).map(c => c.name);
    }
  }

  abstract isMatched(filters: Filters, obj: T): boolean;
  abstract createNotification(filter: FiltersEntity, obj: T): Notification;

  public async matchFiltersAndNotify(obj: T): Promise<void> {
    await this.maybeFetchCountries();

    const objId = plainId(obj);
    const all = await this.filtersRepository.findAll();

    const list = all.filter(one => {
      if (one.objectIds?.includes(objId)) {
        return false;
      }

      return this.isMatched(one.filters, obj);
    });

    list.forEach(async one => {
      await this.filtersRepository.update({ ...one, objectIds: [...one.objectIds || [], objId] }, plainId(one));
      await this.notifications.add(this.createNotification(one, obj), one.owner);
    });
  }

  public async filterObjects(filters: Filters): Promise<T[]> {
    await this.maybeFetchCountries();
    const list = await this.objectRepository.findAll();

    return list.filter(one => this.isMatched(filters, one));
  }
}