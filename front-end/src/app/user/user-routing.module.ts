import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { EnterpriseShareComponent } from './enterprises/enterprise-share/enterprise-share.component';
import { EnterpriseInviteComponent } from './enterprises/enterprise-invite/enterprise-invite.component';
import { ApplicationWizardComponent } from './applications/application-wizard/application-wizard.component';
import { EnterpriseWizardComponent } from './enterprises/enterprise-wizard/enterprise-wizard.component';
import { NotificationListComponent } from './notifications/notification-list/notification-list.component';
import { EnterpriseStatisticsComponent } from './enterprises/enterprise-statistics/enterprise-statistics.component';
import { EnterpriseSavedMatchmakingComponent } from './enterprises/enterprise-saved-matchmaking/enterprise-saved-matchmaking.component';
import { EnterpriseWatchlistComponent } from './enterprises/enterprise-watchlist/enterprise-watchlist.component';
import { myCompaniesTour, addCompaniesTour, myOpportunitiesTour, addOpportunitiesTour, shareCompaniesTour } from '@domain/tours';
import { NotificationSettingsComponent } from './notifications/notification-settings/notification-settings.component';
import { ApplicationSavedMatchmakingComponent } from './applications/application-saved-matchmaking/application-saved-matchmaking.component';

const routes: Routes = [
  {
    path: 'enterprises',
    children: [
      {
        path: '',
        component: EnterpriseListComponent,
        data: {
          tour: myCompaniesTour
        }
      },
      {
        path: 'watchlist',
        component: EnterpriseWatchlistComponent
      },
      {
        path: 'matchmaking',
        component: EnterpriseSavedMatchmakingComponent
      },
      {
        path: ':enterpriseId',
        component: EnterpriseWizardComponent,
        data: {
          tour: addCompaniesTour
        }
      },
      {
        path: ':enterpriseId/share',
        component: EnterpriseShareComponent,
        data: {
          tour: shareCompaniesTour
        }
      },
      {
        path: 'invite/:id',
        component: EnterpriseInviteComponent
      },
      {
        path: ':enterpriseId/statistics',
        component: EnterpriseStatisticsComponent
      },
    ]
  },
  {
    path: 'applications',
    children: [
      {
        path: 'matchmaking',
        component: ApplicationSavedMatchmakingComponent
      },
      {
        path: ':applicationId',
        component: ApplicationWizardComponent,
        data: {
          tour: addOpportunitiesTour
        }
      },
      {
        path: '',
        component: ApplicationListComponent,
        data: {
          tour: myOpportunitiesTour
        }
      },
    ]
  },
  {
    path: 'notifications',
    children: [
      {
        path: 'settings',
        component: NotificationSettingsComponent
      },
      {
        path: '',
        component: NotificationListComponent
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
