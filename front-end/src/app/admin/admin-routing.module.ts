import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoriesEditComponent } from './categories-edit/categories-edit.component';
import { CategoriesEditDetailsComponent } from './categories-edit-details/categories-edit-details.component';
import { EnterpriseListComponent } from './enterprises/enterprise-list/enterprise-list.component';
import { EnterpriseDetailsComponent } from './enterprises/enterprise-details/enterprise-details.component';
import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';
import { SendNotificationsComponent } from './notifications/send-notifications/send-notifications.component';

const routes: Routes = [
  {
    path: 'categories',
    children: [
      {
        path: '',
        component: CategoriesEditComponent
      },
      {
        path: 'new',
        component: CategoriesEditDetailsComponent,
        data: {
          isNew: true
        }
      },
      {
        path: ':categoryId/new',
        component: CategoriesEditDetailsComponent,
        data: {
          isNew: true
        }
      },
      {
        path: ':categoryId',
        component: CategoriesEditDetailsComponent
      }
    ]
  },
  {
    path: 'enterprises',
    children: [
      {
        path: '',
        component: EnterpriseListComponent
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
        path: '',
        component: ApplicationListComponent
      },
      {
        path: ':applicationId',
        component: ApplicationDetailsComponent
      }
    ]
  },
  {
    path: 'notifications',
    children: [
      {
        path: 'send',
        component: SendNotificationsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
