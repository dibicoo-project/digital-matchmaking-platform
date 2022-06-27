import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PublicRoutingModule } from './public-routing.module';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { EnterpriseDetailsComponent } from './enterprises/enterprise-details/enterprise-details.component';
import { EnterprisesGlobalMapComponent } from './enterprises/enterprises-global-map/enterprises-global-map.component';

import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';
import { DomainModule } from '@domain/domain.module';
import { EnterpriseInviteComponent } from './enterprises/enterprise-invite/enterprise-invite.component';
import { DiBiCooMaterialModule } from '../material.module';
import { EnterpriseMatchmakingComponent } from './enterprises/enterprise-matchmaking/enterprise-matchmaking.component';
import { ApplicationMatchmakingComponent } from './applications/application-matchmaking/application-matchmaking.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchService } from './search/search.service';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '@root/environments/environment';


@NgModule({
  declarations: [
    EnterpriseListComponent,
    EnterpriseDetailsComponent,
    EnterprisesGlobalMapComponent,
    ApplicationListComponent,
    ApplicationDetailsComponent,
    EnterpriseInviteComponent,
    EnterpriseMatchmakingComponent,
    ApplicationMatchmakingComponent,
    SearchResultsComponent
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    DiBiCooMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DomainModule
  ],
  providers: [
    SearchService,
    {
      provide: Loader,
      useFactory: () => new Loader({ apiKey: environment.googleApiKey })
    }
  ]
})
export class PublicModule { }
