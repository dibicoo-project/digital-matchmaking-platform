
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../environments/environment';

import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { DomainModule } from './domain/domain.module';
import { AuthModule } from './auth/auth.module';
import { DiBiCooMaterialModule } from './material.module';
import { Router, Scroll, Event } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    DiBiCooMaterialModule,
    DomainModule.forRoot(),
    AuthModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(router: Router, scroller: ViewportScroller) {
    router.events.pipe(
      filter((e: Event): e is Scroll => e instanceof Scroll)
    ).subscribe(e => {
      if (e.position) {
        // backward navigation
        scroller.scrollToPosition(e.position);
      } else if (e.anchor) {
        // anchor navigation
        // wait a moment while content appears
        // bug: https://github.com/angular/angular/issues/30139
        setTimeout(() => scroller.scrollToAnchor(e.anchor), 100);
      } else {
        // forward navigation
        const noScroll = router.getCurrentNavigation().extras.state?.noScroll;
        if (!noScroll) {
          scroller.scrollToPosition([0, 0]);
        }
      }
    });
  }
}
