import { injectable } from "inversify";
import { Enterprise } from "../enterprises/enterprise.domain";
import { Application } from "../applications/application.domain";
import { ApplicationMatchmakingService } from "./application-matchmaking.service";
import { EnterpriseMatchmakingService } from "./enterprise-matchmaking.service";
import { Filters } from "./matchmaking.domain";
import { NotificationService } from "../notifications/notification.service";
import { applicationMatchedToCompany } from "../notifications/notification.templates";
import { plainId } from "../utils/transform-datastore-id";

@injectable()
export class MatchmakingFacade {

  constructor(
    private applications: ApplicationMatchmakingService,
    private enterprises: EnterpriseMatchmakingService,
    private notifications: NotificationService
  ) { }

  async matchApplicationToFilters(app: Application) {
    await this.applications.matchFiltersAndNotify(app);
  }

  async matchApplicationToEnterprises(app: Application) {
    const filters: Filters = { 'business-field': [{ type: 'categoryId', value: app.categoryId }] };
    const companies = await this.enterprises.filterObjects(filters);

    const promises = companies.map(async one => {
      return await this.notifications.add(
        applicationMatchedToCompany(plainId(app), plainId(one), one.companyName),
        ...one.owners
      );
    });

    await Promise.all(promises);
  }

  async matchEnterpriseToFilters(ent: Enterprise) {
    await this.enterprises.matchFiltersAndNotify(ent);
  }

  matchEnterpriseToApplications(ent: Enterprise) {
    throw new Error("Not implemented yet!")
  }
}