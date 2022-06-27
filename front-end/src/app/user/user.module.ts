import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserRoutingModule } from './user-routing.module';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';

import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { DomainModule } from '@domain/domain.module';
import { EnterpriseShareComponent } from './enterprises/enterprise-share/enterprise-share.component';
import { EnterpriseInviteComponent } from './enterprises/enterprise-invite/enterprise-invite.component';
import { DiBiCooMaterialModule } from '../material.module';
import { ApplicationWizardComponent } from './applications/application-wizard/application-wizard.component';
import { EnterpriseWizardComponent } from './enterprises/enterprise-wizard/enterprise-wizard.component';
import { NotificationListComponent } from './notifications/notification-list/notification-list.component';
import { CategorySelectComponent } from './applications/application-wizard/category-select/category-select.component';
import { EnterpriseStatisticsComponent } from './enterprises/enterprise-statistics/enterprise-statistics.component';
import { EnterpriseSavedMatchmakingComponent } from './enterprises/enterprise-saved-matchmaking/enterprise-saved-matchmaking.component';
import { EnterpriseWatchlistComponent } from './enterprises/enterprise-watchlist/enterprise-watchlist.component';
import { NotificationSettingsComponent } from './notifications/notification-settings/notification-settings.component';
import { ApplicationSavedMatchmakingComponent } from './applications/application-saved-matchmaking/application-saved-matchmaking.component';


const originFactory = () => window.location.origin;

@NgModule({
  declarations: [
    EnterpriseListComponent,
    ApplicationListComponent,
    EnterpriseShareComponent,
    EnterpriseInviteComponent,
    ApplicationWizardComponent,
    EnterpriseWizardComponent,
    NotificationListComponent,
    CategorySelectComponent,
    EnterpriseStatisticsComponent,
    EnterpriseSavedMatchmakingComponent,
    EnterpriseWatchlistComponent,
    NotificationSettingsComponent,
    ApplicationSavedMatchmakingComponent
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    DiBiCooMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DomainModule
  ],
  providers: [
    { provide: 'ORIGIN', useFactory: originFactory }
  ]
})
export class UserModule { }
