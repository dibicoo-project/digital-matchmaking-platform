import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminRoutingModule } from './admin-routing.module';
import { DomainModule } from '@domain/domain.module';

import { CategoriesEditComponent } from './categories-edit/categories-edit.component';
import { CategoriesEditDetailsComponent } from './categories-edit-details/categories-edit-details.component';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { EnterpriseDetailsComponent } from './enterprises/enterprise-details/enterprise-details.component';

import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';

import { DiBiCooMaterialModule } from '../material.module';
import { SendNotificationsComponent } from './notifications/send-notifications/send-notifications.component';


@NgModule({
  declarations: [
    CategoriesEditComponent,
    CategoriesEditDetailsComponent,
    EnterpriseListComponent,
    EnterpriseDetailsComponent,
    ApplicationListComponent,
    ApplicationDetailsComponent,
    SendNotificationsComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    DiBiCooMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    DomainModule,
  ]
})
export class AdminModule { }
