import { Container } from 'inversify';
import { jwtCheck, AUTH_CHECK } from './security/jwtUtils';

import { Datastore } from '@google-cloud/datastore';
import { Storage } from '@google-cloud/storage';

import { EnterpriseRepository, PublicEnterpriseRepository } from './enterprises/enterprise.repository';
import { EnterpriseWatchlistRepository } from './enterprises/enterprise-watchlist.repository';
import { EnterpriseService } from './enterprises/enterprise.service';
import { EnterpriseWatchlistService } from './enterprises/enterprise-watchlist.service';
import { EnterpriseShareService } from './enterprises/enterprise-share.service';
import { EnterpriseCronService } from './enterprises/enterprise-cron.service';
import { CategoryRepository } from './categories/category.repository';
import { CategoryService } from './categories/category.service';
import { ApplicationService } from './applications/application.service';
import { ApplicationRepository, PublicApplicationRepository } from './applications/application.repository';
import { KnowledgeBaseService } from './knowledge-base/knowledge-base.service';
import { InvitationRepository } from './enterprises/invitation.repository';
import { Auth0UsersService } from './auth0-users/auth0-users.service';
import { CountriesService } from './countries/countries.service';
import { ApplicationFiltersRepository, EnterpriseFiltersRepository } from './matchmaking/matchmaking.repository';
import { ApplicationFiltersService, EnterpriseFiltersService } from './matchmaking/filters.service';
import { EnterpriseMatchmakingService } from './matchmaking/enterprise-matchmaking.service';
import { ApplicationMatchmakingService } from './matchmaking/application-matchmaking.service';
import { MatchmakingFacade } from './matchmaking/matchmaking.facade';

import Axios, { AxiosStatic } from 'axios';
import NodeCache from 'node-cache';
import { ImageService } from './common/image.service';
import { GeocodeService } from './common/geocode.service';
import { EnvService } from './common/environment.service';
import { NotificationService } from './notifications/notification.service';
import { NotificationRepository } from './notifications/notification.repository';
import { AttachmentService } from './attachments/attachment.service';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsRepository } from './analytics/analytics.repository';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { ContactsService } from './contacts/contacts.service';
import { SearchService } from './search/search.service';
import { EmailService } from './emails/email.service';
import * as mailjet from "node-mailjet";

// TODO: implement better scope handling
// Problem: @injectHttpContext is not working for singleton controllers
export const bindServices = (container: Container) => {
  container.bind(AUTH_CHECK).toConstantValue(jwtCheck());

  // Utils
  container.bind<AxiosStatic>('axios').toConstantValue(Axios);
  container.bind(NodeCache).toConstantValue(new NodeCache({ useClones: false }));
  container.bind(ImageService).toConstantValue(new ImageService());
  container.bind(GeocodeService).toSelf().inSingletonScope();
  container.bind(EnvService).toSelf().inSingletonScope();
  container.bind(EmailService).toSelf().inSingletonScope();
  container.bind('mailjet').toConstantValue(mailjet)

  // Google services
  container.bind(Datastore).toConstantValue(new Datastore());
  container.bind(Storage).toConstantValue(new Storage());
  container.bind(BetaAnalyticsDataClient).toConstantValue(new BetaAnalyticsDataClient());

  // Repositories
  container.bind(ApplicationRepository).toSelf().inSingletonScope();
  container.bind(PublicApplicationRepository).toSelf().inSingletonScope();
  container.bind(ApplicationFiltersRepository).toSelf().inSingletonScope();

  container.bind(EnterpriseRepository).toSelf().inSingletonScope();
  container.bind(PublicEnterpriseRepository).toSelf().inSingletonScope();
  container.bind(EnterpriseFiltersRepository).toSelf().inSingletonScope();
  container.bind(EnterpriseWatchlistRepository).toSelf().inSingletonScope();
  container.bind(InvitationRepository).toSelf().inSingletonScope();

  container.bind(CategoryRepository).toSelf().inSingletonScope();
  container.bind(NotificationRepository).toSelf().inSingletonScope();
  container.bind(AnalyticsRepository).toSelf().inSingletonScope();

  // Services
  container.bind(Auth0UsersService).toSelf().inSingletonScope();
  container.bind(CategoryService).toSelf().inSingletonScope();

  container.bind(EnterpriseService).toSelf().inSingletonScope();
  container.bind(EnterpriseFiltersService).toSelf().inSingletonScope();
  container.bind(EnterpriseShareService).toSelf().inSingletonScope();
  container.bind(EnterpriseWatchlistService).toSelf().inSingletonScope();
  container.bind(EnterpriseCronService).toSelf().inSingletonScope();

  container.bind(ApplicationService).toSelf().inSingletonScope();
  container.bind(ApplicationFiltersService).toSelf().inSingletonScope();

  container.bind(EnterpriseMatchmakingService).toSelf().inSingletonScope();
  container.bind(ApplicationMatchmakingService).toSelf().inSingletonScope();
  container.bind(MatchmakingFacade).toSelf().inSingletonScope();

  container.bind(KnowledgeBaseService).toSelf().inSingletonScope();
  container.bind(CountriesService).toSelf().inSingletonScope();
  container.bind(NotificationService).toSelf().inSingletonScope();
  container.bind(AttachmentService).toSelf().inSingletonScope();
  container.bind(AnalyticsService).toSelf().inSingletonScope();
  container.bind(ContactsService).toSelf().inSingletonScope();
  container.bind(SearchService).toSelf().inSingletonScope();
};
