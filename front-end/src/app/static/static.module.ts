import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiBiCooMaterialModule } from '../material.module';
import { StaticRoutingModule } from './static-routing.module';
import { FrontPageComponent } from './front-page/front-page.component';
import { AboutComponent } from './about/about.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DevelopmentComponent } from './development/development.component';
import { FgpComponent } from './fgp/fgp.component';
import { FaqComponent } from './faq/faq.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { IvyCarouselModule } from 'angular-responsive-carousel';


@NgModule({
  declarations: [
    FrontPageComponent,
    AboutComponent,
    ImprintComponent,
    PrivacyComponent,
    ContactUsComponent,
    DevelopmentComponent,
    FgpComponent,
    FaqComponent,
    LandingPageComponent
  ],
  imports: [
    CommonModule,
    DiBiCooMaterialModule,
    StaticRoutingModule,
    IvyCarouselModule
  ]
})
export class StaticModule { }
