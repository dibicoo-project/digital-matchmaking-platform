import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { EnterprisesGlobalMapComponent } from './enterprises/enterprises-global-map/enterprises-global-map.component';
import { EnterpriseDetailsComponent } from './enterprises/enterprise-details/enterprise-details.component';
import { EnterpriseInviteComponent } from './enterprises/enterprise-invite/enterprise-invite.component';
import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';
import { EnterpriseMatchmakingComponent } from './enterprises/enterprise-matchmaking/enterprise-matchmaking.component';
import { enterpriseMatchmakingTour, enterprisesTour, applicationTour } from '@domain/tours';
import { ApplicationMatchmakingComponent } from './applications/application-matchmaking/application-matchmaking.component';

const routes: Routes = [
  {
    path: 'enterprises',
    children: [
      {
        path: '',
        component: EnterpriseListComponent,
        data: {
          tour: enterprisesTour
        }
      },
      {
        path: 'globalmap',
        component: EnterprisesGlobalMapComponent,
        data: {
          fullWidth: true
        }
      },
      {
        path: 'matchmaking',
        component: EnterpriseMatchmakingComponent,
        data: {
          tour: enterpriseMatchmakingTour
        }
      },
      {
        path: 'invite/:id',
        component: EnterpriseInviteComponent
      },
      {
        path: ':enterpriseId',
        component: EnterpriseDetailsComponent
      }
    ]
  },
  {
    path: 'applications',
    children: [
      {
        path: 'list',
        component: ApplicationListComponent,
        data: {
          tour: applicationTour
        }
      },
      {
        path: '',
        component: ApplicationMatchmakingComponent,
        data: {
        }
      },
      {
        path: ':applicationId',
        component: ApplicationDetailsComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
