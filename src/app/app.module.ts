import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HostComponent } from './host/host.component';
import { JoinComponent } from './join/join.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { GameviewComponent } from './gameview/gameview.component';

@NgModule({
  declarations: [
    AppComponent,
    HostComponent,
    JoinComponent,
    WelcomeComponent,
    PageNotFoundComponent,
    GameviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
