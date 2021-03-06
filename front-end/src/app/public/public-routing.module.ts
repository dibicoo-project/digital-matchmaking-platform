import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { EnterprisesGlobalMapComponent } from './enterprises/enterprises-global-map/enterprises-global-map.component';
import { EnterpriseDetailsComponent } from './enterprises/enterprise-details/enterprise-details.component';
import { EnterpriseInviteComponent } from './enterprises/enterprise-invite/enterprise-invite.component';
import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';
import { EnterpriseMatchmakingComponent } from './enterprises/enterprise-matchmaking/enterprise-matchmaking.component';
import { enterpriseMatchmakingTour, enterprisesTour, enterpriseTour, applicationsTour } from '@domain/tours';
import { ApplicationMatchmakingComponent } from './applications/application-matchmaking/application-matchmaking.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';

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
        component: EnterpriseDetailsComponent,
        data: {
          tour: enterpriseTour
        }
      }
    ]
  },
  {
    path: 'applications',
    children: [
      {
        path: '',
        component: ApplicationMatchmakingComponent,
        data: {
          tour: applicationsTour
        }
      },
      {
        path: ':applicationId',
        component: ApplicationDetailsComponent
      }
    ]
  },
  {
    path: 'search',
    children: [
      {
        path: ':kind',
        component: SearchResultsComponent,
        data: {
          hideSearch: true
        }
      },
      {
        path: '',
        redirectTo: 'all'
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
