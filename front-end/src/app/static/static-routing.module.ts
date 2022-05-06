import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FrontPageComponent } from './front-page/front-page.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DevelopmentComponent } from './development/development.component';
import { FgpComponent } from './fgp/fgp.component';
import { FaqComponent } from './faq/faq.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  {
    path: 'old',
    component: FrontPageComponent,
    data: {
      hideSidebar: true
    }
  },
  {
    path: '',
    component: LandingPageComponent,
    data: {
      hideSidebar: true
    }
  },
  {
    path: 'imprint',
    component: ImprintComponent,
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'development',
    component: DevelopmentComponent,
  },

  {
    path: 'fgp',
    component: FgpComponent,
  },

  {
    path: 'faq',
    component: FaqComponent,
  },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaticRoutingModule { }
