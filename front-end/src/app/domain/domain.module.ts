import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CategoryService } from './categories/category.service';
import { EnterpriseService } from './enterprises/enterprise.service';
import { DialogComponent } from './dialog/dialog.component';

import { ApplicationService } from './applications/application.service';
import { DialogService } from './dialog.service';
import { ApplicationCardComponent } from './applications/application-card/application-card.component';
import { RouterModule } from '@angular/router';
import { LocationTextComponent } from './location/location-text/location-text.component';
import { SvgAvatarComponent } from './svg-avatar/svg-avatar.component';
import { EnterpriseCardComponent } from './enterprises/enterprise-card/enterprise-card.component';
import { CategoryTreeSelectComponent } from './categories/category-tree-select/category-tree-select.component';
import { DiBiCooMaterialModule } from '../material.module';
import { CacheService } from './cache.service';
import { ImageAvatarComponent } from './image-avatar/image-avatar.component';
import { CountrySelectComponent } from './countries/country-select/country-select.component';
import { CountriesService } from './countries/countries.service';
import { ScrollToInvalidControlDirective } from './directives/scroll-to-invalid-control.directive';
import { ContactListComponent } from './contacts/contact-list/contact-list.component';
import { ContactItemComponent } from './contacts/contact-item/contact-item.component';
import { ContactEditDialogComponent } from './contacts/contact-edit-dialog/contact-edit-dialog.component';
import { LocationInputComponent } from './location/location-input/location-input.component';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { DateTimePipe } from './pipes/date-time.pipe';
import { NotificationService } from './notifications/notification.service';
import { EnterpriseListPagedComponent } from './enterprises/enterprise-list-paged/enterprise-list-paged.component';
import { TrackingService } from './tracking.service';
import { MultilineTextComponent } from './multiline-text/multiline-text.component';
import { AttachmentListComponent } from './attachments/attachment-list/attachment-list.component';
import { AttachmentEditDialogComponent } from './attachments/attachment-edit-dialog/attachment-edit-dialog.component';
import { AttachmentService } from './attachments/attachment.service';
import { TourComponent } from './tour/tour.component';
import { DiBiCooCookieService } from './dibicoo-cookie.service';
import { CategoryTreeComponent } from './categories/category-tree/category-tree.component';
import { ContactDialogComponent } from './contacts/contact-dialog/contact-dialog.component';
import { ContactsService } from './contacts/contacts.service';
import { FixNewLinesPipe } from './pipes/fix-new-lines.pipe';
import { EnterpriseWatchlistService } from './enterprises/enterprise-watchlist.service';
import { CategoryChartComponent } from './categories/category-chart/category-chart.component';
import { BackButtonDirective } from './back-button.directive';

@NgModule({
  declarations: [
    DialogComponent,
    ApplicationCardComponent,
    LocationTextComponent,
    LocationInputComponent,
    SvgAvatarComponent,
    EnterpriseCardComponent,
    EnterpriseListPagedComponent,
    CategoryTreeSelectComponent,
    CategoryTreeComponent,
    CategoryChartComponent,
    ImageAvatarComponent,
    CountrySelectComponent,
    ScrollToInvalidControlDirective,
    ContactListComponent,
    ContactItemComponent,
    ContactEditDialogComponent,
    ContactDialogComponent,
    TimeAgoPipe,
    DateTimePipe,
    FixNewLinesPipe,
    MultilineTextComponent,
    AttachmentListComponent,
    AttachmentEditDialogComponent,
    TourComponent,
    BackButtonDirective
  ],
  exports: [
    ApplicationCardComponent,
    EnterpriseCardComponent,
    EnterpriseListPagedComponent,
    LocationTextComponent,
    LocationInputComponent,
    SvgAvatarComponent,
    CategoryTreeSelectComponent,
    CategoryTreeComponent,
    CategoryChartComponent,
    ImageAvatarComponent,
    CountrySelectComponent,
    ScrollToInvalidControlDirective,
    ContactListComponent,
    ContactItemComponent,
    ContactDialogComponent,
    TimeAgoPipe,
    DateTimePipe,
    FixNewLinesPipe,
    MultilineTextComponent,
    AttachmentListComponent,
    TourComponent,
    BackButtonDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DiBiCooMaterialModule
  ]
})
export class DomainModule {
  static forRoot(): ModuleWithProviders<DomainModule> {
    return {
      ngModule: DomainModule,
      providers: [
        CategoryService,
        EnterpriseService,
        EnterpriseWatchlistService,
        ApplicationService,
        DialogService,
        CacheService,
        CountriesService,
        NotificationService,
        TrackingService,
        AttachmentService,
        DiBiCooCookieService,
        ContactsService,
        { provide: 'LOCATION', useFactory: () => window.location }
      ]
    };
  }
}
